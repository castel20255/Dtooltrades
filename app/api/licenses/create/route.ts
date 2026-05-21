import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
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

    // Generate unique license key
    const rawKey = crypto.randomBytes(32).toString('hex')
    const keyHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex')
    const keyPrefix = rawKey.substring(0, 8)

    // Set expiration to 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: accessKey, error: createError } = await supabase
      .from('access_keys')
      .insert({
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        status: 'active',
        max_devices: 3,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating access key:', createError)
      return NextResponse.json(
        { error: 'Failed to create license key' },
        { status: 500 }
      )
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'license_created',
      resource_type: 'access_key',
      resource_id: accessKey.id,
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      key: rawKey,
      keyPrefix: keyPrefix,
      expiresAt: accessKey.expires_at,
      message: 'License key created successfully. Save the full key - it will not be shown again!',
    })
  } catch (error) {
    console.error('License creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
