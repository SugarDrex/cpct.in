"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

type UserToken = {
  username: string
  email: string
  exp?: number
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    try {
      const decoded = jwtDecode<UserToken>(token)

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      setAuthorized(true)
    } catch {
      localStorage.removeItem("token")
      router.push("/login")
    }
  }, [router])

  if (!authorized) return null

  return <>{children}</>
}