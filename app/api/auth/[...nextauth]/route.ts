import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerSupabaseClient } from "@/lib/supabase"

// Untuk debugging
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        try {
          // Check if user exists in our database
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single()

          if (error && error.code !== "PGRST116") {
            console.error("Error checking user:", error)
            return false
          }

          if (!existingUser && user.email) {
            // Create user in our database
            const { error: insertError } = await supabase.from("users").insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
                username: user.email?.split("@")[0] || `user_${Date.now()}`,
              },
            ])

            if (insertError) {
              console.error("Error creating user:", insertError)
              return false
            }

            // Redirect to complete profile page for first-time users
            return "/complete-profile"
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
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
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }
