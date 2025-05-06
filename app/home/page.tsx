import { createServerSupabaseClient } from "@/lib/supabase"
import PostList from "@/components/post-list"
import CreatePostForm from "@/components/create-post-form"
import Navbar from "@/components/navbar"
import type { Post } from "@/types"

// Disable static generation for this page
export const dynamic = "force-dynamic"

async function getPosts() {
  try {
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
  } catch (error) {
    console.error("Error in getPosts:", error)
    return []
  }
}

export default async function HomePage() {
  let posts: Post[] = []

  try {
    posts = await getPosts()

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
  } catch (error) {
    console.error("Error rendering HomePage:", error)

    // Fallback UI in case of error
    return (
      <>
        <Navbar />
        <main className="container-custom py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400">
              <p>Error loading posts. Please try again later.</p>
            </div>
          </div>
        </main>
      </>
    )
  }
}
