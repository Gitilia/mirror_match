"use client"

import { useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  points: number
  createdAt: Date
}

export default function AdminUserList({ users }: { users: User[] }) {
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleResetPassword = async (userId: string) => {
    const password = newPassword[userId]
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setError("")
    setResettingUserId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
      } else {
        setSuccess("Password reset successfully!")
        setNewPassword({ ...newPassword, [userId]: "" })
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setResettingUserId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {user.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {user.points}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword[user.id] || ""}
                      onChange={(e) =>
                        setNewPassword({ ...newPassword, [user.id]: e.target.value })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-xs w-32 bg-white text-gray-900"
                    />
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      disabled={resettingUserId === user.id}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                    >
                      {resettingUserId === user.id ? "Resetting..." : "Reset"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
