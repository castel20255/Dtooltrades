import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { key, deviceFingerprint } = await request.json()

    if (!key || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Hash the provided key
    const keyHash = crypto
      .createHash('sha256')
      .update(key)
      .digest('hex')

    // Find the access key
    const { data: accessKey, error: keyError } = await supabase
      .from('access_keys')
      .select(`
        id,
        user_id,
        status,
        expires_at,
        max_devices,
        devices(count)
      `)
      .eq('key_hash', keyHash)
      .single()

    if (keyError || !accessKey) {
      // Log failed attempt
      await supabase.from('brute_force_attempts').insert({
        ip_address: clientIP,
        attempt_type: 'key_validation',
        success: false,
      })

      return NextResponse.json(
        { valid: false, reason: 'Invalid license key' },
        { status: 401 }
      )
    }

    // Check if key is revoked
    if (accessKey.status === 'revoked') {
      return NextResponse.json(
        { valid: false, reason: 'License key has been revoked' },
        { status: 401 }
      )
    }

    // Check if key is expired
    if (new Date(accessKey.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, reason: 'License key has expired' },
        { status: 401 }
      )
    }

    // Check device limit
    const deviceCount = accessKey.devices?.[0]?.count || 0
    if (deviceCount >= accessKey.max_devices) {
      return NextResponse.json(
        { valid: false, reason: 'Maximum device limit reached' },
        { status: 401 }
      )
    }

    // Check if device is on blacklist
    const { data: blacklistEntry } = await supabase
      .from('blacklist')
      .select('id')
      .eq('entry_type', 'device')
      .eq('entry_value', deviceFingerprint)
      .single()

    if (blacklistEntry) {
      return NextResponse.json(
        { valid: false, reason: 'Device is blocked' },
        { status: 401 }
      )
    }

    // Check if IP is on blacklist
    const { data: ipBlacklist } = await supabase
      .from('blacklist')
      .select('id')
      .eq('entry_type', 'ip_address')
      .eq('entry_value', clientIP)
      .single()

    if (ipBlacklist) {
      return NextResponse.json(
        { valid: false, reason: 'IP address is blocked' },
        { status: 401 }
      )
    }

    // Register or update device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .upsert({
        user_id: accessKey.user_id,
        access_key_id: accessKey.id,
        device_fingerprint: deviceFingerprint,
        ip_address: clientIP,
        status: 'active',
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_fingerprint,access_key_id'
      })
      .select()
      .single()

    if (deviceError) {
      console.error('Device registration error:', deviceError)
      return NextResponse.json(
        { error: 'Failed to register device' },
        { status: 500 }
      )
    }

    // Update last used timestamp
    await supabase
      .from('access_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', accessKey.id)

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionTokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30-day session

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: accessKey.user_id,
        device_id: device.id,
        access_key_id: accessKey.id,
        session_token_hash: sessionTokenHash,
        ip_address: clientIP,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Log successful attempt
    await supabase.from('brute_force_attempts').insert({
      ip_address: clientIP,
      attempt_type: 'key_validation',
      user_id: accessKey.user_id,
      success: true,
    })

    return NextResponse.json({
      valid: true,
      sessionToken,
      sessionId: session.id,
      expiresAt: session.expires_at,
      message: 'License validated successfully',
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
