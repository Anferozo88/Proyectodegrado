"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Loader2, Search } from "lucide-react"
import { useCommands } from "./commands/use-commands"
import { AddCommandDialog } from "./commands/add-command-dialog"
import { CommandsTable } from "./commands/commands-table"

export default function CommandsList() {
  const { commands, loading, error, addCommand, updateCommand, deleteCommand } = useCommands()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCommands = commands.filter(
    (command) =>
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.command.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar comandos..."
            className="w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <AddCommandDialog onAddCommand={addCommand} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Comando</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <CommandsTable
              commands={filteredCommands}
              onUpdateCommand={updateCommand}
              onDeleteCommand={deleteCommand}
            />
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

