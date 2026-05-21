import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface MPESAConfig {
  businessShortCode: string
  consumerKey: string
  consumerSecret: string
  passkey: string
  callbackUrl: string
}

// In production, these should come from environment variables
const mpesaConfig: MPESAConfig = {
  businessShortCode: process.env.MPESA_BUSINESS_CODE || '',
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  passkey: process.env.MPESA_PASSKEY || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || '',
}

async function getMPESAAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  const data = await response.json() as { access_token: string }
  return data.access_token
}

function generateTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
}

function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  const passwordString = shortCode + passkey + timestamp
  return Buffer.from(passwordString).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { phoneNumber, amount, licenseType } = await request.json()

    if (!phoneNumber || !amount || !licenseType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount (in KES)
    if (amount < 100 || amount > 150000) {
      return NextResponse.json(
        { error: 'Amount must be between 100 and 150,000 KES' },
        { status: 400 }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount_cents: Math.round(amount * 100),
        currency: 'KES',
        payment_method: 'mpesa',
        status: 'pending',
        metadata: { licenseType, phoneNumber },
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Get MPESA access token
    const accessToken = await getMPESAAccessToken()

    // Initiate MPESA STK PUSH
    const timestamp = generateTimestamp()
    const password = generatePassword(
      mpesaConfig.businessShortCode,
      mpesaConfig.passkey,
      timestamp
    )

    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: mpesaConfig.businessShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(amount),
          PartyA: phoneNumber,
          PartyB: mpesaConfig.businessShortCode,
          PhoneNumber: phoneNumber,
          CallBackURL: mpesaConfig.callbackUrl,
          AccountReference: `LICENSE-${payment.id}`,
          TransactionDesc: `License Payment - ${licenseType}`,
        }),
      }
    )

    const stkData = await stkResponse.json() as {
      CheckoutRequestID?: string
      ResponseCode?: string
      ResponseDescription?: string
      MerchantRequestID?: string
    }

    if (stkData.ResponseCode !== '0') {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      return NextResponse.json(
        { error: stkData.ResponseDescription || 'MPESA request failed' },
        { status: 400 }
      )
    }

    // Store checkout request ID
    await supabase
      .from('payments')
      .update({
        mpesa_checkout_request_id: stkData.CheckoutRequestID,
        mpesa_merchant_request_id: stkData.MerchantRequestID,
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: 'STK push initiated. Complete the payment on your phone.',
    })
  } catch (error) {
    console.error('MPESA payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
