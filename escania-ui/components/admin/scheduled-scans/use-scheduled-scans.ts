"use client";

import { db } from "@/app/firebase";
import { useToast } from "@/components/ui/use-toast";
import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface Command {
	id: string;
	name: string;
	command: string;
}

export interface ScheduledScan {
	id: string;
	name: string;
	target: string;
	commandId: string;
	commandName: string;
	frequency:
		| "hourly"
		| "daily"
		| "5/minutes"
		| "10/minutes"
		| "15/minutes"
		| "30/minutes";
	createdAt: any;
	scanId?: string; // Añadir scanId como propiedad opcional
	status: string;
	nextRun?: Timestamp;
}

export interface NewScan {
	name: string;
	target: string;
	commandId: string;
	frequency: string;
}

export function useScheduledScans() {
	const { toast } = useToast();

	const [scans, setScans] = useState<ScheduledScan[]>([]);
	const [commands, setCommands] = useState<Command[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);

			// Fetch commands
			const commandsRef = collection(db, "nmap_commands");
			const commandsQuery = query(commandsRef, orderBy("name"));
			const commandsSnapshot = await getDocs(commandsQuery);

			const commandsList: Command[] = [];
			commandsSnapshot.forEach((doc) => {
				commandsList.push({
					id: doc.id,
					name: doc.data().name,
					command: doc.data().command,
				});
			});

			setCommands(commandsList);

			// Fetch scheduled scans
			const scansRef = collection(db, "scheduled_scans");
			const scansQuery = query(scansRef, orderBy("createdAt", "desc"));
			const scansSnapshot = await getDocs(scansQuery);

			const scansList: ScheduledScan[] = [];
			scansSnapshot.forEach((doc) => {
				const scanData = doc.data();
				const command = commandsList.find(
					(cmd) => cmd.id === scanData.commandId,
				) || { name: "Comando eliminado" };

				scansList.push({
					id: doc.id,
					name: scanData.name,
					target: scanData.target,
					commandId: scanData.commandId,
					commandName: command.name,
					frequency: scanData.frequency,
					createdAt: scanData.createdAt,
					scanId: scanData.scanId, // Extraer scanId del documento
					status: scanData.status,
					nextRun: scanData.next_run,
				});
			});

			setScans(scansList);
			setError(null);
		} catch (error) {
			console.error("Error fetching data:", error);
			setError("Error al cargar los datos");
		} finally {
			setLoading(false);
		}
	};

	const convertFrequency = (frequency: string) => {
		switch (frequency) {
			case "hourly":
				return { minute: "0", hour: "*" };
			case "daily":
				return { minute: "0", hour: "0" };
			case "5/minutes":
				return { minute: "*/5", hour: "*" };
			case "10/minutes":
				return { minute: "*/10", hour: "*" };
			case "15/minutes":
				return { minute: "*/15", hour: "*" };
			case "30/minutes":
				return { minute: "*/30", hour: "*" };
			default:
				return { minute: "0", hour: "0" };
		}
	};

	const addScan = async (newScan: NewScan) => {
		try {
			if (!newScan.name || !newScan.target || !newScan.commandId) {
				toast({
					variant: "destructive",
					title: "Campos requeridos",
					description: "Todos los campos son requeridos",
				});
				return false;
			}

			const command = commands.find((cmd) => cmd.id === newScan.commandId);
			if (!command) {
				toast({
					variant: "destructive",
					title: "Comando no encontrado",
					description: "El comando seleccionado no existe",
				});
				return false;
			}

			// 2. Guardar el escaneo en Firestore
			const docRef = await addDoc(collection(db, "scheduled_scans"), {
				...newScan,
				createdAt: serverTimestamp(),
			});

			// 1. Guardar el escaneo en las tareas programadas de la API
			const body = convertFrequency(newScan.frequency);
			const url = new URLSearchParams();
			url.append("target", newScan.target);
			url.append("command", command.command);
			url.append("id_firestore", docRef.id);
			const response = await fetch(`/api/proxy?${url.toString()}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				toast({
					variant: "destructive",
					title: "Error en la API",
					description: "No se ha podido programar el escaneo",
				});
				await deleteDoc(doc(db, "scheduled_scans", docRef.id));
				return false;
			}

			const nextRun = (await response.json()).next_run;

			const newScheduledScan: ScheduledScan = {
				id: docRef.id,
				name: newScan.name,
				target: newScan.target,
				commandId: newScan.commandId,
				commandName: command.name,
				frequency: newScan.frequency as
					| "hourly"
					| "daily"
					| "5/minutes"
					| "10/minutes"
					| "15/minutes"
					| "30/minutes",
				createdAt: new Date(),
				status: "scheduled",
				nextRun: Timestamp.fromDate(new Date(nextRun)),
			};

			setScans([newScheduledScan, ...scans]);

			toast({
				title: "Escaneo programado",
				description: "El escaneo se ha programado correctamente",
			});

			return true;
		} catch (error) {
			console.error("Error adding scheduled scan:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Error al programar el escaneo",
			});
			return false;
		}
	};

	const deleteScan = async (scanId: string) => {
		try {
			await deleteDoc(doc(db, "scheduled_scans", scanId));
			setScans(scans.filter((scan) => scan.id !== scanId));

			const url = new URLSearchParams();
			url.append("id", scanId);
			const response = await fetch(`/api/proxy?${url.toString()}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				toast({
					variant: "destructive",
					title: "Error en la API",
					description: "No se ha podido cancelar el escaneo programado",
				});
				return false;
			}

			toast({
				title: "Escaneo eliminado",
				description: "El escaneo programado se ha eliminado correctamente",
			});

			return true;
		} catch (error) {
			console.error("Error deleting scheduled scan:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Error al eliminar el escaneo programado",
			});
			return false;
		}
	};

	const runImmediateScan = async (scanId: string) => {
		try {
			const url = new URLSearchParams();
			url.append("id_firestore", scanId);
			const response = await fetch(`/api/scan?${url.toString()}`);

			if (!response.ok) {
				toast({
					variant: "destructive",
					title: "Error en la API",
					description: "No se ha podido ejecutar el escaneo inmediato",
				});
				return false;
			}

			toast({
				title: "Escaneo inmediato ejecutado",
				description: "El escaneo inmediato se ha ejecutado correctamente",
			});

			return true;
		} catch (error) {
			console.error("Error running immediate scan:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Error al ejecutar el escaneo inmediato",
			});
			return false;
		}
	};

	return {
		scans,
		commands,
		loading,
		error,
		addScan,
		deleteScan,
		runImmediateScan,
		refreshData: fetchData,
	};
}
