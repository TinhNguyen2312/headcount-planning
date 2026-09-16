"use client"

import { Avatar, Descriptions, Drawer, Empty, Table, Tabs, Tag } from "antd"
import { Calendar, Layers, Users } from "lucide-react"
import type { MatrixRowItem } from "@/mocks/headcountReportMock"

interface HeadcountReportDetailDrawerProps {
  open: boolean
  row: MatrixRowItem | null
  onClose: () => void
}

export const HeadcountReportDetailDrawer = ({
  open,
  row,
  onClose,
}: HeadcountReportDetailDrawerProps) => {
  if (!row) return null

  const tabItems = [
    {
      key: "actual-staff",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="size-4" />
          Nhân sự Thực tế ({row.actualStaffList.length})
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 pt-2">
          <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60">
            💡 <strong>Nguyên tắc phân bổ (BRD Mục 4.2.b):</strong> Khi nhân sự
            được phân bổ vào <strong>N</strong> dự án hợp lệ theo phương thức
            định biên (Vùng hoặc Khu vực), hệ thống tự động ghi nhận tỷ lệ{" "}
            <strong>1/N</strong> headcount thực tế của nhân sự đó tại mỗi dự án.
          </div>

          {row.actualStaffList.length === 0 ? (
            <Empty description="Chưa có nhân sự nào được gán vị trí này tại dự án" />
          ) : (
            <div className="flex flex-col gap-2.5">
              {row.actualStaffList.map((staff) => (
                <div
                  key={staff.userId}
                  className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-primary text-primary-foreground font-bold">
                        {staff.fullName.charAt(0)}
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {staff.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Mã NV: {staff.perNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Tag
                        color="green"
                        className="text-xs font-bold px-2 py-0.5"
                      >
                        Tỷ lệ: {(staff.headcountRatio * 100).toFixed(0)}% (
                        {staff.headcountRatio})
                      </Tag>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Các dự án cùng phụ trách:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {staff.assignedProjects.map((p) => (
                        <Tag
                          key={p.code}
                          color={
                            p.code === row.projectCode ? "blue" : "default"
                          }
                          className="text-[11px]"
                        >
                          {p.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "standard-basis",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Layers className="size-4" />
          Căn cứ Định biên Chuẩn
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 pt-2">
          <div className="text-xs text-muted-foreground bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
            📌 Căn cứ tính toán tự động dựa trên Kế hoạch phiên bản{" "}
            <strong>ACTIVE</strong> và Khung định biên chuẩn kết hợp Hệ số tối
            ưu tháng.
          </div>

          <Descriptions
            bordered
            size="small"
            column={1}
            className="bg-card rounded-lg overflow-hidden"
          >
            <Descriptions.Item label="Giai đoạn Kế hoạch (Phase)">
              <span className="font-medium text-foreground">
                {row.standardBasis.phaseName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mốc tiến độ chuẩn">
              <Tag color="cyan">{row.standardBasis.milestoneName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Dung sai tuyển dụng (Lead Time)">
              <span>
                {row.standardBasis.leadTimeMonths} tháng (Kế thừa từ danh mục
                Chức danh)
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Cơ sở & Quy mô dự án">
              <span className="font-mono text-xs">
                {row.standardBasis.projectScale}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Định biên chuẩn cơ sở">
              <span className="font-bold text-blue-600">
                {row.standardBasis.baseHeadcount} nhân sự
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Hệ số tối ưu bình quân">
              <span className="font-bold text-foreground">
                {row.standardBasis.monthlyFactor}x
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "monthly-timeline",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="size-4" />
          Tiến độ 6 Tháng
        </span>
      ),
      children: (
        <div className="pt-2">
          <Table
            dataSource={row.months}
            rowKey="monthIndex"
            pagination={false}
            size="small"
            bordered
            columns={[
              {
                title: "Tháng",
                dataIndex: "monthLabel",
                key: "monthLabel",
                align: "center",
                render: (val) => (
                  <span className="font-bold text-xs">{val}</span>
                ),
              },
              {
                title: "Định biên (ĐB)",
                dataIndex: "standardHeadcount",
                key: "standardHeadcount",
                align: "center",
                render: (v) => (
                  <span className="font-semibold text-blue-600">
                    {v.toFixed(1)}
                  </span>
                ),
              },
              {
                title: "Thực tế (TT)",
                dataIndex: "actualHeadcount",
                key: "actualHeadcount",
                align: "center",
                render: (v) => (
                  <span className="font-semibold text-emerald-600">
                    {v.toFixed(1)}
                  </span>
                ),
              },
              {
                title: "Thừa",
                dataIndex: "surplus",
                key: "surplus",
                align: "center",
                render: (v) =>
                  v > 0 ? (
                    <Tag color="warning" className="font-bold">
                      +{v.toFixed(1)}
                    </Tag>
                  ) : (
                    <span className="text-muted-foreground/50">0</span>
                  ),
              },
              {
                title: "Thiếu",
                dataIndex: "shortage",
                key: "shortage",
                align: "center",
                width: 80,
                render: (v) =>
                  v > 0 ? (
                    <Tag color="error" className="font-bold">
                      -{v.toFixed(1)}
                    </Tag>
                  ) : (
                    <span className="text-muted-foreground/50">0</span>
                  ),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div>
            <div className="text-base font-bold text-foreground">
              {row.roleName}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Mã: {row.roleCode} • Dự án: {row.projectName}
            </div>
          </div>
          <Tag color="blue" className="text-xs">
            {row.departmentName}
          </Tag>
        </div>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
      styles={{ body: { padding: "16px 20px" } }}
    >
      <Tabs defaultActiveKey="actual-staff" items={tabItems} />
    </Drawer>
  )
}
