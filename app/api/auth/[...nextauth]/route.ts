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
      if (account?.provider === "google" && user.email) {
        const supabase = createServerSupabaseClient()

        // Cek user di tabel `users`
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single()

        if (!existingUser) {
          // Simpen user baru ke tabel
          const { error: insertError } = await supabase.from("users").insert({
            email: user.email,
            full_name: user.name,
            avatar_url: user.image,
          })

          if (insertError) {
            console.error("❌ Gagal insert user:", insertError)
            return false // << bikin AccessDenied kalo ini error
          }
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
        token.username = (user as any).username
      }
      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Bisa lo ubah ke error page khusus
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
