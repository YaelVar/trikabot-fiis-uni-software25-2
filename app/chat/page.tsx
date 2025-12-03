"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string; name: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "student") {
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
