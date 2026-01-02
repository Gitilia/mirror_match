import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Enable caching for this page
export const revalidate = 30 // Revalidate every 30 seconds

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const users = await prisma.user.findMany({
    orderBy: { points: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      points: true,
      role: true,
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: { id: string; name: string; email: string; points: number; role: string }, index: number) => (
              <tr
                key={user.id}
                className={user.id === session.user.id ? "bg-purple-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name}
                  {user.role === "ADMIN" && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Admin
                    </span>
                  )}
                  {user.id === session.user.id && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      You
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                  {user.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
