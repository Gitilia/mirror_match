/**
 * Activity logging utility for tracking user actions
 * Uses structured logging with log levels for better production control
 */

import { logger } from './logger'

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

/**
 * Log user activity with structured data
 * Uses INFO level logging - can be filtered via LOG_LEVEL environment variable
 * 
 * @param action - The action being performed (e.g., "PHOTO_UPLOAD", "GUESS_SUBMITTED")
 * @param path - The request path
 * @param method - The HTTP method
 * @param user - Optional user object (id, email, role)
 * @param details - Optional additional context data
 * @param request - Optional Request object for extracting IP address
 * @returns Structured activity log object
 */
export function logActivity(
  action: string,
  path: string,
  method: string,
  user?: { id: string; email: string; role: string } | null,
  details?: Record<string, unknown>,
  request?: Request
): ActivityLog {
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
  
  // Use structured logging with INFO level
  // This allows filtering via LOG_LEVEL environment variable
  logger.info(`Activity: ${action}`, {
    method,
    path,
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
    ip: ip.split(",")[0].trim(),
    ...(details && { details }),
  })
  
  return log
}
