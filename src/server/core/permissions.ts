/**
 * Danh mục định nghĩa Resource (Tài nguyên / Bảng dữ liệu) trong hệ thống
 */
export const RESOURCES = {
  // 1. Quản trị hệ thống & Nhân sự
  USER: "user",
  ACCESS_ROLE: "access_role",
  ROLE: "role", // Chức danh / Vị trí công việc

  // 2. Cơ cấu tổ chức & Địa lý
  DEPARTMENT: "department",
  SECTOR: "sector",
  REGION: "region",

  // 3. Dự án & Phân bổ
  PROJECT: "project",
  PROPERTY: "property",
  USER_PROJECT: "user_project",

  // 4. Kế hoạch & Định biên
  PLAN: "plan",
  HEADCOUNT_PROJECT: "headcount_project",
  HEADCOUNT_STANDARD: "headcount_standard",
  HEADCOUNT_CRITERIA: "headcount_criteria",
  HEADCOUNT_FACTOR: "headcount_factor",

  // 5. Tiến độ & Giai đoạn
  PHASE: "phase",
  MILESTONE: "milestone",

  // 6. Báo cáo & Kiểm toán
  REPORT: "report",
  AUDIT: "audit",

  // 7. Legacy alias
  CATALOG: "catalog",
} as const

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES]

/**
 * Danh mục định nghĩa Action (Thao tác / Hành động) trong hệ thống
 */
export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  APPROVE: "approve",
  REJECT: "reject",
  SUBMIT: "submit",
  ARCHIVE: "archive",
  ASSIGN: "assign",
  EXPORT: "export",
  IMPORT: "import",
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

/**
 * Danh mục chuẩn hoá Permissions (Resource + Action) theo từng bảng
 */
export const PERMISSIONS = {
  // ==========================================
  // 1. NGƯỜI DÙNG (users) - GLOBAL
  // ==========================================
  USER_VIEW: "user.view",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_MANAGE: "user.manage",
  USER_RESET_PASSWORD: "user.reset_password",
  USER_BLOCK: "user.block",
  USER_IMPORT: "user.import",
  USER_EXPORT: "user.export",

  // ==========================================
  // 2. PHÂN QUYỀN TRUY CẬP (access_roles, access_role_permissions) - GLOBAL
  // ==========================================
  ACCESS_ROLE_VIEW: "access_role.view",
  ACCESS_ROLE_CREATE: "access_role.create",
  ACCESS_ROLE_UPDATE: "access_role.update",
  ACCESS_ROLE_DELETE: "access_role.delete",
  ACCESS_ROLE_ASSIGN: "access_role.assign",
  ACCESS_ROLE_MANAGE: "access_role.manage",

  // ==========================================
  // 3. CHỨC DANH CÔNG VIỆC (roles) - GLOBAL
  // ==========================================
  ROLE_VIEW: "role.view",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_MANAGE: "role.manage",

  // ==========================================
  // 4. PHÒNG BAN (departments) - GLOBAL
  // ==========================================
  DEPARTMENT_VIEW: "department.view",
  DEPARTMENT_CREATE: "department.create",
  DEPARTMENT_UPDATE: "department.update",
  DEPARTMENT_DELETE: "department.delete",
  DEPARTMENT_MANAGE: "department.manage",

  // ==========================================
  // 5. KHU VỰC (sectors) - GLOBAL
  // ==========================================
  SECTOR_VIEW: "sector.view",
  SECTOR_CREATE: "sector.create",
  SECTOR_UPDATE: "sector.update",
  SECTOR_DELETE: "sector.delete",
  SECTOR_MANAGE: "sector.manage",

  // ==========================================
  // 6. VÙNG DỰ ÁN (regions) - GLOBAL
  // ==========================================
  REGION_VIEW: "region.view",
  REGION_CREATE: "region.create",
  REGION_UPDATE: "region.update",
  REGION_DELETE: "region.delete",
  REGION_MANAGE: "region.manage",

  // ==========================================
  // 7. THUỘC TÍNH DỰ ÁN (properties, property_departments) - GLOBAL
  // ==========================================
  PROPERTY_VIEW: "property.view",
  PROPERTY_CREATE: "property.create",
  PROPERTY_UPDATE: "property.update",
  PROPERTY_DELETE: "property.delete",
  PROPERTY_MANAGE: "property.manage",

  // ==========================================
  // 8. DỰ ÁN (projects) - GLOBAL (Tạo/Quản trị chung) & PROJECT (Xem/Sửa/Xóa cụ thể)
  // ==========================================
  PROJECT_VIEW: "project.view",
  PROJECT_CREATE: "project.create",
  PROJECT_UPDATE: "project.update",
  PROJECT_DELETE: "project.delete",
  PROJECT_MANAGE: "project.manage",

  // ==========================================
  // 9. PHÂN BỔ NHÂN SỰ VÀO DỰ ÁN (user_projects) - PROJECT
  // ==========================================
  USER_PROJECT_VIEW: "user_project.view",
  USER_PROJECT_ASSIGN: "user_project.assign",
  USER_PROJECT_UPDATE: "user_project.update",
  USER_PROJECT_DELETE: "user_project.delete",
  USER_PROJECT_MANAGE: "user_project.manage",
  PROJECT_ASSIGNMENT_MANAGE: "user_project.manage", // Backward-compatible alias

  // ==========================================
  // 10. KẾ HOẠCH ĐỊNH BIÊN (plans) - PROJECT
  // ==========================================
  PLAN_VIEW: "plan.view",
  PLAN_CREATE: "plan.create",
  PLAN_UPDATE: "plan.update",
  PLAN_DELETE: "plan.delete",
  PLAN_SUBMIT: "plan.submit",
  PLAN_APPROVE: "plan.approve",
  PLAN_REJECT: "plan.reject",
  PLAN_ARCHIVE: "plan.archive",
  PLAN_MANAGE: "plan.manage",

  // ==========================================
  // 11. DỰ ÁN ĐỊNH BIÊN TRONG KẾ HOẠCH (headcount_projects) - PROJECT
  // ==========================================
  HEADCOUNT_PROJECT_VIEW: "headcount_project.view",
  HEADCOUNT_PROJECT_CREATE: "headcount_project.create",
  HEADCOUNT_PROJECT_UPDATE: "headcount_project.update",
  HEADCOUNT_PROJECT_DELETE: "headcount_project.delete",
  HEADCOUNT_PROJECT_MANAGE: "headcount_project.manage",

  // ==========================================
  // 12. TIÊU CHUẨN ĐỊNH BIÊN (headcount_standards) - GLOBAL
  // ==========================================
  HEADCOUNT_STANDARD_VIEW: "headcount_standard.view",
  HEADCOUNT_STANDARD_CREATE: "headcount_standard.create",
  HEADCOUNT_STANDARD_UPDATE: "headcount_standard.update",
  HEADCOUNT_STANDARD_DELETE: "headcount_standard.delete",
  HEADCOUNT_STANDARD_MANAGE: "headcount_standard.manage",

  // ==========================================
  // 13. TIÊU CHÍ ĐỊNH BIÊN (headcount_criteria) - GLOBAL
  // ==========================================
  HEADCOUNT_CRITERIA_VIEW: "headcount_criteria.view",
  HEADCOUNT_CRITERIA_CREATE: "headcount_criteria.create",
  HEADCOUNT_CRITERIA_UPDATE: "headcount_criteria.update",
  HEADCOUNT_CRITERIA_DELETE: "headcount_criteria.delete",
  HEADCOUNT_CRITERIA_MANAGE: "headcount_criteria.manage",

  // ==========================================
  // 14. HỆ SỐ PHÂN BỔ THÁNG (headcount_monthly_factors) - GLOBAL
  // ==========================================
  HEADCOUNT_FACTOR_VIEW: "headcount_factor.view",
  HEADCOUNT_FACTOR_UPDATE: "headcount_factor.update",
  HEADCOUNT_FACTOR_MANAGE: "headcount_factor.manage",

  // ==========================================
  // 15. GIAI ĐOẠN DỰ ÁN (phases) - PROJECT
  // ==========================================
  PHASE_VIEW: "phase.view",
  PHASE_CREATE: "phase.create",
  PHASE_UPDATE: "phase.update",
  PHASE_DELETE: "phase.delete",
  PHASE_MANAGE: "phase.manage",

  // ==========================================
  // 16. MỐC TIẾN ĐỘ DỰ ÁN (milestones, milestone_dependencies) - PROJECT
  // ==========================================
  MILESTONE_VIEW: "milestone.view",
  MILESTONE_CREATE: "milestone.create",
  MILESTONE_UPDATE: "milestone.update",
  MILESTONE_DELETE: "milestone.delete",
  MILESTONE_MANAGE: "milestone.manage",

  // ==========================================
  // 17. BÁO CÁO & THỐNG KÊ (report)
  // ==========================================
  REPORT_VIEW: "report.view",
  REPORT_EXPORT: "report.export",

  // ==========================================
  // 18. NHẬT KÝ KIỂM TOÁN (audit) - GLOBAL
  // ==========================================
  AUDIT_VIEW: "audit.view",

  // ==========================================
  // 19. DANH MỤC DÙNG CHUNG (Legacy alias) - GLOBAL
  // ==========================================
  CATALOG_MANAGE: "catalog.manage",
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export function buildPermission(
  resource: Resource | string,
  action: Action | string,
): string {
  return `${resource}.${action}`
}

export interface PermissionDefinition {
  key: PermissionKey | string
  label: string
  groupName: string
  scope: "GLOBAL" | "PROJECT"
  description: string
}

export const ALL_PERMISSIONS_METADATA: PermissionDefinition[] = [
  // 1. Users
  {
    key: PERMISSIONS.USER_VIEW,
    label: "Xem danh sách người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Xem danh sách và chi tiết hồ sơ người dùng",
  },
  {
    key: PERMISSIONS.USER_CREATE,
    label: "Tạo người dùng mới",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Thêm tài khoản người dùng vào hệ thống",
  },
  {
    key: PERMISSIONS.USER_UPDATE,
    label: "Cập nhật người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Sửa thông tin cá nhân, phòng ban, chức danh người dùng",
  },
  {
    key: PERMISSIONS.USER_DELETE,
    label: "Xóa người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Xóa tài khoản người dùng khỏi hệ thống",
  },
  {
    key: PERMISSIONS.USER_MANAGE,
    label: "Toàn quyền người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị nhân sự trong hệ thống",
  },
  {
    key: PERMISSIONS.USER_RESET_PASSWORD,
    label: "Đặt lại mật khẩu",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Reset mật khẩu cho tài khoản người dùng",
  },
  {
    key: PERMISSIONS.USER_BLOCK,
    label: "Khóa/Mở khóa tài khoản",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Khóa hoặc mở khóa quyền đăng nhập",
  },
  {
    key: PERMISSIONS.USER_IMPORT,
    label: "Import người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Nhập danh sách người dùng từ file Excel",
  },
  {
    key: PERMISSIONS.USER_EXPORT,
    label: "Export người dùng",
    groupName: "Người dùng",
    scope: "GLOBAL",
    description: "Xuất dữ liệu người dùng ra file Excel",
  },

  // 2. Access Roles
  {
    key: PERMISSIONS.ACCESS_ROLE_VIEW,
    label: "Xem vai trò phân quyền",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Xem danh sách và chi tiết các vai trò phân quyền",
  },
  {
    key: PERMISSIONS.ACCESS_ROLE_CREATE,
    label: "Tạo vai trò phân quyền",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Tạo nhóm vai trò và cây phân quyền mới",
  },
  {
    key: PERMISSIONS.ACCESS_ROLE_UPDATE,
    label: "Sửa vai trò phân quyền",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Cập nhật cấu hình quyền hạn của vai trò",
  },
  {
    key: PERMISSIONS.ACCESS_ROLE_DELETE,
    label: "Xóa vai trò phân quyền",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Xóa vai trò phân quyền không sử dụng",
  },
  {
    key: PERMISSIONS.ACCESS_ROLE_ASSIGN,
    label: "Gán vai trò người dùng",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Phân bổ vai trò toàn cục cho nhân sự",
  },
  {
    key: PERMISSIONS.ACCESS_ROLE_MANAGE,
    label: "Toàn quyền phân quyền",
    groupName: "Phân quyền",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị cấu trúc phân quyền RBAC",
  },

  // 3. Job Roles
  {
    key: PERMISSIONS.ROLE_VIEW,
    label: "Xem chức danh",
    groupName: "Chức danh",
    scope: "GLOBAL",
    description: "Xem danh mục chức danh công việc",
  },
  {
    key: PERMISSIONS.ROLE_CREATE,
    label: "Tạo chức danh",
    groupName: "Chức danh",
    scope: "GLOBAL",
    description: "Thêm mới chức danh công việc",
  },
  {
    key: PERMISSIONS.ROLE_UPDATE,
    label: "Sửa chức danh",
    groupName: "Chức danh",
    scope: "GLOBAL",
    description: "Cập nhật tên, mã, mô tả chức danh",
  },
  {
    key: PERMISSIONS.ROLE_DELETE,
    label: "Xóa chức danh",
    groupName: "Chức danh",
    scope: "GLOBAL",
    description: "Xóa chức danh không có nhân sự liên kết",
  },
  {
    key: PERMISSIONS.ROLE_MANAGE,
    label: "Toàn quyền chức danh",
    groupName: "Chức danh",
    scope: "GLOBAL",
    description: "Toàn quyền quản lý danh mục chức danh",
  },

  // 4. Departments
  {
    key: PERMISSIONS.DEPARTMENT_VIEW,
    label: "Xem phòng ban",
    groupName: "Phòng ban",
    scope: "GLOBAL",
    description: "Xem sơ đồ cây và danh sách phòng ban",
  },
  {
    key: PERMISSIONS.DEPARTMENT_CREATE,
    label: "Tạo phòng ban",
    groupName: "Phòng ban",
    scope: "GLOBAL",
    description: "Thêm mới phòng ban vào cơ cấu tổ chức",
  },
  {
    key: PERMISSIONS.DEPARTMENT_UPDATE,
    label: "Sửa phòng ban",
    groupName: "Phòng ban",
    scope: "GLOBAL",
    description: "Cập nhật thông tin phòng ban",
  },
  {
    key: PERMISSIONS.DEPARTMENT_DELETE,
    label: "Xóa phòng ban",
    groupName: "Phòng ban",
    scope: "GLOBAL",
    description: "Xóa phòng ban không có đơn vị con/nhân sự",
  },
  {
    key: PERMISSIONS.DEPARTMENT_MANAGE,
    label: "Toàn quyền phòng ban",
    groupName: "Phòng ban",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị sơ đồ tổ chức phòng ban",
  },

  // 5. Sectors
  {
    key: PERMISSIONS.SECTOR_VIEW,
    label: "Xem khu vực",
    groupName: "Khu vực",
    scope: "GLOBAL",
    description: "Xem danh mục khu vực địa lý/kinh doanh",
  },
  {
    key: PERMISSIONS.SECTOR_CREATE,
    label: "Tạo khu vực",
    groupName: "Khu vực",
    scope: "GLOBAL",
    description: "Thêm mới khu vực",
  },
  {
    key: PERMISSIONS.SECTOR_UPDATE,
    label: "Sửa khu vực",
    groupName: "Khu vực",
    scope: "GLOBAL",
    description: "Cập nhật thông tin khu vực",
  },
  {
    key: PERMISSIONS.SECTOR_DELETE,
    label: "Xóa khu vực",
    groupName: "Khu vực",
    scope: "GLOBAL",
    description: "Xóa khu vực không có vùng trực thuộc",
  },
  {
    key: PERMISSIONS.SECTOR_MANAGE,
    label: "Toàn quyền khu vực",
    groupName: "Khu vực",
    scope: "GLOBAL",
    description: "Toàn quyền quản lý danh mục khu vực",
  },

  // 6. Regions
  {
    key: PERMISSIONS.REGION_VIEW,
    label: "Xem vùng dự án",
    groupName: "Vùng dự án",
    scope: "GLOBAL",
    description: "Xem danh mục vùng thuộc khu vực",
  },
  {
    key: PERMISSIONS.REGION_CREATE,
    label: "Tạo vùng dự án",
    groupName: "Vùng dự án",
    scope: "GLOBAL",
    description: "Thêm mới vùng dự án",
  },
  {
    key: PERMISSIONS.REGION_UPDATE,
    label: "Sửa vùng dự án",
    groupName: "Vùng dự án",
    scope: "GLOBAL",
    description: "Cập nhật thông tin vùng dự án",
  },
  {
    key: PERMISSIONS.REGION_DELETE,
    label: "Xóa vùng dự án",
    groupName: "Vùng dự án",
    scope: "GLOBAL",
    description: "Xóa vùng không có dự án trực thuộc",
  },
  {
    key: PERMISSIONS.REGION_MANAGE,
    label: "Toàn quyền vùng dự án",
    groupName: "Vùng dự án",
    scope: "GLOBAL",
    description: "Toàn quyền quản lý danh mục vùng dự án",
  },

  // 7. Properties
  {
    key: PERMISSIONS.PROPERTY_VIEW,
    label: "Xem thuộc tính dự án",
    groupName: "Thuộc tính dự án",
    scope: "GLOBAL",
    description: "Xem danh mục thông số/thuộc tính dự án",
  },
  {
    key: PERMISSIONS.PROPERTY_CREATE,
    label: "Tạo thuộc tính dự án",
    groupName: "Thuộc tính dự án",
    scope: "GLOBAL",
    description: "Định nghĩa thuộc tính và kiểu dữ liệu mới",
  },
  {
    key: PERMISSIONS.PROPERTY_UPDATE,
    label: "Sửa thuộc tính dự án",
    groupName: "Thuộc tính dự án",
    scope: "GLOBAL",
    description: "Cập nhật cấu hình thuộc tính dự án",
  },
  {
    key: PERMISSIONS.PROPERTY_DELETE,
    label: "Xóa thuộc tính dự án",
    groupName: "Thuộc tính dự án",
    scope: "GLOBAL",
    description: "Xóa thuộc tính dự án khỏi danh mục",
  },
  {
    key: PERMISSIONS.PROPERTY_MANAGE,
    label: "Toàn quyền thuộc tính",
    groupName: "Thuộc tính dự án",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị danh mục thuộc tính dự án",
  },

  // 8. Projects
  {
    key: PERMISSIONS.PROJECT_VIEW,
    label: "Xem dự án",
    groupName: "Dự án",
    scope: "PROJECT",
    description: "Xem thông tin chung và chi tiết dự án",
  },
  {
    key: PERMISSIONS.PROJECT_CREATE,
    label: "Tạo dự án",
    groupName: "Dự án",
    scope: "GLOBAL",
    description: "Khởi tạo dự án mới trên hệ thống",
  },
  {
    key: PERMISSIONS.PROJECT_UPDATE,
    label: "Cập nhật dự án",
    groupName: "Dự án",
    scope: "PROJECT",
    description: "Sửa thông tin dự án, tiến độ, thuộc tính dự án",
  },
  {
    key: PERMISSIONS.PROJECT_DELETE,
    label: "Xóa dự án",
    groupName: "Dự án",
    scope: "PROJECT",
    description: "Xóa dự án khỏi hệ thống",
  },
  {
    key: PERMISSIONS.PROJECT_MANAGE,
    label: "Toàn quyền dự án",
    groupName: "Dự án",
    scope: "PROJECT",
    description: "Toàn quyền quản trị và cấu hình dự án",
  },

  // 9. User Projects
  {
    key: PERMISSIONS.USER_PROJECT_VIEW,
    label: "Xem phân bổ nhân sự dự án",
    groupName: "Phân bổ dự án",
    scope: "PROJECT",
    description: "Xem danh sách nhân sự tham gia dự án",
  },
  {
    key: PERMISSIONS.USER_PROJECT_ASSIGN,
    label: "Gán nhân sự vào dự án",
    groupName: "Phân bổ dự án",
    scope: "PROJECT",
    description: "Phân bổ nhân sự, vai trò công việc vào dự án",
  },
  {
    key: PERMISSIONS.USER_PROJECT_UPDATE,
    label: "Cập nhật phân bổ nhân sự",
    groupName: "Phân bổ dự án",
    scope: "PROJECT",
    description: "Sửa vai trò hoặc thay thế nhân sự trong dự án",
  },
  {
    key: PERMISSIONS.USER_PROJECT_DELETE,
    label: "Hủy phân bổ nhân sự",
    groupName: "Phân bổ dự án",
    scope: "PROJECT",
    description: "Rút nhân sự ra khỏi dự án",
  },
  {
    key: PERMISSIONS.USER_PROJECT_MANAGE,
    label: "Toàn quyền phân bổ dự án",
    groupName: "Phân bổ dự án",
    scope: "PROJECT",
    description: "Toàn quyền quản lý phân bổ nhân sự vào dự án",
  },

  // 10. Plans
  {
    key: PERMISSIONS.PLAN_VIEW,
    label: "Xem kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Xem kế hoạch định biên của dự án",
  },
  {
    key: PERMISSIONS.PLAN_CREATE,
    label: "Tạo kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Tạo phiên bản kế hoạch định biên mới",
  },
  {
    key: PERMISSIONS.PLAN_UPDATE,
    label: "Cập nhật kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Chỉnh sửa số lượng, phân bổ định biên",
  },
  {
    key: PERMISSIONS.PLAN_DELETE,
    label: "Xóa kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Xóa kế hoạch định biên chưa ban hành",
  },
  {
    key: PERMISSIONS.PLAN_SUBMIT,
    label: "Trình duyệt kế hoạch",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Gửi kế hoạch định biên lên cấp trên duyệt",
  },
  {
    key: PERMISSIONS.PLAN_APPROVE,
    label: "Phê duyệt kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Phê duyệt hoặc ban hành kế hoạch định biên",
  },
  {
    key: PERMISSIONS.PLAN_REJECT,
    label: "Từ chối kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Từ chối và yêu cầu chỉnh sửa kế hoạch",
  },
  {
    key: PERMISSIONS.PLAN_ARCHIVE,
    label: "Lưu trữ kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Đóng và lưu trữ phiên bản kế hoạch cũ",
  },
  {
    key: PERMISSIONS.PLAN_MANAGE,
    label: "Toàn quyền kế hoạch định biên",
    groupName: "Kế hoạch định biên",
    scope: "PROJECT",
    description: "Toàn quyền quản trị kế hoạch định biên dự án",
  },

  // 11. Headcount Projects
  {
    key: PERMISSIONS.HEADCOUNT_PROJECT_VIEW,
    label: "Xem dự án định biên",
    groupName: "Định biên dự án",
    scope: "PROJECT",
    description: "Xem thông tin dự án thuộc kế hoạch",
  },
  {
    key: PERMISSIONS.HEADCOUNT_PROJECT_CREATE,
    label: "Thêm dự án vào kế hoạch",
    groupName: "Định biên dự án",
    scope: "PROJECT",
    description: "Đưa dự án vào danh sách lập kế hoạch",
  },
  {
    key: PERMISSIONS.HEADCOUNT_PROJECT_UPDATE,
    label: "Sửa dự án trong kế hoạch",
    groupName: "Định biên dự án",
    scope: "PROJECT",
    description: "Cập nhật thông số dự án trong kế hoạch",
  },
  {
    key: PERMISSIONS.HEADCOUNT_PROJECT_DELETE,
    label: "Xóa dự án khỏi kế hoạch",
    groupName: "Định biên dự án",
    scope: "PROJECT",
    description: "Loại bỏ dự án khỏi kế hoạch định biên",
  },
  {
    key: PERMISSIONS.HEADCOUNT_PROJECT_MANAGE,
    label: "Toàn quyền dự án kế hoạch",
    groupName: "Định biên dự án",
    scope: "PROJECT",
    description: "Toàn quyền quản trị dự án trong kế hoạch",
  },

  // 12. Headcount Standards
  {
    key: PERMISSIONS.HEADCOUNT_STANDARD_VIEW,
    label: "Xem định mức chuẩn",
    groupName: "Định biên chuẩn",
    scope: "GLOBAL",
    description: "Xem tiêu chuẩn và định mức nhân sự",
  },
  {
    key: PERMISSIONS.HEADCOUNT_STANDARD_CREATE,
    label: "Tạo định mức chuẩn",
    groupName: "Định biên chuẩn",
    scope: "GLOBAL",
    description: "Tạo tiêu chuẩn định biên nhân sự mới",
  },
  {
    key: PERMISSIONS.HEADCOUNT_STANDARD_UPDATE,
    label: "Sửa định mức chuẩn",
    groupName: "Định biên chuẩn",
    scope: "GLOBAL",
    description: "Cập nhật công thức và định mức nhân sự",
  },
  {
    key: PERMISSIONS.HEADCOUNT_STANDARD_DELETE,
    label: "Xóa định mức chuẩn",
    groupName: "Định biên chuẩn",
    scope: "GLOBAL",
    description: "Xóa tiêu chuẩn định mức nhân sự",
  },
  {
    key: PERMISSIONS.HEADCOUNT_STANDARD_MANAGE,
    label: "Toàn quyền định mức chuẩn",
    groupName: "Định biên chuẩn",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị bộ tiêu chuẩn định biên",
  },

  // 13. Headcount Criteria
  {
    key: PERMISSIONS.HEADCOUNT_CRITERIA_VIEW,
    label: "Xem tiêu chí định biên",
    groupName: "Tiêu chí định biên",
    scope: "GLOBAL",
    description: "Xem danh mục tiêu chí tính toán định biên",
  },
  {
    key: PERMISSIONS.HEADCOUNT_CRITERIA_CREATE,
    label: "Tạo tiêu chí định biên",
    groupName: "Tiêu chí định biên",
    scope: "GLOBAL",
    description: "Tạo tiêu chí định biên mới",
  },
  {
    key: PERMISSIONS.HEADCOUNT_CRITERIA_UPDATE,
    label: "Sửa tiêu chí định biên",
    groupName: "Tiêu chí định biên",
    scope: "GLOBAL",
    description: "Cập nhật trọng số và tiêu chí định biên",
  },
  {
    key: PERMISSIONS.HEADCOUNT_CRITERIA_DELETE,
    label: "Xóa tiêu chí định biên",
    groupName: "Tiêu chí định biên",
    scope: "GLOBAL",
    description: "Xóa tiêu chí định biên không sử dụng",
  },
  {
    key: PERMISSIONS.HEADCOUNT_CRITERIA_MANAGE,
    label: "Toàn quyền tiêu chí định biên",
    groupName: "Tiêu chí định biên",
    scope: "GLOBAL",
    description: "Toàn quyền quản trị danh mục tiêu chí",
  },

  // 14. Headcount Factors
  {
    key: PERMISSIONS.HEADCOUNT_FACTOR_VIEW,
    label: "Xem hệ số tháng",
    groupName: "Hệ số tháng",
    scope: "GLOBAL",
    description: "Xem bảng hệ số phân bổ định biên theo tháng",
  },
  {
    key: PERMISSIONS.HEADCOUNT_FACTOR_UPDATE,
    label: "Cập nhật hệ số tháng",
    groupName: "Hệ số tháng",
    scope: "GLOBAL",
    description: "Điều chỉnh hệ số tháng",
  },
  {
    key: PERMISSIONS.HEADCOUNT_FACTOR_MANAGE,
    label: "Toàn quyền hệ số tháng",
    groupName: "Hệ số tháng",
    scope: "GLOBAL",
    description: "Toàn quyền quản lý bảng hệ số tháng",
  },

  // 15. Phases
  {
    key: PERMISSIONS.PHASE_VIEW,
    label: "Xem giai đoạn dự án",
    groupName: "Giai đoạn dự án",
    scope: "PROJECT",
    description: "Xem các giai đoạn thực hiện dự án",
  },
  {
    key: PERMISSIONS.PHASE_CREATE,
    label: "Tạo giai đoạn dự án",
    groupName: "Giai đoạn dự án",
    scope: "PROJECT",
    description: "Thêm giai đoạn mới cho dự án",
  },
  {
    key: PERMISSIONS.PHASE_UPDATE,
    label: "Sửa giai đoạn dự án",
    groupName: "Giai đoạn dự án",
    scope: "PROJECT",
    description: "Cập nhật mốc thời gian giai đoạn",
  },
  {
    key: PERMISSIONS.PHASE_DELETE,
    label: "Xóa giai đoạn dự án",
    groupName: "Giai đoạn dự án",
    scope: "PROJECT",
    description: "Xóa giai đoạn dự án",
  },
  {
    key: PERMISSIONS.PHASE_MANAGE,
    label: "Toàn quyền giai đoạn dự án",
    groupName: "Giai đoạn dự án",
    scope: "PROJECT",
    description: "Toàn quyền quản lý giai đoạn dự án",
  },

  // 16. Milestones
  {
    key: PERMISSIONS.MILESTONE_VIEW,
    label: "Xem mốc tiến độ",
    groupName: "Mốc tiến độ",
    scope: "PROJECT",
    description: "Xem các mốc tiến độ dự án",
  },
  {
    key: PERMISSIONS.MILESTONE_CREATE,
    label: "Tạo mốc tiến độ",
    groupName: "Mốc tiến độ",
    scope: "PROJECT",
    description: "Thêm mốc tiến độ mới cho dự án",
  },
  {
    key: PERMISSIONS.MILESTONE_UPDATE,
    label: "Sửa mốc tiến độ",
    groupName: "Mốc tiến độ",
    scope: "PROJECT",
    description: "Cập nhật ngày hoàn thành mốc tiến độ",
  },
  {
    key: PERMISSIONS.MILESTONE_DELETE,
    label: "Xóa mốc tiến độ",
    groupName: "Mốc tiến độ",
    scope: "PROJECT",
    description: "Xóa mốc tiến độ dự án",
  },
  {
    key: PERMISSIONS.MILESTONE_MANAGE,
    label: "Toàn quyền mốc tiến độ",
    groupName: "Mốc tiến độ",
    scope: "PROJECT",
    description: "Toàn quyền quản lý mốc tiến độ và phụ thuộc",
  },

  {
    key: PERMISSIONS.REPORT_VIEW,
    label: "Xem báo cáo định biên",
    groupName: "Báo cáo",
    scope: "PROJECT",
    description: "Xem dashboard và báo cáo so sánh định biên",
  },
  {
    key: PERMISSIONS.REPORT_EXPORT,
    label: "Xuất file báo cáo",
    groupName: "Báo cáo",
    scope: "PROJECT",
    description: "Tải file báo cáo Excel/PDF",
  },

  {
    key: PERMISSIONS.AUDIT_VIEW,
    label: "Xem nhật ký kiểm toán",
    groupName: "Kiểm toán",
    scope: "GLOBAL",
    description: "Xem lịch sử thay đổi dữ liệu toàn hệ thống",
  },

  {
    key: PERMISSIONS.CATALOG_MANAGE,
    label: "Toàn quyền danh mục chung",
    groupName: "Danh mục",
    scope: "GLOBAL",
    description:
      "Quản lý chung các danh mục phòng ban, khu vực, vùng, chức danh",
  },
]
