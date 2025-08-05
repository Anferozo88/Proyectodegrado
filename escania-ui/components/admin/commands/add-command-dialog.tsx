"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { NewCommand } from "./use-commands"

interface AddCommandDialogProps {
  onAddCommand: (command: NewCommand) => Promise<boolean>
}

export function AddCommandDialog({ onAddCommand }: AddCommandDialogProps) {
  const [open, setOpen] = useState(false)
  const [newCommand, setNewCommand] = useState<NewCommand>({
    name: "",
    description: "",
    command: "",
  })

  const resetForm = () => {
    setNewCommand({
      name: "",
      description: "",
      command: "",
    })
  }

  const handleSubmit = async () => {
    const success = await onAddCommand(newCommand)
    if (success) {
      setOpen(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Comando
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo comando</DialogTitle>
          <DialogDescription>Ingresa los detalles del nuevo comando de Nmap</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={newCommand.name}
              onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
              placeholder="Ej: Escaneo de puertos común"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={newCommand.description}
              onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
              placeholder="Ej: Escanea los 1000 puertos más comunes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="command">Comando</Label>
            <Textarea
              id="command"
              value={newCommand.command}
              onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
              placeholder="Ej: nmap -sV -sS -T4"
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

