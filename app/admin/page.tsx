"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role?: string; id_tipo_usuario?: number } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    // Preferir comprobación por id_tipo_usuario para evitar discrepancias de cadena
    if (parsedUser.id_tipo_usuario !== undefined) {
      if (parsedUser.id_tipo_usuario !== 1) {
        router.push("/chat")
        return
      }
    } else if (parsedUser.role !== "admin") {
      router.push("/chat")
      return
    }
    setUser(parsedUser)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />
      <main className="flex-1 p-6">
        <AdminPanel />
      </main>
    </div>
  )
}
