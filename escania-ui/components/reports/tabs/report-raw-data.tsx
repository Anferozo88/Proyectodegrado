import { RawDataCard } from "@/components/reports/raw-data-card"

interface ReportRawDataProps {
  data: any
}

export function ReportRawData({ data }: ReportRawDataProps) {
  return <RawDataCard data={data} />
}

