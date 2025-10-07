import { cookies } from "next/headers"
import { prisma } from "./prisma"

export interface SessionUser {
  id: string
  phone: string
  name: string
  email: string | null
  role: string
}

const SESSION_COOKIE_NAME = "session_token"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

interface EncodedSession {
  userId: string
  exp: number
}

export async function createSession(userId: string): Promise<string> {
  const exp = Date.now() + SESSION_DURATION
  const payload: EncodedSession = { userId, exp }
  const value = Buffer.from(JSON.stringify(payload)).toString("base64")

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(exp),
    path: "/",
  })

  return value
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const value = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!value) {
      return null
    }

    let decoded: EncodedSession | null = null
    try {
      const json = Buffer.from(value, "base64").toString("utf8")
      decoded = JSON.parse(json)
    } catch {
      return null
    }

    if (!decoded || typeof decoded.userId !== "string" || typeof decoded.exp !== "number") {
      return null
    }

    if (decoded.exp <= Date.now()) {
      await deleteSession()
      return null
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          role: true,
        },
      })

      return user
    } catch (dbError) {
      console.error("[v0] Database error in getSession:", dbError)
      // Return null if database is not available instead of throwing
      return null
    }
  } catch (error) {
    console.error("[v0] Session error:", error)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
