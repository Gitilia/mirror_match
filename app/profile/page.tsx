import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ChangePasswordForm from "@/components/ChangePasswordForm"

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      points: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg text-gray-900">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-lg text-gray-900">{user.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Points</label>
            <p className="mt-1 text-3xl font-bold text-purple-600">{user.points}</p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
