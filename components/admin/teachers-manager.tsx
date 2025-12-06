"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X, CheckCircle, XCircle, Upload, FileSpreadsheet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Teacher {
  id: string
  name: string
  email: string
  specialty: string
  courses: string[]
  methodology: string
  tips: string
  validated: boolean
  status: "active" | "inactive"
}

const initialTeachers: Teacher[] = []

export function TeachersManager() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Teacher>>({})
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkPreview, setBulkPreview] = useState<Teacher[]>([])
  const [bulkValidation, setBulkValidation] = useState<{ valid: boolean; message: string } | null>(null)

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ courses: [], validated: false, status: "active" })
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id)
    setFormData(teacher)
  }

  const handleSave = () => {
    if (isAdding) {
      const newTeacher: Teacher = {
        ...(formData as Teacher),
        id: Date.now().toString(),
      }
      setTeachers([...teachers, newTeacher])
      setIsAdding(false)
    } else if (editingId) {
      setTeachers(teachers.map((t) => (t.id === editingId ? { ...t, ...formData } : t)))
      setEditingId(null)
    }
    setFormData({})
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este docente?")) {
      setTeachers(teachers.filter((t) => t.id !== id))
    }
  }

  const toggleValidation = (id: string) => {
    setTeachers(teachers.map((t) => (t.id === id ? { ...t, validated: !t.validated } : t)))
  }

  const toggleStatus = (id: string) => {
    setTeachers(
      teachers.map((t) => (t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t)),
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)

    // Simulate file parsing and validation
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          setBulkValidation({ valid: false, message: "El archivo debe contener al menos una fila de datos" })
          return
        }

        // Parse CSV (simplified)
        const headers = lines[0].split(",").map((h) => h.trim())
        const requiredHeaders = ["nombre", "email", "especialidad", "cursos"]
        const hasRequiredHeaders = requiredHeaders.every((h) => headers.includes(h))

        if (!hasRequiredHeaders) {
          setBulkValidation({
            valid: false,
            message: `El archivo debe contener las columnas: ${requiredHeaders.join(", ")}`,
          })
          return
        }

        const parsedTeachers: Teacher[] = lines.slice(1).map((line, idx) => {
          const values = line.split(",").map((v) => v.trim())
          return {
            id: `bulk-${Date.now()}-${idx}`,
            name: values[0] || "",
            email: values[1] || "",
            specialty: values[2] || "",
            courses: values[3] ? values[3].split(";").map((c) => c.trim()) : [],
            methodology: values[4] || "",
            tips: values[5] || "",
            validated: false,
            status: "active" as const,
          }
        })

        setBulkPreview(parsedTeachers)
        setBulkValidation({
          valid: true,
          message: `${parsedTeachers.length} docentes listos para importar`,
        })
      } catch (error) {
        setBulkValidation({ valid: false, message: "Error al procesar el archivo" })
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("http://127.0.0.1:8080/api/teachers")
        if (!res.ok) throw new Error("No se pudo cargar la lista de docentes")
        const data = await res.json()
        // Mapear respuesta al formato interno
        const mapped: Teacher[] = (data || []).map((t: any) => ({
          id: String(t.id || Date.now() + Math.random()),
          name: t.name || t.nombres_completos || "",
          email: t.email || t.correo_institucional || "",
          specialty: t.specialty || t.especialidad || "",
          courses: t.courses || [],
          methodology: t.methodology || t.metodologia || "",
          tips: t.tips || t.consejos || "",
          validated: !!t.validated,
          status: t.status || "active",
        }))
        setTeachers(mapped)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los docentes. Verifica que el backend esté corriendo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  const confirmBulkUpload = () => {
    if (bulkPreview.length > 0) {
      setTeachers([...teachers, ...bulkPreview])
      setShowBulkUpload(false)
      setBulkFile(null)
      setBulkPreview([])
      setBulkValidation(null)
    }
  }

  const cancelBulkUpload = () => {
    setShowBulkUpload(false)
    setBulkFile(null)
    setBulkPreview([])
    setBulkValidation(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Docentes</h2>
          <p className="text-gray-600">Administra información de docentes y valida metodologías</p>
        </div>
        {!isAdding && !editingId && !showBulkUpload && (
          <div className="flex gap-2">
            <Button onClick={() => setShowBulkUpload(true)} variant="outline" className="gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Carga Masiva
            </Button>
            <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
              <Plus className="w-4 h-4" />
              Agregar Docente
            </Button>
          </div>
        )}
      </div>

      {showBulkUpload && (
        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Carga Masiva de Docentes</CardTitle>
            <CardDescription>Sube un archivo CSV o Excel con la información de múltiples docentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Archivo CSV/Excel</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="flex-1" />
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <FileSpreadsheet className="w-4 h-4" />
                  Plantilla
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Formato: nombre, email, especialidad, cursos (separados por ;), metodología, consejos
              </p>
            </div>

            {bulkValidation && (
              <Alert variant={bulkValidation.valid ? "default" : "destructive"}>
                <AlertDescription>{bulkValidation.message}</AlertDescription>
              </Alert>
            )}

            {bulkPreview.length > 0 && (
              <div className="space-y-2">
                <Label>Vista Previa ({bulkPreview.length} docentes)</Label>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {bulkPreview.map((teacher, idx) => (
                    <div key={idx} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{teacher.name}</p>
                          <p className="text-xs text-gray-600">{teacher.email}</p>
                          <p className="text-xs text-gray-500">{teacher.specialty}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {teacher.courses.length} cursos
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkValidation?.valid && (
              <Alert className="bg-cyan-50 border-cyan-200">
                <AlertDescription className="text-cyan-900">
                  ✓ Los datos han sido validados. Al confirmar, esta información estará disponible para el chatbot.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={confirmBulkUpload}
                disabled={!bulkValidation?.valid}
                className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Importación
              </Button>
              <Button
                onClick={cancelBulkUpload}
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

      {(isAdding || editingId) && (
        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>{isAdding ? "Nuevo Docente" : "Editar Docente"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label>Correo Institucional</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jperez@uni.edu.pe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <select
                value={formData.specialty || ""}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white"
              >
                <option value="">Selecciona una especialidad</option>
                <option value="Investigación de Operaciones">Investigación de Operaciones</option>
                <option value="Sistemas de Información">Sistemas de Información</option>
                <option value="Gestión de Procesos">Gestión de Procesos</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
                <option value="Análisis de Sistemas">Análisis de Sistemas</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cursos (separados por coma)</Label>
              <Input
                value={formData.courses?.join(", ") || ""}
                onChange={(e) => setFormData({ ...formData, courses: e.target.value.split(",").map((c) => c.trim()) })}
                placeholder="Curso 1, Curso 2, Curso 3"
              />
            </div>
            <div className="space-y-2">
              <Label>Metodología</Label>
              <Textarea
                value={formData.methodology || ""}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                placeholder="Describe la metodología de enseñanza"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Consejos para Estudiantes</Label>
              <Textarea
                value={formData.tips || ""}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                placeholder="Consejos útiles para el curso"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                <Save className="w-4 h-4" />
                Guardar
              </Button>
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

      {isLoading ? (
        <div className="py-8">Cargando docentes...</div>
      ) : error ? (
        <div className="py-8 text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
          <Card key={teacher.id} className="border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <CardDescription>{teacher.email}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={teacher.status === "active" ? "default" : "secondary"}
                    className={`${teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {teacher.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                  {teacher.validated ? (
                    <Badge className="bg-green-100 text-green-800 gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Validado
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-0 gap-1">
                      <XCircle className="w-3 h-3" />
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Especialidad</p>
                <p className="text-sm text-gray-600">{teacher.specialty}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Cursos</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.courses.map((course, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Metodología</p>
                <p className="text-sm text-gray-600">{teacher.methodology}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Consejos</p>
                <p className="text-sm text-gray-600">{teacher.tips}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)} className="gap-2">
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleValidation(teacher.id)}
                  className={teacher.validated ? "text-orange-600" : "text-green-600"}
                >
                  {teacher.validated ? "Invalidar" : "Validar"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(teacher.id)}>
                  {teacher.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(teacher.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  )
}
