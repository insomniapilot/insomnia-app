"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

interface FollowButtonProps {
  profileId: string
  currentUserId: string
}

export default function FollowButton({ profileId, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", profileId)
          .single()

        setIsFollowing(!!data)
      } catch (error) {
        // Not following
        setIsFollowing(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkFollowStatus()
  }, [currentUserId, profileId, supabase])

  const toggleFollow = async () => {
    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", profileId)

        setIsFollowing(false)
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: profileId,
        })

        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full font-medium ${
        isFollowing ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" : "bg-primary text-white"
      } hover:opacity-90 disabled:opacity-50 transition-colors`}
    >
      {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
    </button>
  )
}
