"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role?: string; name?: string; id_tipo_usuario?: number } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    // Preferir comprobación por id_tipo_usuario para evitar discrepancias de cadena
    if (parsedUser.id_tipo_usuario !== undefined) {
      if (parsedUser.id_tipo_usuario !== 2) {
        router.push("/admin")
        return
      }
    } else if (parsedUser.role !== "student") {
      router.push("/admin")
      return
    }
    setUser(parsedUser)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={user} />
      <main className="flex-1 flex">
        <ChatInterface user={user} />
      </main>
    </div>
  )
}
