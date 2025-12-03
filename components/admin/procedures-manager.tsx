"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X, MoveUp, MoveDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProcedureStep {
  order: number
  description: string
}

interface Procedure {
  id: string
  title: string
  category: "matricula" | "dirce" | "intranet" | "otro"
  description: string
  steps: ProcedureStep[]
  requirements: string
  estimatedTime: string
  status: "active" | "inactive"
}

const initialProcedures: Procedure[] = [
  {
    id: "1",
    title: "Proceso de Matrícula",
    category: "matricula",
    description: "Guía completa para realizar tu matrícula",
    steps: [
      { order: 1, description: "Ingresar al sistema de matrícula con tu código y contraseña" },
      { order: 2, description: "Revisar los cursos disponibles y horarios" },
      { order: 3, description: "Seleccionar los cursos según tu plan de estudios" },
      { order: 4, description: "Confirmar la matrícula y verificar el resumen" },
    ],
    requirements: "No tener deudas, estar habilitado para matrícula",
    estimatedTime: "30 minutos",
    status: "active",
  },
]

export function ProceduresManager() {
  const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Procedure>>({})
  const [currentSteps, setCurrentSteps] = useState<ProcedureStep[]>([])

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ category: "matricula", status: "active" })
    setCurrentSteps([{ order: 1, description: "" }])
  }

  const handleEdit = (procedure: Procedure) => {
    setEditingId(procedure.id)
    setFormData(procedure)
    setCurrentSteps([...procedure.steps])
  }

  const handleSave = () => {
    const procedureData = {
      ...formData,
      steps: currentSteps.filter((s) => s.description.trim() !== ""),
    }

    if (isAdding) {
      const newProcedure: Procedure = {
        id: Date.now().toString(),
        ...(procedureData as Procedure),
      }
      setProcedures([...procedures, newProcedure])
      setIsAdding(false)
    } else if (editingId) {
      setProcedures(procedures.map((p) => (p.id === editingId ? { ...p, ...procedureData } : p)))
      setEditingId(null)
    }
    setFormData({})
    setCurrentSteps([])
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
    setCurrentSteps([])
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este trámite?")) {
      setProcedures(procedures.filter((p) => p.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setProcedures(
      procedures.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)),
    )
  }

  const addStep = () => {
    setCurrentSteps([...currentSteps, { order: currentSteps.length + 1, description: "" }])
  }

  const updateStep = (index: number, description: string) => {
    const updated = [...currentSteps]
    updated[index].description = description
    setCurrentSteps(updated)
  }

  const removeStep = (index: number) => {
    const updated = currentSteps.filter((_, i) => i !== index)
    updated.forEach((step, i) => (step.order = i + 1))
    setCurrentSteps(updated)
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === currentSteps.length - 1)) return
    const updated = [...currentSteps]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    updated.forEach((step, i) => (step.order = i + 1))
    setCurrentSteps(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Trámites</h2>
          <p className="text-gray-600">Administra guías para trámites administrativos</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
            <Plus className="w-4 h-4" />
            Agregar Trámite
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>{isAdding ? "Nuevo Trámite" : "Editar Trámite"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre del trámite"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select
                  value={formData.category || "matricula"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Procedure["category"] })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                >
                  <option value="matricula">Matrícula</option>
                  <option value="dirce">DIRCE</option>
                  <option value="intranet">Intranet</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción general del trámite"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Requisitos</Label>
              <Textarea
                value={formData.requirements || ""}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Requisitos necesarios"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tiempo Estimado</Label>
              <Input
                value={formData.estimatedTime || ""}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                placeholder="Ej: 30 minutos"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Pasos del Procedimiento</Label>
                <Button type="button" size="sm" variant="outline" onClick={addStep} className="gap-2 bg-transparent">
                  <Plus className="w-3 h-3" />
                  Agregar Paso
                </Button>
              </div>
              <div className="space-y-2">
                {currentSteps.map((step, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex flex-col gap-1 pt-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <MoveUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => moveStep(index, "down")}
                        disabled={index === currentSteps.length - 1}
                        className="h-6 w-6"
                      >
                        <MoveDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="w-8 h-10 flex items-center justify-center bg-cyan-100 text-cyan-700 font-bold rounded">
                        {step.order}
                      </div>
                      <Input
                        value={step.description}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder={`Paso ${step.order}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
                <Save className="w-4 h-4" />
                Guardar
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {procedures.map((procedure) => (
          <Card key={procedure.id} className="border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{procedure.title}</CardTitle>
                  <CardDescription>{procedure.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {procedure.category}
                  </Badge>
                  <Badge
                    variant={procedure.status === "active" ? "default" : "secondary"}
                    className={procedure.status === "active" ? "bg-cyan-600" : ""}
                  >
                    {procedure.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Requisitos</p>
                  <p className="text-sm text-gray-600">{procedure.requirements}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tiempo Estimado</p>
                  <p className="text-sm text-gray-600">{procedure.estimatedTime}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pasos</p>
                <ol className="space-y-2">
                  {procedure.steps.map((step) => (
                    <li key={step.order} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {step.order}
                      </span>
                      <span className="text-sm text-gray-600 flex-1">{step.description}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(procedure)} className="gap-2">
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(procedure.id)}>
                  {procedure.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(procedure.id)}
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
