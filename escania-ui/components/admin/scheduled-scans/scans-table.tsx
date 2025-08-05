"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { BarChart4, Clock, Loader2, Network, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteScanDialog } from "./delete-scan-dialog";
import type { ScheduledScan } from "./use-scheduled-scans";

interface ScansTableProps {
	scans: ScheduledScan[];
	onDeleteScan: (scanId: string) => Promise<boolean>;
	onRunImmediateScan: (scanId: string) => Promise<boolean>;
	refreshData: () => void;
}

export function ScansTable({
	scans,
	onDeleteScan,
	onRunImmediateScan,
	refreshData,
}: ScansTableProps) {
	const router = useRouter();

	const navigateToDashboard = (scan: ScheduledScan) => {
		const idToUse = scan.scanId || scan.id;
		router.push(`/dashboard?scanId=${idToUse}`);
	};

	const getFrequencyBadge = (frequency: string) => {
		switch (frequency) {
			case "hourly":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-500">
						Cada hora
					</Badge>
				);
			case "daily":
				return (
					<Badge variant="outline" className="border-green-500 text-green-500">
						Diario
					</Badge>
				);
			case "5/minutes":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-500">
						Cada 5 minutos
					</Badge>
				);
			case "10/minutes":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-500">
						Cada 10 minutos
					</Badge>
				);
			case "15/minutes":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-500">
						Cada 15 minutos
					</Badge>
				);
			case "30/minutes":
				return (
					<Badge variant="outline" className="border-blue-500 text-blue-500">
						Cada 30 minutos
					</Badge>
				);
			default:
				return <Badge variant="outline">Desconocido</Badge>;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "scheduled":
				return (
					<Badge variant="outline" className="border-green-500 text-green-500">
						Programado
					</Badge>
				);
			case "canceled":
				return (
					<Badge variant="outline" className="border-red-500 text-red-500">
						Cancelado
					</Badge>
				);
			case "completed":
				return (
					<Badge variant="outline" className="border-green-500 text-green-500">
						Completado
					</Badge>
				);
			case "running":
				return (
					<Badge
						variant="outline"
						className="border-yellow-500 text-yellow-500"
					>
						Ejecutando
					</Badge>
				);
			case "failed":
				return (
					<Badge variant="outline" className="border-red-500 text-red-500">
						Fallido
					</Badge>
				);
			default:
				return <Badge variant="outline">Desconocido</Badge>;
		}
	};

	if (scans.length === 0) {
		return (
			<TableRow>
				<TableCell colSpan={5} className="h-24 text-center">
					No se encontraron escaneos programados
				</TableCell>
			</TableRow>
		);
	}

	return (
		<>
			{scans.map((scan) => (
				<TableRow key={scan.id}>
					<TableCell className="font-medium">{scan.name}</TableCell>
					<TableCell>
						<div className="flex items-center gap-2">
							<Network className="h-4 w-4 text-muted-foreground" />
							{scan.target}
						</div>
					</TableCell>
					<TableCell>{scan.commandName}</TableCell>
					<TableCell>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							{getFrequencyBadge(scan.frequency)}
						</div>
					</TableCell>
					<TableCell>{getStatusBadge(scan.status)}</TableCell>
					<TableCell>{scan.nextRun?.toDate().toLocaleString()}</TableCell>
					<TableCell className="text-right">
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigateToDashboard(scan)}
								className="text-primary"
							>
								<BarChart4 className=" h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={async () => {
									const success = await onRunImmediateScan(scan.id);
									if (!success) return;
									refreshData();
								}}
								className="text-primary"
							>
								{scan.status === "running" ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Play className=" h-4 w-4" />
								)}
							</Button>
							<DeleteScanDialog scan={scan} onDeleteScan={onDeleteScan} />
						</div>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}
