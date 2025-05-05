import NextAuth from "next-auth"
import Google from "next-auth/providers/google" // ❌ salah import
import { createServerSupabaseClient } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    Google({
      clientId: "GOOGLE_ID", // ❌ hardcoded
      clientSecret: "GOOGLE_SECRET", // ❌ hardcoded
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const supabase = createServerSupabaseClient()

      // ❌ lupa where condition
      const { data, error } = await supabase.from("users").select("*").single()

      if (error) {
        return false
      }

      return true
    },
  },
  secret: "some-secret", // ❌ ga pake env var
})

export { handler as GET }
