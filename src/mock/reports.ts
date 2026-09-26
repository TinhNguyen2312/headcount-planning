import type {
  OverdueTaskReportResponse,
  ProjectProgressReportResponse,
  RolePerformanceReportResponse,
} from "@/types"

export const MOCK_PROGRESS_REPORT: ProjectProgressReportResponse = {
  projectId: 1,
  projectName: "NovaWorld Phan Thiết",
  totalTasks: 48,
  completedTasks: 39,
  completionRate: 81.25,
  zonesProgress: [
    {
      zoneId: 1,
      zoneName: "Phân khu 1 - Florida",
      totalTasks: 24,
      completedTasks: 21,
      completionRate: 87.5,
    },
    {
      zoneId: 2,
      zoneName: "Phân khu 2 - Santa Monica",
      totalTasks: 16,
      completedTasks: 12,
      completionRate: 75.0,
    },
    {
      zoneId: 3,
      zoneName: "Phân khu 3 - PGA Golf Villas",
      totalTasks: 8,
      completedTasks: 6,
      completionRate: 75.0,
    },
  ],
}

export const MOCK_OVERDUE_REPORT: OverdueTaskReportResponse[] = [
  {
    taskInstanceId: 98,
    taskTitle: "Kiểm tra độ thẳng đứng cốp pha trục D-E phân khu Florida",
    projectName: "NovaWorld Phan Thiết",
    zoneName: "Phân khu 1 - Florida",
    executorName: "Nguyễn Văn Hùng",
    managerName: "Phạm Tiến Dũng",
    escalateLevel: "MEDIUM",
    slaDeadline: "2026-03-24T16:00:00Z",
    overdueHours: 18.5,
  },
  {
    taskInstanceId: 97,
    taskTitle: "Thử nghiệm áp lực tuyến ống cấp nước trục chính",
    projectName: "NovaWorld Phan Thiết",
    zoneName: "Phân khu 2 - Santa Monica",
    executorName: "Trần Đăng Khoa",
    managerName: "Hoàng Văn Em",
    escalateLevel: "LOW",
    slaDeadline: "2026-03-25T09:00:00Z",
    overdueHours: 2.5,
  },
]

export const MOCK_ROLE_PERFORMANCE: RolePerformanceReportResponse[] = [
  {
    roleId: 8,
    roleName: "Kỹ sư cao cấp Giám sát Xây dựng",
    totalTasks: 22,
    completedTasks: 19,
    lateTasks: 2,
    overdueTasks: 1,
    reworkTasks: 2,
    completionRate: 86.36,
    bottleneck: false,
  },
  {
    roleId: 9,
    roleName: "Kỹ sư cao cấp Giám sát Cơ điện",
    totalTasks: 14,
    completedTasks: 11,
    lateTasks: 1,
    overdueTasks: 1,
    reworkTasks: 0,
    completionRate: 78.57,
    bottleneck: false,
  },
  {
    roleId: 11,
    roleName: "Kỹ sư cao cấp Kiểm soát An toàn lao động",
    totalTasks: 12,
    completedTasks: 11,
    lateTasks: 0,
    overdueTasks: 0,
    reworkTasks: 1,
    completionRate: 91.67,
    bottleneck: false,
  },
]
