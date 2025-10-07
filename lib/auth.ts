import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // Add country code if not present
  if (!cleaned.startsWith("1") && cleaned.length === 10) {
    return `+1${cleaned}`
  }

  if (!cleaned.startsWith("+")) {
    return `+${cleaned}`
  }

  return cleaned
}
