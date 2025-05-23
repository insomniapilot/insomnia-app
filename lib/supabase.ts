import { createClient } from "@supabase/supabase-js"

// Validasi environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Untuk debugging
if (typeof window === "undefined") {
  console.log("Supabase URL exists:", !!supabaseUrl)
  console.log("Supabase Anon Key exists:", !!supabaseAnonKey)
  console.log("Supabase Service Role Key exists:", !!supabaseServiceRoleKey)
}

// Create a single supabase client for server-side usage
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create a client with admin privileges for server operations that need it
export const createServerSupabaseAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create a singleton instance for client-side usage
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side: create a new instance each time
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // Client-side: reuse the instance
  if (clientSupabaseInstance) return clientSupabaseInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseInstance
}
