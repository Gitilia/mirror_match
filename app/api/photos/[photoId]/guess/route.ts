import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { normalizeString } from "@/lib/utils"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { photoId } = await params
    const { guessText } = await req.json()

    if (!guessText || !guessText.trim()) {
      return NextResponse.json(
        { error: "Guess text is required" },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Prevent users from guessing their own photos
    if (photo.uploaderId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot guess on your own photos" },
        { status: 403 }
      )
    }

    // Check if user already has a correct guess
    const existingCorrectGuess = await prisma.guess.findFirst({
      where: {
        userId: session.user.id,
        photoId: photoId,
        correct: true,
      },
    })

    if (existingCorrectGuess) {
      return NextResponse.json(
        { error: "You already guessed this correctly" },
        { status: 400 }
      )
    }

    // Check max attempts limit
    const photoWithMaxAttempts = photo as typeof photo & { maxAttempts: number | null }
    if (photoWithMaxAttempts.maxAttempts !== null && photoWithMaxAttempts.maxAttempts > 0) {
      const userGuessCount = await prisma.guess.count({
        where: {
          userId: session.user.id,
          photoId: photoId,
        },
      })

      if (userGuessCount >= photoWithMaxAttempts.maxAttempts) {
        return NextResponse.json(
          { error: `You have reached the maximum number of attempts (${photoWithMaxAttempts.maxAttempts}) for this photo` },
          { status: 400 }
        )
      }
    }

    // Check if guess is correct (case-insensitive, trimmed)
    const normalizedGuess = normalizeString(guessText)
    const normalizedAnswer = normalizeString(photo.answerName)
    const isCorrect = normalizedGuess === normalizedAnswer

    // Create the guess
    const guess = await prisma.guess.create({
      data: {
        userId: session.user.id,
        photoId: photoId,
        guessText: guessText.trim(),
        correct: isCorrect,
      },
    })

    // Update user points based on guess result
    let pointsChange = 0
    const photoWithPenalty = photo as typeof photo & { penaltyEnabled: boolean; penaltyPoints: number }
    
    if (isCorrect) {
      // Award points for correct answer
      pointsChange = photo.points
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: photo.points, // Award points based on photo difficulty
          },
        },
      })
    } else if (photoWithPenalty.penaltyEnabled && photoWithPenalty.penaltyPoints > 0) {
      // Deduct points for wrong answer if penalty is enabled
      // First, get current user points to prevent going below 0
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
      })
      
      if (currentUser) {
        const currentPoints = currentUser.points
        const penaltyAmount = photoWithPenalty.penaltyPoints
        const newPoints = Math.max(0, currentPoints - penaltyAmount)
        const actualDeduction = currentPoints - newPoints
        
        pointsChange = -actualDeduction
        
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            points: newPoints,
          },
        })
      }
    }

    return NextResponse.json({ 
      guess, 
      correct: isCorrect,
      pointsChange 
    })
  } catch (error) {
    console.error("Error submitting guess:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
