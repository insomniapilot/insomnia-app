import Navbar from "@/components/navbar"
import ChatInterface from "@/components/chat-interface"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

// Disable static generation for this page
export const dynamic = "force-dynamic"

export default async function ChatPage() {
  try {
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
  } catch (error) {
    console.error("Error rendering ChatPage:", error)

    // Fallback UI in case of error
    return (
      <>
        <Navbar />
        <main className="container-custom py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400">
              <p>Error loading chat. Please try again later.</p>
            </div>
          </div>
        </main>
      </>
    )
  }
}
