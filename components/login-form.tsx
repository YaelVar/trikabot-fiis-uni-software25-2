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
    try {
      const body = new URLSearchParams()
      body.append('username', email)
      body.append('password', password)

      const res = await fetch('http://127.0.0.1:8080/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.detail || 'Credenciales incorrectas')
        setIsLoading(false)
        return
      }

      const data = await res.json()
      // Guardamos información mínima en localStorage para uso del frontend
      const user = { email: data.email, role: data.role, name: data.name, id_tipo_usuario: data.id_tipo_usuario, token: data.access_token }
      localStorage.setItem('user', JSON.stringify(user))

      // Redirigimos según el rol retornado por el backend
      if (data.id_tipo_usuario === 1) {
        router.push('/admin')
      } else {
        router.push('/chat')
      }
    } catch (e) {
      setError('Error al conectar con el servidor')
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

    try {
      const body = {
        fullName: registerData.fullName,
        studentCode: registerData.studentCode,
        career: registerData.career,
        semester: registerData.semester,
        phone: registerData.phone,
        email,
        password,
      }

      const res = await fetch("http://127.0.0.1:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.detail || "Error al crear la cuenta")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      const user = { email: data.email, role: data.role, name: data.name, id_tipo_usuario: data.id_tipo_usuario, token: data.access_token }
      localStorage.setItem("user", JSON.stringify(user))
      router.push("/chat")
    } catch (err) {
      setError("Error al conectar con el servidor")
      setIsLoading(false)
    }
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

        {/* Credenciales de prueba eliminadas en producción */}
      </CardContent>
    </Card>
  )
}
