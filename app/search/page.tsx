import Navbar from "@/components/navbar"
import SearchUsers from "@/components/search-users"

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="container-custom py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Users</h1>
          <SearchUsers />
        </div>
      </main>
    </>
  )
}
