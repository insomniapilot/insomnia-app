import Navbar from "@/components/navbar"
import ChatInterface from "@/components/chat-interface"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function ChatPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/signin")
  }

  return (
    <>
      <Navbar />
      <main className="container-custom py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>
          <ChatInterface userId={session.user.id} />
        </div>
      </main>
    </>
  )
}
