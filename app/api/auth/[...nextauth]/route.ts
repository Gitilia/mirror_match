import { handlers } from "@/lib/auth"

// No wrapper needed - Auth.js now handles cookies correctly via useSecureCookies
export const { GET, POST } = handlers
