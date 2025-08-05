"use client"

import { useState, useEffect } from "react"
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
import { Edit } from "lucide-react"
import type { Command, NewCommand } from "./use-commands"

interface EditCommandDialogProps {
  command: Command
  onUpdateCommand: (commandId: string, command: NewCommand) => Promise<boolean>
}

export function EditCommandDialog({ command, onUpdateCommand }: EditCommandDialogProps) {
  const [open, setOpen] = useState(false)
  const [editedCommand, setEditedCommand] = useState<NewCommand>({
    name: "",
    description: "",
    command: "",
  })

  useEffect(() => {
    if (command) {
      setEditedCommand({
        name: command.name,
        description: command.description || "",
        command: command.command,
      })
    }
  }, [command])

  const handleSubmit = async () => {
    const success = await onUpdateCommand(command.id, editedCommand)
    if (success) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar comando</DialogTitle>
          <DialogDescription>Modifica los detalles del comando</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={editedCommand.name}
              onChange={(e) => setEditedCommand({ ...editedCommand, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={editedCommand.description}
              onChange={(e) => setEditedCommand({ ...editedCommand, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-command">Comando</Label>
            <Textarea
              id="edit-command"
              value={editedCommand.command}
              onChange={(e) => setEditedCommand({ ...editedCommand, command: e.target.value })}
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

