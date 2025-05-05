"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import ChatSidebar from "./chat-sidebar"
import ChatWindow from "./chat-window"
import type { User } from "@/types"

interface ChatInterfaceProps {
  userId: string
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [contacts, setContacts] = useState<User[]>([])
  const [selectedContact, setSelectedContact] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Get users who have exchanged messages with the current user
        const { data: sentMessages, error: sentError } = await supabase
          .from("messages")
          .select("receiver_id")
          .eq("sender_id", userId)
          .order("created_at", { ascending: false })

        const { data: receivedMessages, error: receivedError } = await supabase
          .from("messages")
          .select("sender_id")
          .eq("receiver_id", userId)
          .order("created_at", { ascending: false })

        if (sentError || receivedError) throw sentError || receivedError

        // Combine and deduplicate user IDs
        const contactIds = new Set([
          ...sentMessages.map((msg) => msg.receiver_id),
          ...receivedMessages.map((msg) => msg.sender_id),
        ])

        if (contactIds.size === 0) {
          setIsLoading(false)
          return
        }

        // Fetch user details for contacts
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("*")
          .in("id", Array.from(contactIds))

        if (usersError) throw usersError

        setContacts(users as User[])
      } catch (error) {
        console.error("Error fetching contacts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [userId, supabase])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="flex h-[600px]">
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          isLoading={isLoading}
          currentUserId={userId}
        />

        <ChatWindow currentUserId={userId} selectedContact={selectedContact} />
      </div>
    </div>
  )
}
