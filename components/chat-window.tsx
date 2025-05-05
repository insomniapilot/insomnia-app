"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import Image from "next/image"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { User, Message } from "@/types"

interface ChatWindowProps {
  currentUserId: string
  selectedContact: User | null
}

export default function ChatWindow({ currentUserId, selectedContact }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (!selectedContact) return

    setIsLoading(true)

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUserId})`,
          )
          .order("created_at", { ascending: true })

        if (error) throw error

        setMessages(data as Message[])

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("sender_id", selectedContact.id)
          .eq("receiver_id", currentUserId)
          .eq("read", false)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages:${currentUserId}-${selectedContact.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUserId}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])

          // Mark message as read if it's from the selected contact
          if (payload.new.sender_id === selectedContact.id && payload.new.receiver_id === currentUserId) {
            supabase.from("messages").update({ read: true }).eq("id", payload.new.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, selectedContact, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact) return

    setIsSending(true)

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  if (!selectedContact) {
    return (
      <div className="w-2/3 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a contact to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-2/3 flex flex-col">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {selectedContact.avatar_url ? (
            <Image
              src={selectedContact.avatar_url || "/placeholder.svg"}
              alt={selectedContact.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
              {selectedContact.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {selectedContact.full_name || selectedContact.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{selectedContact.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.sender_id === currentUserId

            return (
              <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isSender ? "bg-primary text-white" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isSender ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="p-2 rounded-full bg-primary text-white disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
