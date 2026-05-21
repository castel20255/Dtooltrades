import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create a safe client that won't throw during build if env vars are missing
const createSafeClient = (url: string, key: string) => {
  if (!url || !key) {
    // Return a proxy that handles calls gracefully during build
    return new Proxy(
      {},
      {
        get: () => ({
          then: (resolve) => resolve(null),
          catch: () => null,
        }),
      }
    ) as any
  }
  return createClient(url, key)
}

// For client-side components (uses anon key)
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey)

// For server-side APIs (uses service role key to bypass RLS if needed for admin tasks)
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceRoleKey)
