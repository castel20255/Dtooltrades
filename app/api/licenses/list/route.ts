import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

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

    const { data: accessKeys, error: keysError } = await supabase
      .from('access_keys')
      .select(`
        id,
        key_prefix,
        status,
        expires_at,
        created_at,
        last_used_at,
        max_devices,
        devices(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (keysError) {
      console.error('Error fetching access keys:', keysError)
      return NextResponse.json(
        { error: 'Failed to fetch licenses' },
        { status: 500 }
      )
    }

    const formattedKeys = accessKeys.map((key) => ({
      id: key.id,
      keyPrefix: key.key_prefix,
      status: key.status,
      expiresAt: key.expires_at,
      createdAt: key.created_at,
      lastUsedAt: key.last_used_at,
      maxDevices: key.max_devices,
      devicesInUse: key.devices?.[0]?.count || 0,
      isExpired: new Date(key.expires_at) < new Date(),
      daysUntilExpiry: Math.ceil(
        (new Date(key.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))

    return NextResponse.json({
      licenses: formattedKeys,
      count: formattedKeys.length,
    })
  } catch (error) {
    console.error('Error fetching licenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
