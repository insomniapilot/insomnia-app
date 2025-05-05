"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, UserPlus } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { User } from "@/types"

interface ChatSidebarProps {
  contacts: User[]
  selectedContact: User | null
  onSelectContact: (contact: User) => void
  isLoading: boolean
  currentUserId: string
}

export default function ChatSidebar({
  contacts,
  selectedContact,
  onSelectContact,
  isLoading,
  currentUserId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const supabase = createClientSupabaseClient()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(5)

      if (error) throw error

      setSearchResults(data as User[])
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.full_name && contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading contacts...</div>
        ) : searchQuery && searchResults.length > 0 ? (
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              Search Results
            </div>
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectContact(user)}
                className={`p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedContact?.id === user.id ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                </div>
                <UserPlus className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                selectedContact?.id === contact.id ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {contact.avatar_url ? (
                  <Image
                    src={contact.avatar_url || "/placeholder.svg"}
                    alt={contact.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                    {contact.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {contact.full_name || contact.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{contact.username}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? "No contacts found" : "No conversations yet"}
          </div>
        )}
      </div>
    </div>
  )
}
