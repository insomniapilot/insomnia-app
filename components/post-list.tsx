"use client"

import { useState, useEffect } from "react"
import type { Post } from "@/types"
import PostCard from "./post-card"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface PostListProps {
  initialPosts: Post[]
  username?: string
}

export default function PostList({ initialPosts, username }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    // Set up real-time subscription for new posts
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          ...(username ? { filter: `user_id=eq.${username}` } : {}),
        },
        (payload) => {
          // Fetch the complete post with user data
          const fetchNewPost = async () => {
            const { data } = await supabase
              .from("posts")
              .select(`
              *,
              user:users(id, username, full_name, avatar_url)
            `)
              .eq("id", payload.new.id)
              .single()

            if (data) {
              setPosts((prevPosts) => [data as Post, ...prevPosts])
            }
          }

          fetchNewPost()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, username])

  // Function to handle post deletion
  const handleDeletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  // Function to handle post like
  const handleLikePost = (postId: string, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              has_liked: liked,
              likes_count: liked ? (post.likes_count || 0) + 1 : Math.max((post.likes_count || 0) - 1, 0),
            }
          : post,
      ),
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={user?.id || ""}
          onDelete={handleDeletePost}
          onLike={handleLikePost}
        />
      ))}
    </div>
  )
}
