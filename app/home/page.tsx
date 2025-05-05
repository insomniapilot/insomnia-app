import { createServerSupabaseClient } from "@/lib/supabase"
import { getServerSession } from "next-auth/next"
import PostList from "@/components/post-list"
import CreatePostForm from "@/components/create-post-form"
import Navbar from "@/components/navbar"
import type { Post } from "@/types"

async function getPosts() {
  const supabase = createServerSupabaseClient()

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(id, username, full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return posts as Post[]
}

export default async function HomePage() {
  const posts = await getPosts()
  const session = await getServerSession()

  return (
    <>
      <Navbar />
      <main className="container-custom py-6">
        <div className="max-w-2xl mx-auto">
          <CreatePostForm />
          <div className="mt-8">
            <PostList initialPosts={posts} />
          </div>
        </div>
      </main>
    </>
  )
}
