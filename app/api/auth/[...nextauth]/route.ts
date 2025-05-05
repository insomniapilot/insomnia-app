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
  if (account?.provider === "google") {
    const supabase = createServerSupabaseClient();

    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return false;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          email: user.email,
          full_name: user.name,
          avatar_url: user.image,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting user:", insertError);
        return false;
      }
    }
  }

  return true;
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
