"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Opportunity {
  id: string
  title: string
  type: "beca" | "intercambio" | "convenio"
  description: string
  requirements: string
  deadline: string
  link: string
  status: "active" | "inactive"
}

const initialOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Beca de Excelencia Académica",
    type: "beca",
    description: "Beca completa para estudiantes con promedio mayor a 16",
    requirements: "Promedio ponderado mayor a 16, no tener deudas",
    deadline: "2025-12-31",
    link: "https://uni.edu.pe/becas",
    status: "active",
  },
  {
    id: "2",
    title: "Intercambio con Universidad de Chile",
    type: "intercambio",
    description: "Programa de intercambio por un semestre",
    requirements: "Mínimo 120 créditos aprobados, nivel B2 de inglés",
    deadline: "2025-11-30",
    link: "https://uni.edu.pe/intercambios",
    status: "active",
  },
]

export function OpportunitiesManager() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Opportunity>>({})

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ type: "beca", status: "active" })
  }

  const handleEdit = (opportunity: Opportunity) => {
    setEditingId(opportunity.id)
    setFormData(opportunity)
  }

  const handleSave = () => {
    if (isAdding) {
      const newOpportunity: Opportunity = {
        id: Date.now().toString(),
        ...(formData as Opportunity),
      }
      setOpportunities([...opportunities, newOpportunity])
      setIsAdding(false)
    } else if (editingId) {
      setOpportunities(opportunities.map((opp) => (opp.id === editingId ? { ...opp, ...formData } : opp)))
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
    if (confirm("¿Estás seguro de eliminar esta oportunidad?")) {
      setOpportunities(opportunities.filter((opp) => opp.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setOpportunities(
      opportunities.map((opp) =>
        opp.id === id ? { ...opp, status: opp.status === "active" ? "inactive" : "active" } : opp,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Oportunidades</h2>
          <p className="text-gray-600">Administra becas, intercambios y convenios</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
            <Plus className="w-4 h-4" />
            Agregar Oportunidad
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>{isAdding ? "Nueva Oportunidad" : "Editar Oportunidad"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre de la oportunidad"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  value={formData.type || "beca"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Opportunity["type"] })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                >
                  <option value="beca">Beca</option>
                  <option value="intercambio">Intercambio</option>
                  <option value="convenio">Convenio</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la oportunidad"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Requisitos</Label>
              <Textarea
                value={formData.requirements || ""}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Requisitos para aplicar"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Límite</Label>
                <Input
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Enlace</Label>
                <Input
                  type="url"
                  value={formData.link || ""}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription>Vence: {new Date(opportunity.deadline).toLocaleDateString("es-PE")}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {opportunity.type}
                  </Badge>
                  <Badge
                    variant={opportunity.status === "active" ? "default" : "secondary"}
                    className={opportunity.status === "active" ? "bg-cyan-600" : ""}
                  >
                    {opportunity.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Descripción</p>
                <p className="text-sm text-gray-600">{opportunity.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Requisitos</p>
                <p className="text-sm text-gray-600">{opportunity.requirements}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Más información</p>
                <a
                  href={opportunity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-600 hover:underline"
                >
                  {opportunity.link}
                </a>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(opportunity)} className="gap-2">
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(opportunity.id)}>
                  {opportunity.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(opportunity.id)}
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
