"use client"

import { Card, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Eye } from "lucide-react"
import {
  type MatrixRowItem,
  MOCK_MONTHS_LABEL,
} from "@/mocks/headcountReportMock"

interface HeadcountReportMatrixTableProps {
  matrixRows: MatrixRowItem[]
  loading?: boolean
  onSelectRow: (row: MatrixRowItem) => void
}

const PLANNING_METHOD_CONFIG: Record<string, { label: string; color: string }> =
  {
    BY_PROJECT: { label: "Dự án", color: "blue" },
    BY_REGION: { label: "Vùng", color: "purple" },
    BY_SECTOR: { label: "Khu vực", color: "cyan" },
  }

const DEPARTMENT_BADGE_CONFIG: Record<string, string> = {
  PCD: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  PCD_HTKT:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300",
  PCD_HT:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
  PMD: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  DMD: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300",
  PLP: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  GMD: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
  BTGD: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
}

export const HeadcountReportMatrixTable = ({
  matrixRows,
  loading = false,
  onSelectRow,
}: HeadcountReportMatrixTableProps) => {
  const columns: ColumnsType<MatrixRowItem> = [
    {
      title: "Vùng",
      dataIndex: "regionName",
      key: "regionName",
      fixed: "left",
      width: 130,
      onCell: (record) => ({
        colSpan: record.isSubTotal ? 4 : 1,
      }),
      render: (regionName: string, record: MatrixRowItem) => {
        if (record.isSubTotal) {
          return (
            <div className="text-center font-bold text-xs tracking-wider text-foreground">
              SubTotal ({record.roleName})
            </div>
          )
        }
        return (
          <Tag
            color="purple"
            className="text-xs font-semibold px-2 py-0.5 whitespace-nowrap"
          >
            {regionName || "Vùng Đồng Nai 1"}
          </Tag>
        )
      },
    },

    {
      title: "Tên Dự án",
      dataIndex: "projectName",
      key: "projectName",
      fixed: "left",
      width: 140,
      onCell: (record) => ({
        colSpan: record.isSubTotal ? 0 : 1,
      }),
      render: (name: string, record: MatrixRowItem) => {
        if (record.isSubTotal) return null
        return <span className="text-xs text-foreground">{name}</span>
      },
    },
    {
      title: "Chức danh Định biên",
      dataIndex: "roleName",
      key: "roleName",
      fixed: "left",
      width: 210,
      onCell: (record) => ({
        colSpan: record.isSubTotal ? 0 : 1,
      }),
      render: (name: string, record: MatrixRowItem) => {
        if (record.isSubTotal) return null
        return (
          <div
            className="cursor-pointer group flex items-center justify-between"
            onClick={() => onSelectRow(record)}
          >
            <div>
              <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                {name}
              </div>
            </div>
            <Eye className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )
      },
    },
    {
      title: "PT ĐB",
      dataIndex: "planningMethod",
      key: "planningMethod",
      fixed: "left",
      width: 85,
      align: "center",
      onCell: (record) => ({
        colSpan: record.isSubTotal ? 0 : 1,
      }),
      render: (method: string, record: MatrixRowItem) => {
        if (record.isSubTotal) return null
        const conf = PLANNING_METHOD_CONFIG[method] || {
          label: method,
          color: "default",
        }
        return (
          <Tag color={conf.color} className="mr-0 text-[10px] font-medium">
            {conf.label}
          </Tag>
        )
      },
    },
    // Các cụm cột theo từng tháng M01 -> M06
    ...MOCK_MONTHS_LABEL.map((monthLabel, mIdx) => ({
      title: (
        <div className="text-center font-bold text-xs py-0.5 text-foreground whitespace-nowrap">
          {monthLabel}
        </div>
      ),
      children: [
        {
          title: (
            <span className="text-[11px] font-semibold text-blue-600 whitespace-nowrap">
              ĐB
            </span>
          ),
          key: `db-${mIdx}`,
          width: 58,
          align: "center" as const,
          render: (_: any, row: MatrixRowItem) => {
            const val = row.months[mIdx]?.standardHeadcount ?? 0
            if (row.isSubTotal) {
              return (
                <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                  {val}
                </span>
              )
            }
            return (
              <span className="font-semibold text-xs text-foreground">
                {val > 0 ? val.toFixed(1) : "-"}
              </span>
            )
          },
        },
        {
          title: (
            <span className="text-[11px] font-semibold text-emerald-600 whitespace-nowrap">
              TT
            </span>
          ),
          key: `tt-${mIdx}`,
          width: 58,
          align: "center" as const,
          render: (_: any, row: MatrixRowItem) => {
            const val = row.months[mIdx]?.actualHeadcount ?? 0
            if (row.isSubTotal) {
              return (
                <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
                  {val.toFixed(1)}
                </span>
              )
            }
            return (
              <span
                className={`text-xs font-bold ${
                  row.planningMethod === "BY_REGION"
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1 py-0.5 rounded"
                    : "text-foreground font-medium"
                }`}
              >
                {val > 0 ? val.toFixed(1) : "-"}
              </span>
            )
          },
        },
        {
          title: (
            <span className="text-[11px] font-semibold text-amber-600 whitespace-nowrap">
              Thừa
            </span>
          ),
          key: `thua-${mIdx}`,
          width: 68,
          align: "center" as const,
          render: (_: any, row: MatrixRowItem) => {
            const val = row.months[mIdx]?.surplus ?? 0
            if (row.isSubTotal) {
              if (val > 0) {
                return (
                  <span className="inline-block px-1.5 py-0.2 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                    +{val.toFixed(1)}
                  </span>
                )
              }
              return (
                <span className="text-xs font-bold text-muted-foreground">
                  0
                </span>
              )
            }

            if (val > 0) {
              return (
                <span className="inline-block px-1.5 py-0.2 rounded text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                  +{val.toFixed(1)}
                </span>
              )
            }
            return <span className="text-xs text-muted-foreground/50">0</span>
          },
        },
        {
          title: (
            <span className="text-[11px] font-semibold text-rose-600 whitespace-nowrap">
              Thiếu
            </span>
          ),
          key: `thieu-${mIdx}`,
          width: 68,
          align: "center" as const,
          render: (_: any, row: MatrixRowItem) => {
            const val = row.months[mIdx]?.shortage ?? 0
            if (row.isSubTotal) {
              if (val > 0) {
                return (
                  <span className="inline-block px-1.5 py-0.2 rounded text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 whitespace-nowrap">
                    -{val.toFixed(1)}
                  </span>
                )
              }
              return (
                <span className="text-xs font-bold text-muted-foreground">
                  0
                </span>
              )
            }

            if (val > 0) {
              return (
                <span className="inline-block px-1.5 py-0.2 rounded text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                  -{val.toFixed(1)}
                </span>
              )
            }
            return <span className="text-xs text-muted-foreground/50">0</span>
          },
        },
      ],
    })),
  ]

  return (
    <Card
      className="border border-border/70 shadow-xs rounded-xl overflow-hidden bg-card"
      styles={{ body: { padding: 0 } }}
    >
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">
            Bảng kết quả định biên
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
            Định biên
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
            Thực tế
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
            Thuyên chuyển
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
            Tuyển dụng
          </span>
        </div>
      </div>

      <Table<MatrixRowItem>
        columns={columns}
        dataSource={matrixRows}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1850, y: 550 }}
        size="small"
        bordered
        className="headcount-matrix-table"
        rowClassName={(record) =>
          record.isSubTotal
            ? "bg-muted/40 dark:bg-muted/20 font-semibold border-b-2 border-border/80 cursor-default"
            : "hover:bg-muted/30 cursor-pointer transition-colors"
        }
        onRow={(record) => ({
          onClick: () => {
            if (!record.isSubTotal) onSelectRow(record)
          },
        })}
      />
    </Card>
  )
}
