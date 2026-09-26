import {
  mockAtRiskTasks,
  mockLeaderboardUsers,
  mockProgressTrend,
  mockProjectProgress,
  mockRolePerformance,
  mockUserPerformance,
  mockUserTaskBreakdown,
  mockWorkloadHeatmap,
} from "@/components/Dashboard/mockData"
import { apiClient } from "@/lib/api"
import { API_V1 } from "@/lib/config"
import type {
  AtRiskTaskReportResponse,
  IQueryAtRiskReport,
  IQueryLeaderboardReport,
  IQueryOverdueReport,
  IQueryProgressReport,
  IQueryProgressTrendReport,
  IQueryRolePerformanceReport,
  IQueryUserPerformanceReport,
  IQueryUserTaskBreakdown,
  IQueryUserWorkloadHeatmap,
  ItemResponse,
  LeaderboardUserResponse,
  ListResponse,
  OverdueTaskReportResponse,
  ProgressTrendReportResponse,
  ProjectProgressReportResponse,
  RolePerformanceReportResponse,
  TaskBreakdownNode,
  UserPerformanceReportResponse,
  UserWorkloadHeatmapItem,
} from "@/types"

const url = (path: string) => `${API_V1}/reports${path}`

/**
 * Cấu hình chế độ dữ liệu cho Reports Dashboard.
 * Mặc định: useMock = true (vì hệ thống backend/database dev hiện tại chưa có nhiều dữ liệu phát sinh).
 * Chuyển sang useMock = false khi cần lấy trực tiếp từ live Backend APIs.
 */
export const ReportsConfig = {
  useMock: true,
}

export const ReportsAPI = {
  /** GET /api/reports/progress — Báo cáo tổng hợp tiến độ hoàn thành theo phân khu & dự án */
  getProgress: async (params: IQueryProgressReport) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<
          ItemResponse<ProjectProgressReportResponse>
        >(url("/progress"), { params })
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      result: mockProjectProgress,
    }
  },

  /** GET /api/reports/progress-trend — Chuỗi dữ liệu tiến độ theo thời gian (Trend Line) */
  getProgressTrend: async (params: IQueryProgressTrendReport) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<
          ItemResponse<ProgressTrendReportResponse>
        >(url("/progress-trend"), { params })
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      result: mockProgressTrend,
    }
  },

  /** GET /api/reports/by-role — Báo cáo thống kê hiệu suất theo từng vị trí chức danh */
  getByRole: async (params: IQueryRolePerformanceReport = {}) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<
          ListResponse<RolePerformanceReportResponse>
        >(url("/by-role"), { params })
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: mockRolePerformance.length,
        totalElements: mockRolePerformance.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      result: mockRolePerformance,
    }
  },

  /** GET /api/reports/overdue — Danh sách các công việc trễ hạn SLA theo 3 mức Escalate */
  getOverdue: async (params: IQueryOverdueReport = {}) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<
          ListResponse<OverdueTaskReportResponse>
        >(url("/overdue"), { params })
        if (res?.result) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      result: [],
    }
  },

  /** GET /api/reports/at-risk — Danh sách công việc có nguy cơ trễ hạn (Alert Table) */
  getAtRisk: async (params: IQueryAtRiskReport) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<ListResponse<AtRiskTaskReportResponse>>(
          url("/at-risk"),
          { params },
        )
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: mockAtRiskTasks.length,
        totalElements: mockAtRiskTasks.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      result: mockAtRiskTasks,
    }
  },

  /** GET /api/reports/leaderboard — Bảng xếp hạng và vinh danh nhân sự */
  getLeaderboard: async (params: IQueryLeaderboardReport = {}) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<ListResponse<LeaderboardUserResponse>>(
          url("/leaderboard"),
          { params },
        )
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }

    // Dynamic sorting on mock data based on sortBy param
    let users = [...mockLeaderboardUsers]
    if (params.sortBy === "SPEED") {
      users.sort((a, b) => b.totalEarlyHours - a.totalEarlyHours)
    } else if (params.sortBy === "TOTAL_TASKS") {
      users.sort((a, b) => b.totalTasks - a.totalTasks)
    } else {
      users.sort(
        (a, b) =>
          b.onTimeRate - a.onTimeRate || a.overdueTasks - b.overdueTasks,
      )
    }

    if (params.limit) {
      users = users.slice(0, params.limit)
    }

    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: users.length,
        totalElements: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      result: users,
    }
  },

  /** GET /api/reports/user-history — Báo cáo lịch sử thực hiện & chấm điểm hiệu suất của một nhân sự */
  getUserHistory: async (params: IQueryUserPerformanceReport) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<
          ItemResponse<UserPerformanceReportResponse>
        >(url("/user-history"), { params })
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }

    const matchedUser = mockLeaderboardUsers.find(
      (u) => u.userId === params.userId,
    )
    return {
      code: 200,
      message: "Success",
      result: {
        ...mockUserPerformance,
        userId: params.userId,
        userName: matchedUser?.userName || mockUserPerformance.userName,
        roleName: matchedUser?.roleName || mockUserPerformance.roleName,
        departmentName:
          matchedUser?.departmentName || mockUserPerformance.departmentName,
      },
    }
  },

  /** GET /api/reports/user-workload-heatmap — Ma trận phân bổ khối lượng công việc hàng ngày trong tháng */
  getUserWorkloadHeatmap: async (params: IQueryUserWorkloadHeatmap) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<ListResponse<UserWorkloadHeatmapItem>>(
          url("/user-workload-heatmap"),
          { params },
        )
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: mockWorkloadHeatmap.length,
        totalElements: mockWorkloadHeatmap.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      result: mockWorkloadHeatmap,
    }
  },

  /** GET /api/reports/user-task-breakdown — Bảng chi tiết đối chiếu KPI theo cây nghiệp vụ */
  getUserTaskBreakdown: async (params: IQueryUserTaskBreakdown) => {
    if (!ReportsConfig.useMock) {
      try {
        const res = await apiClient.get<ListResponse<TaskBreakdownNode>>(
          url("/user-task-breakdown"),
          { params },
        )
        if (res) return res
      } catch {
        // Fallback to mock data
      }
    }
    return {
      code: 200,
      message: "Success",
      meta: {
        page: 0,
        size: mockUserTaskBreakdown.length,
        totalElements: mockUserTaskBreakdown.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      result: mockUserTaskBreakdown,
    }
  },
}
