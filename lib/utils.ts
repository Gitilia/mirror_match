import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function normalizeString(str: string): string {
  return str.trim().toLowerCase()
}
