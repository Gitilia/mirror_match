import { handlers } from "@/lib/auth"

// Mark this route as dynamic to prevent build-time data collection
// NextAuth requires runtime environment variables and cannot be pre-rendered
export const dynamic = "force-dynamic"

export const { GET, POST } = handlers
