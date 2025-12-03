"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const [registerData, setRegisterData] = useState({
    fullName: "",
    studentCode: "",
    career: "",
    semester: "",
    phone: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulated authentication
    if (email === "estudiante@uni.pe" && password === "estudiante") {
      localStorage.setItem("user", JSON.stringify({ email, role: "student", name: "Estudiante UNI" }))
      router.push("/chat")
    } else if (email === "admin@uni.pe" && password === "admin") {
      localStorage.setItem("user", JSON.stringify({ email, role: "admin", name: "Administrador" }))
      router.push("/admin")
    } else {
      setError("Credenciales incorrectas")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email.endsWith("@uni.pe")) {
      setError("Debes usar un correo institucional (@uni.pe)")
      setIsLoading(false)
      return
    }

    if (!registerData.fullName || !registerData.studentCode || !registerData.career) {
      setError("Por favor completa todos los campos obligatorios")
      setIsLoading(false)
      return
    }

    // Simulated registration - only for students
    localStorage.setItem(
      "user",
      JSON.stringify({
        email,
        role: "student",
        name: registerData.fullName,
        studentCode: registerData.studentCode,
        career: registerData.career,
        semester: registerData.semester,
        phone: registerData.phone,
      }),
    )
    router.push("/chat")
  }

  return (
    <Card className="border-cyan-200 shadow-lg">
      <CardHeader>
        <CardTitle>{showRegister ? "Registrarse" : "Iniciar Sesión"}</CardTitle>
        <CardDescription>Ingresa tus credenciales UNI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
          {showRegister && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez García"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentCode">Código de Estudiante *</Label>
                <Input
                  id="studentCode"
                  type="text"
                  placeholder="20231234"
                  value={registerData.studentCode}
                  onChange={(e) => setRegisterData({ ...registerData, studentCode: e.target.value })}
                  required
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera *</Label>
                <Input
                  id="career"
                  type="text"
                  placeholder="Ingeniería de Sistemas"
                  value={registerData.career}
                  onChange={(e) => setRegisterData({ ...registerData, career: e.target.value })}
                  required
                  className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semestre</Label>
                  <Input
                    id="semester"
                    type="number"
                    placeholder="5"
                    value={registerData.semester}
                    onChange={(e) => setRegisterData({ ...registerData, semester: e.target.value })}
                    className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="999888777"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@uni.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
            {isLoading ? "Procesando..." : showRegister ? "Crear Cuenta" : "Ingresar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowRegister(!showRegister)}
            className="text-sm text-cyan-600 hover:text-cyan-700 underline"
          >
            {showRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        {!showRegister && (
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</p>
            <p className="text-xs text-gray-600">Estudiante: estudiante@uni.pe / estudiante</p>
            <p className="text-xs text-gray-600">Admin: admin@uni.pe / admin</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
