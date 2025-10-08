"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  phone: string
  name: string
  email: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<boolean>
  signup: (phone: string, password: string, name: string, email?: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: { name: string; email?: string; phone: string; currentPassword?: string; newPassword?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  // Redirect authenticated users to appropriate page based on role
  useEffect(() => {
    if (!loading && user) {
      const currentPath = window.location.pathname
      // Only redirect from auth pages, not from admin pages
      if (currentPath === "/login" || currentPath === "/signup") {
        if (user.role === "ADMIN") {
          router.push("/admin")
        } else if (user.role === "RESTAURANT_OWNER") {
          router.push("/restaurant-admin")
        } else {
          router.push("/")
        }
      }
    }
  }, [user, loading, router])

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          setUser(data.user)
        }
      }
    } catch (error) {
      // Silently fail - user is just not authenticated
      console.log("[v0] Auth check failed - database may not be initialized yet")
    } finally {
      setLoading(false)
    }
  }

  async function login(phone: string, password: string): Promise<boolean> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Login failed")
    }

    const data = await response.json()
    setUser(data.user)
    
    // Redirect users to appropriate dashboard based on role
    if (data.user.role === "ADMIN") {
      router.push("/admin")
    } else if (data.user.role === "RESTAURANT_OWNER") {
      router.push("/restaurant-admin")
    } else {
      router.push("/")
    }
    
    return true
  }

  async function signup(phone: string, password: string, name: string, email?: string) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, name, email }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Signup failed")
    }

    const data = await response.json()
    setUser(data.user)
    
    // Redirect users to appropriate dashboard based on role
    if (data.user.role === "ADMIN") {
      router.push("/admin")
    } else if (data.user.role === "RESTAURANT_OWNER") {
      router.push("/restaurant-admin")
    } else {
      router.push("/")
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/login")
  }

  async function updateUser(data: { name: string; email?: string; phone: string; currentPassword?: string; newPassword?: string }) {
    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Update failed")
    }

    const result = await response.json()
    setUser(result.user)
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
