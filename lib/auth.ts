import { createClientSupabaseClient } from "./supabase"

export async function signUp(email: string, password: string, username: string, fullName?: string) {
  const supabase = createClientSupabaseClient()

  // 1. Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error("Failed to create user")

  // 2. Tambahkan user ke tabel users
  const { error: insertError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    username,
    full_name: fullName || null,
  })

  if (insertError) throw insertError

  return authData.user
}

export async function signIn(email: string, password: string) {
  const supabase = createClientSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

export async function signOut() {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createClientSupabaseClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) return null

  // Get user data from the database
  const { data: userData, error } = await supabase.from("users").select("*").eq("id", data.session.user.id).single()

  if (error || !userData) return data.session.user

  return {
    ...data.session.user,
    username: userData.username,
    full_name: userData.full_name,
    avatar_url: userData.avatar_url,
  }
}
