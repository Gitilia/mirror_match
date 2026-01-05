"use client"

import { useState, useEffect } from "react"

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Shift+? (Shift+/ produces "?")
      // Also check for event.key === "?" as fallback for some keyboard layouts
      const isQuestionMark = 
        (event.shiftKey && event.key === "/") || 
        event.key === "?" ||
        (event.code === "Slash" && event.shiftKey)
      
      // Only trigger if Shift is pressed (not Ctrl/Cmd)
      if (event.shiftKey && isQuestionMark && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setIsOpen((prev) => !prev)
      }
      // Also close on Escape key
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center">
            <h2 className="text-2xl font-bold">Welcome to MirrorMatch</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-purple-700 rounded-md transition"
              aria-label="Close help"
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
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-gray-700">
            {/* What is MirrorMatch */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                What is MirrorMatch?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                MirrorMatch is a fun and engaging photo guessing game where you can upload photos
                and challenge other players to guess who is in the picture. Test your knowledge of
                friends, family, or colleagues while competing for points on the leaderboard!
              </p>
            </section>

            {/* How to Play */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How to Play
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Upload Photos:</strong> Go to the Upload page and add photos with answer
                  names. You can upload files or use image URLs.
                </li>
                <li>
                  <strong>Guess Photos:</strong> Browse the Photos page and click on any photo to
                  make your guess. Enter the name of the person you think is in the picture.
                </li>
                <li>
                  <strong>Earn Points:</strong> Get points for each correct guess! The more you
                  guess correctly, the higher you&apos;ll climb on the leaderboard.
                </li>
                <li>
                  <strong>Compete:</strong> Check the Leaderboard to see how you rank against other
                  players.
                </li>
              </ol>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Key Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Photo Upload:</strong> Share photos via file upload or URL
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Guessing System:</strong> Submit guesses and get instant feedback
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Email Notifications:</strong> Get notified when new photos are
                    uploaded
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Leaderboard:</strong> Track rankings and compete with others
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>
                    <strong>Profile Management:</strong> View your points and manage your account
                  </span>
                </li>
              </ul>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Keyboard Shortcuts
              </h3>
              <div className="bg-gray-50 rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                      Shift
                    </kbd>
                    {" + "}
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                      ?
                    </kbd>
                  </span>
                  <span className="text-gray-600">Open/Close this help window</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                      Esc
                    </kbd>
                  </span>
                  <span className="text-gray-600">Close help window</span>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Tips
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💡</span>
                  <span>Guesses are case-insensitive, so don&apos;t worry about capitalization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💡</span>
                  <span>You can&apos;t guess your own photos, but you can still view them</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💡</span>
                  <span>
                    You&apos;ll receive email notifications when other users upload new photos
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💡</span>
                  <span>Check the leaderboard regularly to see your ranking</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
