import { TableCell, TableRow } from "@/components/ui/table"
import type { Command } from "./use-commands"
import { EditCommandDialog } from "./edit-command-dialog"
import { DeleteCommandDialog } from "./delete-command-dialog"

interface CommandsTableProps {
  commands: Command[]
  onUpdateCommand: (commandId: string, command: any) => Promise<boolean>
  onDeleteCommand: (commandId: string) => Promise<boolean>
}

export function CommandsTable({ commands, onUpdateCommand, onDeleteCommand }: CommandsTableProps) {
  if (commands.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="h-24 text-center">
          No se encontraron comandos
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {commands.map((command) => (
        <TableRow key={command.id}>
          <TableCell className="font-medium">{command.name}</TableCell>
          <TableCell>{command.description || <span className="text-muted-foreground">Sin descripción</span>}</TableCell>
          <TableCell>
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {command.command.length > 40 ? command.command.substring(0, 40) + "..." : command.command}
            </code>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <EditCommandDialog command={command} onUpdateCommand={onUpdateCommand} />
              <DeleteCommandDialog command={command} onDeleteCommand={onDeleteCommand} />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

