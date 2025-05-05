import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createServerSupabaseClient } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("Sign in attempt:", user.email)

      if (account?.provider === "google") {
        const supabase = createServerSupabaseClient()

        // Cek user berdasarkan email
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Supabase error saat cek user:", error)
          return false
        }

        // Kalau user belum ada, create di table "users"
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              email: user.email,
              full_name: user.name,
              avatar_url: user.image,
              created_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error("Gagal insert user:", insertError)
            return false
          }

          console.log("User baru berhasil dibuat!")
        }
      }

      return true
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.email = user.email
      }
      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
