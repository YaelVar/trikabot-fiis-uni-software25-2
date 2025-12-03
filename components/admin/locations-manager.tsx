"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X, Upload, FileSpreadsheet, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Location {
  id: string
  name: string
  type: "salon" | "laboratorio" | "oficina"
  building: string
  floor: string
  description: string
  status: "active" | "inactive"
}

const initialLocations: Location[] = [
  {
    id: "1",
    name: "Salón 301",
    type: "salon",
    building: "Pabellón A",
    floor: "3",
    description: "Salón de clases con capacidad para 40 estudiantes",
    status: "active",
  },
  {
    id: "2",
    name: "Lab. Computación 1",
    type: "laboratorio",
    building: "Pabellón B",
    floor: "2",
    description: "Laboratorio con 30 computadoras",
    status: "active",
  },
]

export function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Location>>({})
  const [uploadMode, setUploadMode] = useState<"manual" | "bulk">("manual")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<Location[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ type: "salon", status: "active" })
  }

  const handleEdit = (location: Location) => {
    setEditingId(location.id)
    setFormData(location)
  }

  const handleSave = () => {
    if (isAdding) {
      const newLocation: Location = {
        id: Date.now().toString(),
        ...(formData as Location),
      }
      setLocations([...locations, newLocation])
      setIsAdding(false)
    } else if (editingId) {
      setLocations(locations.map((loc) => (loc.id === editingId ? { ...loc, ...formData } : loc)))
      setEditingId(null)
    }
    setFormData({})
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
    setUploadFile(null)
    setUploadPreview([])
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta ubicación?")) {
      setLocations(locations.filter((loc) => loc.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === id ? { ...loc, status: loc.status === "active" ? "inactive" : "active" } : loc,
      ),
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      // Simulate CSV parsing
      const mockData: Location[] = [
        {
          id: "temp1",
          name: "Salón 401",
          type: "salon",
          building: "Pabellón C",
          floor: "4",
          description: "Salón importado desde CSV",
          status: "active",
        },
        {
          id: "temp2",
          name: "Lab. Física",
          type: "laboratorio",
          building: "Pabellón D",
          floor: "1",
          description: "Laboratorio importado desde CSV",
          status: "active",
        },
      ]
      setUploadPreview(mockData)
    }
  }

  const handleConfirmUpload = () => {
    const newLocations = uploadPreview.map((loc) => ({
      ...loc,
      id: Date.now().toString() + Math.random(),
    }))
    setLocations([...locations, ...newLocations])
    setShowConfirmation(true)
    setTimeout(() => {
      setShowConfirmation(false)
      setUploadFile(null)
      setUploadPreview([])
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Ubicaciones</h2>
          <p className="text-gray-600">Administra salones, laboratorios y oficinas</p>
        </div>
        {!isAdding && !editingId && (
          <div className="flex gap-2">
            <Button
              onClick={() => setUploadMode("bulk")}
              variant="outline"
              className="gap-2 bg-transparent border-gray-300"
            >
              <Upload className="w-4 h-4" />
              Carga Masiva
            </Button>
            <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
              <Plus className="w-4 h-4" />
              Agregar Ubicación
            </Button>
          </div>
        )}
      </div>

      {showConfirmation && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Datos cargados exitosamente. El chatbot ahora presentará esta información.
          </AlertDescription>
        </Alert>
      )}

      {(isAdding || editingId) && (
        <Card className="border-cyan-200 bg-white">
          <CardHeader>
            <CardTitle>{isAdding ? "Nueva Ubicación" : "Editar Ubicación"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "manual" | "bulk")} className="mb-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="manual" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                  Carga Manual
                </TabsTrigger>
                <TabsTrigger value="bulk" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                  Carga Masiva
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Salón 301"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select
                      value={formData.type || "salon"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Location["type"] })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white"
                    >
                      <option value="salon">Salón</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="oficina">Oficina</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Edificio</Label>
                    <Input
                      value={formData.building || ""}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      placeholder="Ej: Pabellón A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Piso</Label>
                    <Input
                      value={formData.floor || ""}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="Ej: 3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción detallada de la ubicación"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">Sube un archivo CSV o Excel con las ubicaciones</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="gap-2 bg-white" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Seleccionar Archivo
                      </span>
                    </Button>
                  </label>
                  {uploadFile && <p className="text-sm text-cyan-600 mt-2">Archivo seleccionado: {uploadFile.name}</p>}
                </div>

                {uploadPreview.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Vista previa ({uploadPreview.length} registros)</h4>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Edificio</th>
                            <th className="px-4 py-2 text-left">Piso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreview.map((loc, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="px-4 py-2">{loc.name}</td>
                              <td className="px-4 py-2 capitalize">{loc.type}</td>
                              <td className="px-4 py-2">{loc.building}</td>
                              <td className="px-4 py-2">{loc.floor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button onClick={handleConfirmUpload} className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Confirmar y Cargar Datos
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              {uploadMode === "manual" && (
                <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
              )}
              <Button
                onClick={handleCancel}
                variant="outline"
                className="gap-2 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="border-gray-200 bg-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription>
                    {location.building} - Piso {location.floor}
                  </CardDescription>
                </div>
                <Badge
                  variant={location.status === "active" ? "default" : "secondary"}
                  className={location.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {location.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline" className="capitalize">
                  {location.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{location.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(location)} className="flex-1 gap-2">
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(location.id)} className="flex-1">
                  {location.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(location.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
