import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerSupabaseClient } from "@/lib/supabase"

// Pastikan environment variables tersedia
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Missing Google OAuth credentials")
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("NEXTAUTH_URL not set")
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error("NEXTAUTH_SECRET is not set")
}

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
    async signIn({ user, account, profile }) {
      // Log untuk debugging
      console.log("Sign in callback:", {
        userId: user.id,
        provider: account?.provider,
        hasEmail: !!user.email,
      })

      if (account?.provider === "google") {
        const supabase = createServerSupabaseClient()

        try {
          // Check if user exists in our database
          const { data: existingUser, error } = await supabase.from("users").select("*").eq("id", user.id).single()

          if (error && error.code !== "PGRST116") {
            console.error("Error checking user:", error)
            return false
          }

          if (!existingUser && user.email) {
            console.log("Creating new user in Supabase")
            // Create auth user in Supabase
            const { data, error: createError } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                full_name: user.name,
                avatar_url: user.image,
              },
              id: user.id as string,
            })

            if (createError) {
              console.error("Error creating user in Supabase:", createError)
              return false
            }

            console.log("User created successfully, redirecting to complete profile")
            return "/complete-profile"
          }
        } catch (error) {
          console.error("Unexpected error in signIn callback:", error)
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
  debug: true, // Enable debug mode to see detailed errors
  session: {
    strategy: "jwt",
  },
  // Tambahkan secret dari environment variable
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
