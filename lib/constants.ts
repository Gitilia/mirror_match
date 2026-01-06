/**
 * Application-wide constants
 */

/**
 * NextAuth session cookie name
 * Must match the cookie name defined in lib/auth.ts
 * For HTTP (localhost), no prefix. For HTTPS, Auth.js will add __Secure- prefix automatically.
 */
export const SESSION_COOKIE_NAME = "authjs.session-token"
