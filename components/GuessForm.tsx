"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function GuessForm({ photoId }: { photoId: string }) {
  const router = useRouter()
  const [guessText, setGuessText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!guessText.trim()) {
      setError("Please enter a guess")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/photos/${photoId}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guessText: guessText.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to submit guess")
      } else {
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="guessText" className="block text-sm font-medium text-gray-700">
          Your Guess
        </label>
        <input
          id="guessText"
          type="text"
          required
          value={guessText}
          onChange={(e) => setGuessText(e.target.value)}
          placeholder="Enter your guess..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Guess"}
      </button>
    </form>
  )
}
