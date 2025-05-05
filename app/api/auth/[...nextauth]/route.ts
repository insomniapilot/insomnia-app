import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerSupabaseClient } from "@/lib/supabase"

// Untuk debugging
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET length:", process.env.GOOGLE_CLIENT_SECRET?.length)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const supabase = createServerSupabaseClient()

        // Find user by username
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", credentials.username)
          .single()

        if (userError || !userData) {
          return null
        }

        // Get auth user to verify password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: credentials.password,
        })

        if (authError || !authData.user) {
          return null
        }

        return {
          id: userData.id,
          name: userData.full_name || userData.username,
          email: userData.email,
          image: userData.avatar_url,
          username: userData.username,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const supabase = createServerSupabaseClient()

        // Check if user exists in our database
        const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (!existingUser && user.email) {
          // Create auth user in Supabase
          await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: {
              full_name: user.name,
              avatar_url: user.image,
            },
            id: user.id as string,
          })

          // Redirect to complete profile page for first-time users
          return "/complete-profile"
        }
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.username = token.username as string
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
    error: "/signin",
  },
  debug: true, // Enable debug mode to see detailed errors
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }
