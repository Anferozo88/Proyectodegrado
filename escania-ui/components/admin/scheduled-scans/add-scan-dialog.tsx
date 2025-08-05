"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import type { Command, NewScan } from "./use-scheduled-scans";

interface AddScanDialogProps {
	commands: Command[];
	onAddScan: (scan: NewScan) => Promise<boolean>;
	refreshData: () => void;
}

export function AddScanDialog({
	commands,
	onAddScan,
	refreshData,
}: AddScanDialogProps) {
	const [open, setOpen] = useState(false);
	const [sending, setSending] = useState(false);
	const [newScan, setNewScan] = useState<NewScan>({
		name: "",
		target: "",
		commandId: "",
		frequency: "daily",
	});

	const resetForm = () => {
		setNewScan({
			name: "",
			target: "",
			commandId: "",
			frequency: "daily",
		});
	};

	const handleSubmit = async () => {
		setSending(true);
		const success = await onAddScan(newScan);
		if (success) {
			setOpen(false);
			setSending(false);
			resetForm();
		}
		setSending(false);
		refreshData();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nuevo Escaneo
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Programar nuevo escaneo</DialogTitle>
					<DialogDescription>
						Configura un nuevo escaneo para ejecutarse automáticamente
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							value={newScan.name}
							onChange={(e) => setNewScan({ ...newScan, name: e.target.value })}
							placeholder="Ej: Escaneo de red principal"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="target">IP o Rango de IP</Label>
						<Input
							id="target"
							value={newScan.target}
							onChange={(e) =>
								setNewScan({ ...newScan, target: e.target.value })
							}
							placeholder="Ej: 192.168.1.0/24"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="command">Comando</Label>
						<Select
							value={newScan.commandId}
							onValueChange={(value) =>
								setNewScan({ ...newScan, commandId: value })
							}
						>
							<SelectTrigger id="command">
								<SelectValue placeholder="Seleccionar comando" />
							</SelectTrigger>
							<SelectContent>
								{commands.length === 0 ? (
									<SelectItem value="no-commands" disabled>
										No hay comandos disponibles
									</SelectItem>
								) : (
									commands.map((command) => (
										<SelectItem key={command.id} value={command.id}>
											{command.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="frequency">Frecuencia</Label>
						<Select
							value={newScan.frequency}
							onValueChange={(value) =>
								setNewScan({ ...newScan, frequency: value })
							}
						>
							<SelectTrigger id="frequency">
								<SelectValue placeholder="Seleccionar frecuencia" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5/minutes">Cada 5 minutos</SelectItem>
								<SelectItem value="10/minutes">Cada 10 minutos</SelectItem>
								<SelectItem value="15/minutes">Cada 15 minutos</SelectItem>
								<SelectItem value="30/minutes">Cada 30 minutos</SelectItem>
								<SelectItem value="hourly">Cada hora</SelectItem>
								<SelectItem value="daily">Diario</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancelar
					</Button>
					{sending ? (
						<Button disabled>
							<Loader2 className="h-4 w-4 animate-spin" />
							Enviando...
						</Button>
					) : (
						<Button onClick={handleSubmit}>Programar</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
