"use client"

import { useState, useRef, DragEvent } from "react"
import { useRouter } from "next/navigation"

interface PhotoData {
  file: File | null
  url: string
  answerName: string
  points: string
  penaltyEnabled: boolean
  penaltyPoints: string
  maxAttempts: string
  preview: string | null
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (files.length === 0) {
      setError("Please drop image files")
      return
    }

    handleFiles(files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newPhotos: PhotoData[] = []

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const photoData: PhotoData = {
          file,
          url: "",
          answerName: "",
          points: "1",
          penaltyEnabled: false,
          penaltyPoints: "0",
          maxAttempts: "",
          preview: reader.result as string,
        }
        newPhotos.push(photoData)
        
        // Update state when all files are processed
        if (newPhotos.length === files.length) {
          setPhotos((prev) => [...prev, ...newPhotos])
          setError("")
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const updatePhoto = (index: number, updates: Partial<PhotoData>) => {
    setPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, ...updates } : photo))
    )
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const addUrlPhoto = () => {
    setPhotos((prev) => [
      ...prev,
      {
        file: null,
        url: "",
        answerName: "",
        points: "1",
        penaltyEnabled: false,
        penaltyPoints: "0",
        maxAttempts: "",
        preview: null,
      },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate all photos have required fields
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      if (!photo.answerName.trim()) {
        setError(`Photo ${i + 1}: Answer name is required`)
        return
      }
      if (!photo.file && !photo.url) {
        setError(`Photo ${i + 1}: Please provide a file or URL`)
        return
      }
    }

    if (photos.length === 0) {
      setError("Please add at least one photo")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      
      // Add all photos data with indexed keys to preserve order
      photos.forEach((photo, index) => {
        if (photo.file) {
          formData.append(`photo_${index}_file`, photo.file)
        } else if (photo.url) {
          formData.append(`photo_${index}_url`, photo.url)
        }
        formData.append(`photo_${index}_answerName`, photo.answerName.trim())
        formData.append(`photo_${index}_points`, photo.points)
        // Auto-enable penalty if penaltyPoints has a value > 0
        const penaltyPointsValue = parseInt(photo.penaltyPoints || "0", 10)
        formData.append(`photo_${index}_penaltyEnabled`, penaltyPointsValue > 0 ? "true" : "false")
        formData.append(`photo_${index}_penaltyPoints`, photo.penaltyPoints || "0")
        formData.append(`photo_${index}_maxAttempts`, photo.maxAttempts || "")
      })

      formData.append("count", photos.length.toString())

      const response = await fetch("/api/photos/upload-multiple", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to upload photos")
      } else {
        setSuccess(
          `Successfully uploaded ${data.photos.length} photo(s)! Emails sent to all users.`
        )
        setPhotos([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setTimeout(() => {
          router.push("/photos")
        }, 2000)
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Photos</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos (Multiple files supported)
            </label>
            
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-purple-400"
              }`}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <span>Select files</span>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleFileInputChange}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-600">
                  or drag and drop multiple images
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>

          {/* Add URL Photo Button */}
          <div>
            <button
              type="button"
              onClick={addUrlPhoto}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              + Add Photo by URL
            </button>
          </div>

          {/* Photos List */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Photos ({photos.length})
              </h2>
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Photo {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Preview */}
                  {photo.preview && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.preview}
                        alt={`Preview ${index + 1}`}
                        className="max-h-32 rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* URL Input (if no file) */}
                  {!photo.file && (
                    <div>
                      <label
                        htmlFor={`url-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Photo URL
                      </label>
                      <input
                        id={`url-${index}`}
                        type="url"
                        value={photo.url}
                        onChange={(e) =>
                          updatePhoto(index, { url: e.target.value })
                        }
                        placeholder="https://example.com/photo.jpg"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Answer Name */}
                  <div>
                    <label
                      htmlFor={`answerName-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Answer Name *
                    </label>
                    <input
                      id={`answerName-${index}`}
                      type="text"
                      required
                      value={photo.answerName}
                      onChange={(e) =>
                        updatePhoto(index, { answerName: e.target.value })
                      }
                      placeholder="Enter the correct answer"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Points */}
                  <div>
                    <label
                      htmlFor={`points-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Points Value (for correct answer)
                    </label>
                    <input
                      id={`points-${index}`}
                      type="number"
                      min="1"
                      required
                      value={photo.points}
                      onChange={(e) =>
                        updatePhoto(index, { points: e.target.value })
                      }
                      placeholder="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Penalty Points */}
                  <div className="border-t pt-4">
                    <label
                      htmlFor={`penaltyPoints-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Penalty Points (deducted for wrong answer)
                    </label>
                    <input
                      id={`penaltyPoints-${index}`}
                      type="number"
                      min="0"
                      value={photo.penaltyPoints}
                      onChange={(e) =>
                        updatePhoto(index, { penaltyPoints: e.target.value })
                      }
                      placeholder="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty or set to 0 to disable point deduction. If set to a value greater than 0, users will lose these points for each incorrect guess.
                    </p>
                  </div>

                  {/* Max Attempts */}
                  <div>
                    <label
                      htmlFor={`maxAttempts-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Max Attempts (per user)
                    </label>
                    <input
                      id={`maxAttempts-${index}`}
                      type="number"
                      min="0"
                      value={photo.maxAttempts}
                      onChange={(e) =>
                        updatePhoto(index, { maxAttempts: e.target.value })
                      }
                      placeholder="Unlimited (leave empty or 0)"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum number of guesses allowed per user. Leave empty or 0 for unlimited attempts.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading || photos.length === 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading
              ? `Uploading ${photos.length} photo(s)...`
              : `Upload ${photos.length} Photo(s)`}
          </button>
        </form>
      </div>
    </div>
  )
}
