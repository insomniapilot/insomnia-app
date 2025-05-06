import type React from "react"
import Link from "next/link"

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <Link
          href="/register"
          className="inline-block px-4 py-2 bg-white dark:bg-gray-800 text-primary rounded-md shadow hover:shadow-md transition-all"
        >
          Belum punya akun? Register di sini
        </Link>
      </div>
    </div>
  )
}
