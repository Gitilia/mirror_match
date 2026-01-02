import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PhotoThumbnail from "@/components/PhotoThumbnail"
import DeletePhotoButton from "@/components/DeletePhotoButton"

// Enable caching for this page
export const revalidate = 60 // Revalidate every 60 seconds

export default async function PhotosPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Limit to 50 photos per page for performance
  const photos = await prisma.photo.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      uploader: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Photos</h1>

      {photos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No photos yet. Be the first to upload one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo: { id: string; url: string; answerName: string; points: number; createdAt: Date; uploader: { name: string } }) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative group"
            >
              <Link href={`/photos/${photo.id}`}>
                <div className="aspect-square bg-gray-200 relative">
                  <PhotoThumbnail src={photo.url} alt="Photo" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-500">Uploaded by {photo.uploader.name}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {photo.points} {photo.points === 1 ? "pt" : "pts"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              {session.user.role === "ADMIN" && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeletePhotoButton photoId={photo.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
