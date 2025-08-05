"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Clock, Code } from "lucide-react"
import CommandsList from "@/components/admin/commands-list"
import ScheduledScansList from "@/components/admin/scheduled-scans-list"
import GlobalAlertsList from "@/components/admin/global-alerts-list"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("alerts")

  return (
    <div className="container space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Administración</h1>

      <Tabs defaultValue="alerts" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas Globales
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Escaneos Programados
          </TabsTrigger>
          <TabsTrigger value="commands" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Comandos Nmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Globales</CardTitle>
              <CardDescription>Lista de todas las alertas detectadas en todos los escaneos</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalAlertsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Escaneos Programados</CardTitle>
              <CardDescription>Administra los escaneos programados para ejecutarse automáticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduledScansList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands">
          <Card>
            <CardHeader>
              <CardTitle>Comandos Nmap</CardTitle>
              <CardDescription>
                Gestiona los comandos de Nmap reutilizables para los escaneos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommandsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

