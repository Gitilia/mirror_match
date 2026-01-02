"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

export default function Navigation() {
  const { data: session } = useSession()
  const [sideMenuOpen, setSideMenuOpen] = useState(false)

  // Close side menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (sideMenuOpen && !target.closest('.side-menu') && !target.closest('.menu-button')) {
        setSideMenuOpen(false)
      }
    }

    if (sideMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [sideMenuOpen])

  if (!session) {
    return null
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Menu Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
                className="menu-button p-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="text-xl font-bold">
                MirrorMatch
              </Link>
            </div>

            {/* Main Actions - Always Visible */}
            <div className="flex items-center space-x-4">
              <Link
                href="/upload"
                className="hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap"
              >
                Upload
              </Link>
              <Link
                href="/leaderboard"
                className="hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap"
              >
                Leaderboard
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center">
              <span className="text-sm">Hello, {session.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className={`side-menu fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sideMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSideMenuOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-2">
            <Link
              href="/photos"
              className="px-4 py-3 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium"
              onClick={() => setSideMenuOpen(false)}
            >
              Photos
            </Link>
            <Link
              href="/profile"
              className="px-4 py-3 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium"
              onClick={() => setSideMenuOpen(false)}
            >
              Profile
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-4 py-3 rounded-md text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-medium"
                onClick={() => setSideMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
        </nav>

        {/* Logout button in side menu - always visible at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={() => {
              setSideMenuOpen(false)
              signOut({ callbackUrl: "/login" })
            }}
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sideMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setSideMenuOpen(false)}
        />
      )}
    </>
  )
}
