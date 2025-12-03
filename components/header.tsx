"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, GraduationCap } from "lucide-react"
import { useState } from "react"
import { ProfileSettings } from "@/components/profile-settings"

interface HeaderProps {
  user: { email: string; role: string; name: string }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">TRIKABOT</h1>
                <p className="text-xs text-cyan-600">Asistente FIIS-UNI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="text-gray-600 hover:text-cyan-600"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showSettings && <ProfileSettings user={user} onClose={() => setShowSettings(false)} />}
    </>
  )
}
