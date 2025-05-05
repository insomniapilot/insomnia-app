"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { signOut } from "next-auth/react"
import { Home, Search, MessageCircle, User, LogOut, Sun, Moon, Menu, X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { session } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Skip navbar on signin and complete-profile pages
  if (pathname === "/signin" || pathname === "/complete-profile") {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home" className="flex items-center">
              <span className="text-xl font-bold text-primary">SocialApp</span>
            </Link>
          </div>

          {/* Search bar - visible on desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/home"
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname === "/home" ? "text-primary" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <Home className="h-6 w-6" />
            </Link>
            <Link
              href="/search"
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname === "/search" ? "text-primary" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <Search className="h-6 w-6" />
            </Link>
            <Link
              href="/chat"
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname === "/chat" ? "text-primary" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <MessageCircle className="h-6 w-6" />
            </Link>
            <Link
              href={`/profile/${session?.user?.username || ""}`}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                pathname.startsWith("/profile") ? "text-primary" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {session?.user?.image ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image src={session.user.image || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                </div>
              ) : (
                <User className="h-6 w-6" />
              )}
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            <div className="px-2 pb-3 pt-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Link
              href="/home"
              className={`block px-3 py-2 rounded-md ${
                pathname === "/home"
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-3" />
                <span>Home</span>
              </div>
            </Link>
            <Link
              href="/search"
              className={`block px-3 py-2 rounded-md ${
                pathname === "/search"
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Search className="h-5 w-5 mr-3" />
                <span>Search</span>
              </div>
            </Link>
            <Link
              href="/chat"
              className={`block px-3 py-2 rounded-md ${
                pathname === "/chat"
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3" />
                <span>Chat</span>
              </div>
            </Link>
            <Link
              href={`/profile/${session?.user?.username || ""}`}
              className={`block px-3 py-2 rounded-md ${
                pathname.startsWith("/profile")
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3" />
                <span>Profile</span>
              </div>
            </Link>
            <button
              onClick={() => {
                toggleTheme()
                setIsMenuOpen(false)
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center">
                {theme === "dark" ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="w-full text-left block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
