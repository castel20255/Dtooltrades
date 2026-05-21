import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing keyId' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: accessKey } = await supabase
      .from('access_keys')
      .select('user_id')
      .eq('id', keyId)
      .single()

    if (!accessKey || accessKey.user_id !== user.id) {
      return NextResponse.json(
        { error: 'License not found or unauthorized' },
        { status: 404 }
      )
    }

    // Revoke the key
    const { error: revokeError } = await supabase
      .from('access_keys')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', keyId)

    if (revokeError) {
      console.error('Error revoking key:', revokeError)
      return NextResponse.json(
        { error: 'Failed to revoke license' },
        { status: 500 }
      )
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'license_revoked',
      resource_type: 'access_key',
      resource_id: keyId,
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      message: 'License revoked successfully',
    })
  } catch (error) {
    console.error('Error revoking license:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
