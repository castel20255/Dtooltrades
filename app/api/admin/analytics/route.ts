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

    // Get various analytics
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    const { data: licenseCount } = await supabase
      .from('access_keys')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: payments } = await supabase
      .from('payments')
      .select('amount_cents, created_at')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0

    return NextResponse.json({
      analytics: {
        totalUsers: userCount?.length || 0,
        activeLicenses: licenseCount?.length || 0,
        revenue30Days: totalRevenue / 100,
        currency: 'KES',
        activeSessions24h: sessions?.length || 0,
        avgLicensesPerUser: userCount?.length ? licenseCount?.length / userCount.length : 0,
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
