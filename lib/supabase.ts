import { createClient } from "@supabase/supabase-js"

// SALAH: lupa import env vars dan salah nama variabel
export const createServerSupabaseClient = () => {
  return createClient("SUPABASE_URL", "SUPABASE_SERVICE_ROLE") // ❌ ini bukan env var
}

let client: any = null // ❌ kurang type & pengecekan

export const createClientSupabaseClient = () => {
  if (client) return client

  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return client
}
