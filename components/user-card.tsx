"use client"

import Link from "next/link"
import Image from "next/image"
import FollowButton from "./follow-button"
import type { User } from "@/types"

interface UserCardProps {
  user: User
  currentUserId: string
}

export default function UserCard({ user, currentUserId }: UserCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
      <Link href={`/profile/${user.username}`} className="flex items-center space-x-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {user.avatar_url ? (
            <Image src={user.avatar_url || "/placeholder.svg"} alt={user.username} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 text-xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{user.full_name || user.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
        </div>
      </Link>

      {currentUserId && <FollowButton profileId={user.id} currentUserId={currentUserId} />}
    </div>
  )
}
