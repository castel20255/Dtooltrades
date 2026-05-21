import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin status
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

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminUser || !['admin', 'moderator'].includes(adminUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Fetch all access keys with device counts
    const { data: accessKeys, error: keysError } = await supabase
      .from('access_keys')
      .select(`
        id,
        user_id,
        key_prefix,
        status,
        expires_at,
        created_at,
        last_used_at,
        max_devices,
        devices(count)
      `)
      .order('created_at', { ascending: false })

    if (keysError) {
      throw keysError
    }

    const formattedKeys = accessKeys.map((key) => ({
      id: key.id,
      user_id: key.user_id,
      key_prefix: key.key_prefix,
      status: key.status,
      expires_at: key.expires_at,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      max_devices: key.max_devices,
      device_count: key.devices?.[0]?.count || 0,
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
