"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface ProfileSettingsProps {
  user: { email: string; role: string; name: string }
  onClose: () => void
}

export function ProfileSettings({ user, onClose }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  const handleSave = () => {
    const updatedUser = { ...user, name }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuración de Perfil</DialogTitle>
          <DialogDescription>Administra tus preferencias y datos personales</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input id="email" value={user.email} disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                value={user.role === "admin" ? "Administrador" : "Estudiante"}
                disabled
                className="bg-gray-100"
              />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Notificaciones push</p>
                <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por correo</p>
                <p className="text-sm text-gray-500">Recibe actualizaciones por email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
