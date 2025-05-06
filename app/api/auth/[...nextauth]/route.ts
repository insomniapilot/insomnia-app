import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerSupabaseClient } from "@/lib/supabase"

// Untuk debugging
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET)
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const supabase = createServerSupabaseClient()

          // Find user by email
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (userError || !userData) {
            console.error("User not found:", userError)
            return null
          }

          // Get auth user to verify password
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError || !authData.user) {
            console.error("Auth error:", authError)
            return null
          }

          return {
            id: userData.id,
            name: userData.full_name || userData.username,
            email: userData.email,
            image: userData.avatar_url,
            username: userData.username,
          }
        } catch (error) {
          console.error("Error in authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in callback:", {
        userId: user?.id,
        provider: account?.provider,
        hasEmail: !!user?.email,
        profile: !!profile,
      })

      if (account?.provider === "google") {
        try {
          // Pastikan user memiliki email
          if (!user.email) {
            console.error("User has no email")
            return false
          }

          const supabase = createServerSupabaseClient()

          // Cek apakah user sudah ada di database
          const { data: existingUser, error: findError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle()

          if (findError && findError.code !== "PGRST116") {
            console.error("Error checking user:", findError)
            return false
          }

          // Jika user belum ada, buat user baru
          if (!existingUser) {
            console.log("Creating new user with email:", user.email)

            // Buat user di Supabase Auth
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                full_name: user.name,
                avatar_url: user.image,
              },
            })

            if (authError) {
              console.error("Error creating auth user:", authError)
              return false
            }

            // Buat user di tabel users
            const { error: insertError } = await supabase.from("users").insert({
              id: authUser.user.id,
              email: user.email,
              username: `user_${Date.now().toString().slice(-6)}`, // Username sementara
              full_name: user.name,
              avatar_url: user.image,
            })

            if (insertError) {
              console.error("Error creating user record:", insertError)
              return false
            }

            console.log("User created successfully, redirecting to complete profile")
            return "/complete-profile"
          }

          // Jika user sudah ada tapi belum punya username, arahkan ke complete profile
          if (existingUser && (!existingUser.username || existingUser.username.startsWith("user_"))) {
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

        // Tambahkan username ke session jika ada
        if (token.username) {
          session.user.username = token.username as string
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      // Tambahkan data dari user ke token
      if (user) {
        token.username = (user as any).username
      }

      // Jika tidak ada username di token, coba ambil dari database
      if (!token.username && token.email) {
        try {
          const supabase = createServerSupabaseClient()
          const { data: userData } = await supabase.from("users").select("username").eq("email", token.email).single()

          if (userData?.username) {
            token.username = userData.username
          }
        } catch (error) {
          console.error("Error fetching username for token:", error)
        }
      }

      return token
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  session: {
    strategy: "jwt",
  },
  // Tambahkan secret dari environment variable
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
