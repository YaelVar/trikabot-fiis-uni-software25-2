"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LocationsManager } from "@/components/admin/locations-manager"
import { TeachersManager } from "@/components/admin/teachers-manager"
import { OpportunitiesManager } from "@/components/admin/opportunities-manager"
import { ProceduresManager } from "@/components/admin/procedures-manager"
import { CurriculumManager } from "@/components/admin/curriculum-manager"
import { MapPin, Users, Award, FileText, BookOpen } from "lucide-react"

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("locations")

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-1">Gestiona el contenido de TRIKABOT</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap justify-start">
          <TabsTrigger
            value="locations"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2"
          >
            <MapPin className="w-4 h-4" />
            Ubicaciones
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2"
          >
            <Users className="w-4 h-4" />
            Docentes
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2"
          >
            <Award className="w-4 h-4" />
            Oportunidades
          </TabsTrigger>
          <TabsTrigger
            value="procedures"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2"
          >
            <FileText className="w-4 h-4" />
            Trámites
          </TabsTrigger>
          <TabsTrigger
            value="curriculum"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Malla Curricular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationsManager />
        </TabsContent>

        <TabsContent value="teachers">
          <TeachersManager />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunitiesManager />
        </TabsContent>

        <TabsContent value="procedures">
          <ProceduresManager />
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
