import { createClient } from "@supabase/supabase-js"

// Untuk server-side (admin access)
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Jangan pernah expose key ini ke client
  )
}

// Untuk client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientInstance) return clientInstance

  clientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return clientInstance
}
