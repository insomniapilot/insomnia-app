import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import PostList from "@/components/post-list"
import FollowButton from "@/components/follow-button"
import type { User, Post } from "@/types"

// Disable static generation for this page
export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getProfile(username: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error || !user) {
      return null
    }

    // Get follower and following counts
    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
    ])

    return {
      ...user,
      followers_count: followersCount,
      following_count: followingCount,
    } as User & { followers_count: number; following_count: number }
  } catch (error) {
    console.error("Error in getProfile:", error)
    return null
  }
}

async function getUserPosts(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user posts:", error)
      return []
    }

    return posts as Post[]
  } catch (error) {
    console.error("Error in getUserPosts:", error)
    return []
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  try {
    const { username } = params
    const profile = await getProfile(username)

    if (!profile) {
      notFound()
    }

    const posts = await getUserPosts(profile.id)

    // Get current user session
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isCurrentUser = session?.user?.id === profile.id

    return (
      <>
        <Navbar />
        <main className="container-custom py-6">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 text-4xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

                  {profile.bio && <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>}

                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{posts.length}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{profile.followers_count}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{profile.following_count}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                    </div>
                  </div>

                  {!isCurrentUser && session?.user?.id && (
                    <div className="mt-4">
                      <FollowButton profileId={profile.id} currentUserId={session.user.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
              <PostList initialPosts={posts} username={profile.username} />
            </div>
          </div>
        </main>
      </>
    )
  } catch (error) {
    console.error("Error rendering ProfilePage:", error)

    // Fallback UI in case of error
    return (
      <>
        <Navbar />
        <main className="container-custom py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400">
              <p>Error loading profile. Please try again later.</p>
            </div>
          </div>
        </main>
      </>
    )
  }
}
