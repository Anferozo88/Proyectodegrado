"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/app/firebase"
import { useToast } from "@/components/ui/use-toast"

export interface Command {
  id: string
  name: string
  description: string
  command: string
  createdAt: any
}

export interface NewCommand {
  name: string
  description: string
  command: string
}

export function useCommands() {
  const { toast } = useToast()

  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCommands()
  }, [])

  const fetchCommands = async () => {
    try {
      setLoading(true)
      const commandsRef = collection(db, "nmap_commands")
      const q = query(commandsRef, orderBy("name"))
      const querySnapshot = await getDocs(q)

      const commandsList: Command[] = []
      querySnapshot.forEach((doc) => {
        commandsList.push({
          id: doc.id,
          ...doc.data(),
        } as Command)
      })

      setCommands(commandsList)
      setError(null)
    } catch (error) {
      console.error("Error fetching commands:", error)
      setError("Error al cargar los comandos")
    } finally {
      setLoading(false)
    }
  }

  const addCommand = async (newCommand: NewCommand) => {
    try {
      if (!newCommand.name || !newCommand.command) {
        toast({
          variant: "destructive",
          title: "Campos requeridos",
          description: "El nombre y el comando son requeridos",
        })
        return false
      }

      const docRef = await addDoc(collection(db, "nmap_commands"), {
        ...newCommand,
        createdAt: serverTimestamp(),
      })

      setCommands([
        ...commands,
        {
          id: docRef.id,
          ...newCommand,
          createdAt: new Date(),
        },
      ])

      toast({
        title: "Comando creado",
        description: "El comando se ha creado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error adding command:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear el comando",
      })
      return false
    }
  }

  const updateCommand = async (commandId: string, updatedCommand: NewCommand) => {
    try {
      if (!updatedCommand.name || !updatedCommand.command) {
        toast({
          variant: "destructive",
          title: "Campos requeridos",
          description: "El nombre y el comando son requeridos",
        })
        return false
      }

      await updateDoc(doc(db, "nmap_commands", commandId), {
        name: updatedCommand.name,
        description: updatedCommand.description,
        command: updatedCommand.command,
      })

      setCommands(commands.map((command) => (command.id === commandId ? { ...command, ...updatedCommand } : command)))

      toast({
        title: "Comando actualizado",
        description: "El comando se ha actualizado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error updating command:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el comando",
      })
      return false
    }
  }

  const deleteCommand = async (commandId: string) => {
    try {
      await deleteDoc(doc(db, "nmap_commands", commandId))

      setCommands(commands.filter((command) => command.id !== commandId))

      toast({
        title: "Comando eliminado",
        description: "El comando se ha eliminado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error deleting command:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el comando",
      })
      return false
    }
  }

  return {
    commands,
    loading,
    error,
    addCommand,
    updateCommand,
    deleteCommand,
    refreshCommands: fetchCommands,
  }
}

