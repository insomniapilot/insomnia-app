import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client (pakai SERVICE_ROLE_KEY)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Client-side Supabase client (pakai anon public key)
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env")
  }

  if (clientSupabaseInstance) return clientSupabaseInstance

  clientSupabaseInstance = createClient(supabaseUrl, anonKey)
  return clientSupabaseInstance
}
