"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface DeletePhotoButtonProps {
  photoId: string
  onDelete?: () => void
  variant?: "icon" | "button"
}

export default function DeletePhotoButton({ 
  photoId, 
  onDelete,
  variant = "icon" 
}: DeletePhotoButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to delete photo")
        return
      }

      // Call optional callback
      if (onDelete) {
        onDelete()
      } else {
        // If we're on a photo detail page, redirect to photos list
        if (pathname?.startsWith("/photos/") && pathname !== "/photos") {
          router.push("/photos")
        } else {
          // Otherwise just refresh the current page
          router.refresh()
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Delete error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (variant === "button") {
    return (
      <div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {loading ? "Deleting..." : "Delete Photo"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition disabled:opacity-50"
        aria-label="Delete photo"
        title="Delete photo"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap bg-white p-1 rounded shadow">
          {error}
        </p>
      )}
    </div>
  )
}
