"use client";

import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { AddScanDialog } from "./scheduled-scans/add-scan-dialog";
import { ScansTable } from "./scheduled-scans/scans-table";
import { useScheduledScans } from "./scheduled-scans/use-scheduled-scans";

export default function ScheduledScansList() {
	const {
		scans,
		commands,
		loading,
		error,
		addScan,
		deleteScan,
		runImmediateScan,
		refreshData,
	} = useScheduledScans();
	const [searchTerm, setSearchTerm] = useState("");

	const filteredScans = scans.filter(
		(scan) =>
			scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
			scan.commandName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-md bg-destructive/10 p-4 text-destructive">
				<div className="flex items-center gap-2">
					<AlertCircle className="h-5 w-5" />
					<p className="font-medium">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Buscar escaneos programados..."
						className="w-[300px] pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<AddScanDialog
					commands={commands}
					onAddScan={addScan}
					refreshData={refreshData}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Objetivo</TableHead>
							<TableHead>Comando</TableHead>
							<TableHead>Frecuencia</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Próximo ejecución</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<ScansTable
							scans={filteredScans}
							onDeleteScan={deleteScan}
							onRunImmediateScan={runImmediateScan}
							refreshData={refreshData}
						/>
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
