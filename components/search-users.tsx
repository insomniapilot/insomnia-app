"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import { Search } from "lucide-react"
import UserCard from "./user-card"
import type { User } from "@/types"

export default function SearchUsers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([])
        return
      }

      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .ilike("username", `%${searchQuery}%`)
          .order("username")
          .limit(20)

        if (error) throw error

        // Filter out current user
        const filteredUsers = data.filter((user) => user.id !== session?.user?.id)
        setUsers(filteredUsers as User[])
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, supabase, session?.user?.id])

  return (
    <div>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Searching...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} currentUserId={session?.user?.id || ""} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Search for users by username</p>
        </div>
      )}
    </div>
  )
}
