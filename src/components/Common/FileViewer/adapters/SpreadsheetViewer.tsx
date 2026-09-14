import { useQuery } from "@tanstack/react-query"
import { Button, Spin, Tabs } from "antd"
import axios from "axios"
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react"
import { useState } from "react"
import * as XLSX from "xlsx"
import type { FileViewerRenderProps } from "../types"

interface ParsedSheet {
  name: string
  html: string
  rowCount: number
}

export function SpreadsheetViewer({ url }: FileViewerRenderProps) {
  const [activeSheet, setActiveSheet] = useState<string>("")

  const {
    data: sheets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["file-viewer", "spreadsheet", url],
    queryFn: async ({ signal }) => {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        signal,
      })
      const workbook = XLSX.read(response.data, {
        type: "array",
        cellStyles: true,
        cellDates: true,
      })

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error(
          "Tệp bảng tính không có trang tính dữ liệu (Sheet trống).",
        )
      }

      const parsedSheets: ParsedSheet[] = workbook.SheetNames.map(
        (sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
          const rowCount = range.e.r - range.s.r + 1

          const rawHtml = XLSX.utils.sheet_to_html(worksheet, {
            id: `excel-sheet-${sheetName}`,
            editable: false,
            header: "",
            footer: "",
          })

          return {
            name: sheetName,
            html: rawHtml,
            rowCount,
          }
        },
      )

      return parsedSheets
    },
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 bg-card rounded-lg border">
        <Spin size="large" />
        <span className="text-sm font-medium text-muted-foreground">
          Đang kết xuất bảng tính Excel...
        </span>
      </div>
    )
  }

  if (error || sheets.length === 0) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể hiển thị bảng tính trực tiếp. Bạn có thể tải tệp về máy để mở bằng Microsoft Excel."

    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-lg border bg-card p-6 text-center shadow-xs">
        <div className="rounded-full bg-destructive/10 p-3">
          <FileSpreadsheet className="size-8 text-destructive" />
        </div>
        <div className="max-w-md">
          <h4 className="font-semibold text-foreground">
            Không thể đọc trước tệp Excel
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">{errorMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw className="size-3.5" />}
            onClick={() => refetch()}
          >
            Thử lại
          </Button>
          <Button
            type="primary"
            icon={<Download className="size-4" />}
            href={url}
            target="_blank"
            download
          >
            Tải tệp về máy
          </Button>
        </div>
      </div>
    )
  }

  const currentSheet = sheets.find((s) => s.name === activeSheet) || sheets[0]

  return (
    <div className="flex w-full flex-col gap-2">
      {sheets.length > 1 && (
        <Tabs
          activeKey={activeSheet || sheets[0]?.name}
          onChange={setActiveSheet}
          type="card"
          size="small"
          items={sheets.map((sheet) => ({
            key: sheet.name,
            label: (
              <span className="flex items-center gap-1.5 px-1 font-medium">
                <FileSpreadsheet className="size-3.5 text-emerald-600" />
                {sheet.name}
              </span>
            ),
          }))}
        />
      )}

      {/* Spreadsheet Container with Excel-like theme */}
      <div className="relative max-h-[70vh] w-full overflow-auto rounded-lg border border-border bg-white shadow-2xs">
        <style>{`
          .excel-preview-container table {
            border-collapse: collapse;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
            width: 100%;
            background-color: #ffffff;
            color: #1f2937;
          }
          .excel-preview-container th,
          .excel-preview-container td {
            border: 1px solid #e5e7eb;
            padding: 6px 12px;
            min-width: 80px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .excel-preview-container tr:first-child td,
          .excel-preview-container tr:first-child th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
            position: sticky;
            top: 0;
            z-index: 10;
            border-bottom: 2px solid #d1d5db;
          }
          .excel-preview-container tr:hover td {
            background-color: #f9fafb;
          }
        `}</style>
        <div
          className="excel-preview-container p-2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Sheet HTML is generated from parsed binary arraybuffer via xlsx library
          dangerouslySetInnerHTML={{ __html: currentSheet.html }}
        />
      </div>
    </div>
  )
}
