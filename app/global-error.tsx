"use client"

// Minimal global error boundary to avoid hook usage on missing providers during prerender.
// Does not rely on any contexts; renders a simple retry action.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h1>Something went wrong</h1>
          <p>{error.message || "An unexpected error occurred."}</p>
          {error.digest ? <p>Reference: {error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
