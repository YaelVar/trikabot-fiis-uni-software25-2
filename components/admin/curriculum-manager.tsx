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
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Course {
  code: string
  name: string
  credits: number
  hours: number
  semester: number
  prerequisites: string[]
}

interface Curriculum {
  id: string
  career: string
  totalCredits: number
  totalHours: number
  graduationRequirements: string
  courses: Course[]
  status: "active" | "inactive"
}

const initialCurricula: Curriculum[] = [
  {
    id: "1",
    career: "Ingeniería de Sistemas",
    totalCredits: 200,
    totalHours: 3600,
    graduationRequirements:
      "Completar 200 créditos, aprobar todos los cursos obligatorios, realizar prácticas pre-profesionales",
    courses: [
      { code: "IS101", name: "Introducción a la Programación", credits: 4, hours: 6, semester: 1, prerequisites: [] },
      { code: "IS102", name: "Matemática I", credits: 5, hours: 7, semester: 1, prerequisites: [] },
      { code: "IS201", name: "Estructura de Datos", credits: 4, hours: 6, semester: 2, prerequisites: ["IS101"] },
    ],
    status: "active",
  },
]

export function CurriculumManager() {
  const [curricula, setCurricula] = useState<Curriculum[]>(initialCurricula)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Curriculum>>({})
  const [currentCourses, setCurrentCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkPreview, setBulkPreview] = useState<Course[]>([])
  const [bulkValidation, setBulkValidation] = useState<{ valid: boolean; message: string } | null>(null)

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ status: "active" })
    setCurrentCourses([])
  }

  const handleEdit = (curriculum: Curriculum) => {
    setEditingId(curriculum.id)
    setFormData(curriculum)
    setCurrentCourses([...curriculum.courses])
  }

  const handleSave = () => {
    const curriculumData = {
      ...formData,
      courses: currentCourses,
    }

    if (isAdding) {
      const newCurriculum: Curriculum = {
        id: Date.now().toString(),
        ...(curriculumData as Curriculum),
      }
      setCurricula([...curricula, newCurriculum])
      setIsAdding(false)
    } else if (editingId) {
      setCurricula(curricula.map((c) => (c.id === editingId ? { ...c, ...curriculumData } : c)))
      setEditingId(null)
    }
    setFormData({})
    setCurrentCourses([])
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
    setCurrentCourses([])
    setEditingCourse(null)
    setShowBulkUpload(false)
    setBulkFile(null)
    setBulkPreview([])
    setBulkValidation(null)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta malla curricular?")) {
      setCurricula(curricula.filter((c) => c.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setCurricula(
      curricula.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)),
    )
  }

  const addCourse = () => {
    setEditingCourse({ code: "", name: "", credits: 0, hours: 0, semester: 1, prerequisites: [] })
  }

  const saveCourse = () => {
    if (!editingCourse) return
    const existingIndex = currentCourses.findIndex((c) => c.code === editingCourse.code)
    if (existingIndex >= 0) {
      const updated = [...currentCourses]
      updated[existingIndex] = editingCourse
      setCurrentCourses(updated)
    } else {
      setCurrentCourses([...currentCourses, editingCourse])
    }
    setEditingCourse(null)
  }

  const editCourse = (course: Course) => {
    setEditingCourse({ ...course })
  }

  const deleteCourse = (code: string) => {
    setCurrentCourses(currentCourses.filter((c) => c.code !== code))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          setBulkValidation({ valid: false, message: "El archivo debe contener al menos una fila de datos" })
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim())
        const requiredHeaders = ["codigo", "nombre", "creditos", "horas", "semestre"]
        const hasRequiredHeaders = requiredHeaders.every((h) => headers.includes(h))

        if (!hasRequiredHeaders) {
          setBulkValidation({
            valid: false,
            message: `El archivo debe contener las columnas: ${requiredHeaders.join(", ")}`,
          })
          return
        }

        const parsedCourses: Course[] = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim())
          return {
            code: values[0] || "",
            name: values[1] || "",
            credits: Number.parseInt(values[2]) || 0,
            hours: Number.parseInt(values[3]) || 0,
            semester: Number.parseInt(values[4]) || 1,
            prerequisites: values[5] ? values[5].split(";").map((p) => p.trim()) : [],
          }
        })

        setBulkPreview(parsedCourses)
        setBulkValidation({
          valid: true,
          message: `${parsedCourses.length} cursos listos para importar`,
        })
      } catch (error) {
        setBulkValidation({ valid: false, message: "Error al procesar el archivo" })
      }
    }
    reader.readAsText(file)
  }

  const confirmBulkUpload = () => {
    if (bulkPreview.length > 0) {
      setCurrentCourses([...currentCourses, ...bulkPreview])
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Malla Curricular</h2>
          <p className="text-gray-600">Administra planes de estudio y requisitos de egreso</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
            <Plus className="w-4 h-4" />
            Agregar Malla
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card className="border-cyan-200 bg-white">
          <CardHeader>
            <CardTitle>{isAdding ? "Nueva Malla Curricular" : "Editar Malla Curricular"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Carrera</Label>
                <select
                  value={formData.career || ""}
                  onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white"
                >
                  <option value="">Selecciona una carrera</option>
                  <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                  <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  <option value="Ingeniería Informática">Ingeniería Informática</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Total Créditos</Label>
                <Input
                  type="number"
                  value={formData.totalCredits || ""}
                  onChange={(e) => setFormData({ ...formData, totalCredits: Number.parseInt(e.target.value) })}
                  placeholder="200"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Horas</Label>
                <Input
                  type="number"
                  value={formData.totalHours || ""}
                  onChange={(e) => setFormData({ ...formData, totalHours: Number.parseInt(e.target.value) })}
                  placeholder="3600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Requisitos de Egreso</Label>
              <Textarea
                value={formData.graduationRequirements || ""}
                onChange={(e) => setFormData({ ...formData, graduationRequirements: e.target.value })}
                placeholder="Requisitos para graduarse"
                rows={3}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Cursos</Label>
                <div className="flex gap-2">
                  {!showBulkUpload && !editingCourse && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowBulkUpload(true)}
                        className="gap-2 bg-transparent border-gray-300"
                      >
                        <Upload className="w-3 h-3" />
                        Carga Masiva
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addCourse}
                        className="gap-2 bg-transparent border-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar Curso
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {showBulkUpload && (
                <Card className="border-cyan-100 bg-cyan-50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Archivo CSV/Excel</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="flex-1" />
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent border-gray-300">
                          <FileSpreadsheet className="w-4 h-4" />
                          Plantilla
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Formato: codigo, nombre, creditos, horas, semestre, prerequisitos (separados por ;)
                      </p>
                    </div>

                    {bulkValidation && (
                      <Alert variant={bulkValidation.valid ? "default" : "destructive"}>
                        <AlertDescription>{bulkValidation.message}</AlertDescription>
                      </Alert>
                    )}

                    {bulkPreview.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Vista Previa ({bulkPreview.length} cursos)</Label>
                        <div className="max-h-64 overflow-y-auto border rounded-lg bg-white">
                          {bulkPreview.map((course, idx) => (
                            <div key={idx} className="p-2 border-b last:border-b-0 text-xs">
                              <span className="font-medium text-cyan-700">{course.code}</span> - {course.name}
                              <span className="text-gray-500 ml-2">
                                ({course.credits} créditos, Sem. {course.semester})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {bulkValidation?.valid && (
                      <Alert className="bg-cyan-100 border-cyan-300">
                        <AlertDescription className="text-cyan-900 text-sm">
                          ✓ Los cursos han sido validados. Al confirmar, esta información estará disponible para el
                          chatbot.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={confirmBulkUpload}
                        disabled={!bulkValidation?.valid}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelBulkUpload}
                        className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {editingCourse && (
                <Card className="border-cyan-100 bg-cyan-50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Código</Label>
                        <Input
                          value={editingCourse.code}
                          onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                          placeholder="IS101"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={editingCourse.name}
                          onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                          placeholder="Nombre del curso"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Créditos</Label>
                        <Input
                          type="number"
                          value={editingCourse.credits}
                          onChange={(e) =>
                            setEditingCourse({ ...editingCourse, credits: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Horas</Label>
                        <Input
                          type="number"
                          value={editingCourse.hours}
                          onChange={(e) =>
                            setEditingCourse({ ...editingCourse, hours: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Semestre</Label>
                        <Input
                          type="number"
                          value={editingCourse.semester}
                          onChange={(e) =>
                            setEditingCourse({ ...editingCourse, semester: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Prerequisitos (códigos separados por coma)</Label>
                        <Input
                          value={editingCourse.prerequisites.join(", ")}
                          onChange={(e) =>
                            setEditingCourse({
                              ...editingCourse,
                              prerequisites: e.target.value
                                .split(",")
                                .map((p) => p.trim())
                                .filter((p) => p),
                            })
                          }
                          placeholder="IS101, IS102"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={saveCourse} className="bg-cyan-600 hover:bg-cyan-700">
                        Guardar Curso
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCourse(null)}
                        className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentCourses.map((course) => (
                  <div key={course.code} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-cyan-700">{course.code}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-900">{course.name}</span>
                      </div>
                      <div className="text-gray-600">
                        {course.credits} créditos • {course.hours}h
                      </div>
                      <div className="text-gray-600">Sem. {course.semester}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => editCourse(course)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCourse(course.code)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                <Save className="w-4 h-4" />
                Guardar Malla
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

      <div className="grid grid-cols-1 gap-4">
        {curricula.map((curriculum) => (
          <Card key={curriculum.id} className="border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">{curriculum.career}</CardTitle>
                  <CardDescription>
                    {curriculum.totalCredits} créditos • {curriculum.totalHours} horas • {curriculum.courses.length}{" "}
                    cursos
                  </CardDescription>
                </div>
                <Badge
                  className={`${curriculum.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {curriculum.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Requisitos de Egreso</p>
                <p className="text-sm text-gray-600">{curriculum.graduationRequirements}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cursos por Semestre</p>
                <div className="space-y-3">
                  {Array.from(new Set(curriculum.courses.map((c) => c.semester)))
                    .sort()
                    .map((semester) => (
                      <div key={semester} className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-medium text-sm text-cyan-700 mb-2">Semestre {semester}</p>
                        <div className="space-y-1">
                          {curriculum.courses
                            .filter((c) => c.semester === semester)
                            .map((course) => (
                              <div key={course.code} className="text-xs text-gray-700 flex justify-between">
                                <span>
                                  <span className="font-medium">{course.code}</span> - {course.name}
                                </span>
                                <span className="text-gray-500">{course.credits} créditos</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(curriculum)} className="gap-2">
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(curriculum.id)}>
                  {curriculum.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(curriculum.id)}
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
