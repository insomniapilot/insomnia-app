"use client"

import type React from "react"

import { useState } from "react"
import type { Post, Comment } from "@/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, Trash2, Send } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"

interface PostCardProps {
  post: Post
  currentUserId: string
  onDelete: (postId: string) => void
  onLike: (postId: string, liked: boolean) => void
}

export default function PostCard({ post, currentUserId, onDelete, onLike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.has_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const supabase = createClientSupabaseClient()

  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike post
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)

        setIsLiked(false)
        setLikesCount((prev) => Math.max(prev - 1, 0))
        onLike(post.id, false)
      } else {
        // Like post
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })

        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
        onLike(post.id, true)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleDelete = async () => {
    try {
      await supabase.from("posts").delete().eq("id", post.id).eq("user_id", currentUserId)

      onDelete(post.id)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const toggleComments = async () => {
    setShowComments(!showComments)

    if (!showComments && comments.length === 0) {
      await loadComments()
    }
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })

      setComments((data as Comment[]) || [])
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: commentText.trim(),
        })
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      setComments((prev) => [data as Comment, ...prev])
      setCommentText("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href={`/profile/${post.user?.username}`} className="flex items-center space-x-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {post.user?.avatar_url ? (
              <Image
                src={post.user.avatar_url || "/placeholder.svg"}
                alt={post.user.username || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                {post.user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {post.user?.full_name || post.user?.username || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {post.user_id === currentUserId && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Image (if any) */}
      {post.image_url && (
        <div className="relative w-full aspect-video">
          <Image src={post.image_url || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-6">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <button onClick={toggleComments} className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length || post.comments_count || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="text-primary disabled:text-gray-400 dark:disabled:text-gray-600"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Link href={`/profile/${comment.user?.username}`} className="flex-shrink-0">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {comment.user?.avatar_url ? (
                        <Image
                          src={comment.user.avatar_url || "/placeholder.svg"}
                          alt={comment.user.username || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                          {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <Link
                        href={`/profile/${comment.user?.username}`}
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {comment.user?.username || "Unknown User"}
                      </Link>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
