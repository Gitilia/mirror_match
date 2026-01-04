/**
 * Activity logging utility for tracking user actions
 */

export interface ActivityLog {
  timestamp: string
  userId?: string
  userEmail?: string
  userRole?: string
  action: string
  path: string
  method: string
  ip?: string
  details?: Record<string, unknown>
}

export function logActivity(
  action: string,
  path: string,
  method: string,
  user?: { id: string; email: string; role: string } | null,
  details?: Record<string, unknown>,
  request?: Request
) {
  const timestamp = new Date().toISOString()
  const ip = request?.headers.get("x-forwarded-for") || 
             request?.headers.get("x-real-ip") || 
             "unknown"
  
  const log: ActivityLog = {
    timestamp,
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
    action,
    path,
    method,
    ip: ip.split(",")[0].trim(), // Get first IP if multiple
    details
  }
  
  // Format: [ACTION] timestamp | method path | User: email (role) | IP: ip | Details: {...}
  const userInfo = user 
    ? `${user.email} (${user.role})` 
    : "UNAUTHENTICATED"
  
  const detailsStr = details ? ` | Details: ${JSON.stringify(details)}` : ""
  
  console.log(`[${action}] ${timestamp} | ${method} ${path} | User: ${userInfo} | IP: ${ip.split(",")[0].trim()}${detailsStr}`)
  
  return log
}
