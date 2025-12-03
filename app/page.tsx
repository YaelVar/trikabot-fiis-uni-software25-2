import { LoginForm } from "@/components/login-form"
import { GraduationCap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-cyan-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="w-10 h-10 text-cyan-600" />
            <h1 className="text-4xl font-bold text-gray-900">TRIKABOT</h1>
          </div>
          <p className="text-cyan-600 font-medium">Asistente FIIS-UNI</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
