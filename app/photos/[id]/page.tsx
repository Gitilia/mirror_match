import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GuessForm from "@/components/GuessForm"
import PhotoImage from "@/components/PhotoImage"
import DeletePhotoButton from "@/components/DeletePhotoButton"

// Enable caching for this page
export const revalidate = 60 // Revalidate every 60 seconds

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: {
      uploader: {
        select: {
          name: true,
        },
      },
      guesses: {
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!photo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Photo not found</p>
        </div>
      </div>
    )
  }

  const userGuess = photo.guesses[0]
  const hasCorrectGuess = userGuess?.correct || false
  const isOwner = photo.uploaderId === session.user.id
  
  // Type assertion for new fields (penaltyEnabled, penaltyPoints, maxAttempts)
  type PhotoWithNewFields = typeof photo & {
    penaltyEnabled: boolean
    penaltyPoints: number
    maxAttempts: number | null
  }
  const photoWithFields = photo as PhotoWithNewFields
  
  // Calculate remaining attempts
  const userGuessCount = photo.guesses.length
  const maxAttempts = photoWithFields.maxAttempts ?? null
  const remainingAttempts = maxAttempts !== null && maxAttempts > 0 
    ? Math.max(0, maxAttempts - userGuessCount)
    : null
  const hasReachedMaxAttempts = maxAttempts !== null && maxAttempts > 0 && userGuessCount >= maxAttempts

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Guess Who!</h1>
            {session.user.role === "ADMIN" && (
              <DeletePhotoButton photoId={photo.id} variant="button" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <p className="text-sm text-gray-500">
              Uploaded by {photo.uploader.name} on{" "}
              {new Date(photo.createdAt).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                +{photo.points} {photo.points === 1 ? "point" : "points"} if correct
              </span>
              {photoWithFields.penaltyEnabled && photoWithFields.penaltyPoints > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  -{photoWithFields.penaltyPoints} {photoWithFields.penaltyPoints === 1 ? "point" : "points"} if wrong
                </span>
              )}
              {maxAttempts !== null && maxAttempts > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {maxAttempts} {maxAttempts === 1 ? "attempt" : "attempts"} max
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-200 rounded-lg overflow-hidden w-full" style={{ maxHeight: "70vh", minHeight: "300px" }}>
            <div className="relative w-full h-full" style={{ minHeight: "300px", maxHeight: "70vh" }}>
              <PhotoImage src={photo.url} alt="Photo to guess" />
            </div>
          </div>

          <div className="flex flex-col w-full min-w-0">
            {hasCorrectGuess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">
                  ✅ Correct! You guessed it right!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  The answer was: <strong>{photo.answerName}</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  You earned <strong>{photo.points} {photo.points === 1 ? "point" : "points"}</strong>!
                </p>
              </div>
            ) : userGuess ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold">❌ Wrong guess. Try again!</p>
                <p className="text-sm text-red-700 mt-1">
                  Your last guess: <strong>{userGuess.guessText}</strong>
                </p>
                {photoWithFields.penaltyEnabled && photoWithFields.penaltyPoints > 0 && (
                  <p className="text-sm text-red-700 mt-1">
                    You lost <strong>{photoWithFields.penaltyPoints} {photoWithFields.penaltyPoints === 1 ? "point" : "points"}</strong> for this wrong guess.
                  </p>
                )}
              </div>
            ) : null}

            {!isOwner && !hasCorrectGuess && remainingAttempts !== null && remainingAttempts > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Remaining attempts:</strong> {remainingAttempts} of {maxAttempts}
                </p>
              </div>
            )}

            {!isOwner && !hasCorrectGuess && hasReachedMaxAttempts && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold">⚠️ Maximum attempts reached</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You have used all {maxAttempts} {maxAttempts === 1 ? "attempt" : "attempts"} for this photo.
                </p>
              </div>
            )}

            {isOwner ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold">📸 This is your photo</p>
                <p className="text-sm text-blue-700 mt-1">
                  You cannot guess on photos you uploaded. The answer is: <strong>{photo.answerName}</strong>
                </p>
              </div>
            ) : !hasCorrectGuess && !hasReachedMaxAttempts ? (
              <GuessForm photoId={photo.id} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
