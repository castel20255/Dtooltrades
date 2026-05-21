import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface CallbackMetadata {
  resultCode?: number
  resultDesc?: string
  checkoutRequestID?: string
  merchantRequestID?: string
  amount?: number
  mpesaReceiptNumber?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json() as { Body?: { stkCallback?: { CallbackMetadata?: { Item?: Array<{ Key?: string; Value?: string }> } } } }

    const callbackData = body.Body?.stkCallback
    if (!callbackData) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'No callback data' },
        { status: 400 }
      )
    }

    const metadata: CallbackMetadata = {}
    if (callbackData.CallbackMetadata?.Item) {
      callbackData.CallbackMetadata.Item.forEach((item) => {
        if (item.Key === 'Amount') metadata.amount = Number(item.Value)
        if (item.Key === 'MpesaReceiptNumber') metadata.mpesaReceiptNumber = item.Value
        if (item.Key === 'TransactionDate') metadata.resultDesc = item.Value
        if (item.Key === 'PhoneNumber') metadata.resultDesc = item.Value
      })
    }

    // Extract from the callback
    const resultCode = callbackData.ResultCode
    const resultDesc = callbackData.ResultDesc
    const checkoutRequestID = callbackData.CheckoutRequestID
    const merchantRequestID = callbackData.MerchantRequestID

    // Find payment by checkout request ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, amount_cents')
      .eq('mpesa_checkout_request_id', checkoutRequestID)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', checkoutRequestID)
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Payment not found' },
        { status: 404 }
      )
    }

    if (resultCode === 0) {
      // Payment successful
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          mpesa_result_code: String(resultCode),
          mpesa_result_desc: resultDesc,
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating payment:', updateError)
        return NextResponse.json(
          { ResultCode: 1, ResultDesc: 'Failed to update payment' },
          { status: 500 }
        )
      }

      // Create license key for the user
      const rawKey = crypto.randomBytes(32).toString('hex')
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
      const keyPrefix = rawKey.substring(0, 8)

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const { error: keyError } = await supabase
        .from('access_keys')
        .insert({
          user_id: payment.user_id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          status: 'active',
          max_devices: 3,
          expires_at: expiresAt.toISOString(),
        })

      if (keyError) {
        console.error('Error creating access key:', keyError)
      }

      // Log successful payment
      await supabase.from('audit_logs').insert({
        user_id: payment.user_id,
        action: 'payment_received',
        resource_type: 'payment',
        resource_id: payment.id,
        status: 'success',
      })

      // Send notification
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Your payment has been processed successfully. Your new license is ready to use.',
        data: { amount: payment.amount_cents / 100, currency: 'KES' },
      })

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Payment processed successfully',
      })
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          mpesa_result_code: String(resultCode),
          mpesa_result_desc: resultDesc,
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating failed payment:', updateError)
      }

      // Log failed payment
      await supabase.from('audit_logs').insert({
        user_id: payment.user_id,
        action: 'payment_failed',
        resource_type: 'payment',
        resource_id: payment.id,
        status: 'failure',
        error_message: resultDesc,
      })

      // Send notification
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment failed: ${resultDesc}. Please try again.`,
        data: { resultCode, resultDesc },
      })

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Payment failure recorded',
      })
    }
  } catch (error) {
    console.error('MPESA callback error:', error)
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Internal server error' },
      { status: 500 }
    )
  }
}
