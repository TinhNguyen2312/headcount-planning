/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AccessRoleResponse,
  AvailableProjectItem,
  DepartmentResponse,
  HeadcountProjectResponse,
  HeadcountStandardResponse,
  MilestoneDependencyResponse,
  MilestoneResponse,
  PermissionResponse,
  PlanResponse,
  ProjectResponse,
  PropertyResponse,
  RegionDetail,
  RoleResponse,
  SectorResponse,
  UserMeResponse,
  UserWithProjectsResponse,
  ZoneResponse,
} from "@/types"

import departmentsRaw from "./seeds/departments.json"
import projectsRaw from "./seeds/projects.json"
import rolesRaw from "./seeds/roles.json"
import usersRaw from "./seeds/users.json"

// ============================================================================
// 1. SECTORS & REGIONS
// ============================================================================
export const INITIAL_SECTORS: SectorResponse[] = [
  {
    id: 1,
    code: "KHU_VUC_1",
    name: "Khu vực 1",
    description: "TP. Hồ Chí Minh & lân cận",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "KHU_VUC_2",
    name: "Khu vực 2",
    description: "Đồng Nai, Bình Dương, Bà Rịa - Vũng Tàu",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    code: "KHU_VUC_3",
    name: "Khu vực 3",
    description: "Phan Thiết, Đà Lạt, Khánh Hòa, ĐBSCL",
    createdAt: "2026-01-01T00:00:00Z",
  },
]

export const INITIAL_REGIONS: RegionDetail[] = [
  {
    id: 1,
    sectorId: 2,
    sectorName: "Khu vực 2",
    code: "VUNG_DONG_NAI_1",
    name: "Vùng Đồng Nai 1",
    description: "Khu đô thị sinh thái thông minh Aqua City",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    sectorId: 1,
    sectorName: "Khu vực 1",
    code: "VUNG_TPHCM_1",
    name: "Vùng TP.HCM 1",
    description: "Khu vực Trung tâm TP. Hồ Chí Minh",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    sectorId: 2,
    sectorName: "Khu vực 2",
    code: "VUNG_BA_RIA_VUNG_TAU",
    name: "Vùng Bà Rịa - Vũng Tàu",
    description: "Khu vực Hồ Tràm & TP Vũng Tàu",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 4,
    sectorId: 3,
    sectorName: "Khu vực 3",
    code: "VUNG_PHAN_THIET_1",
    name: "Vùng Phan Thiết 1",
    description: "Đại đô thị du lịch NovaWorld Phan Thiet",
    createdAt: "2026-01-01T00:00:00Z",
  },
]

// ============================================================================
// 2. PROJECTS & ZONES
// ============================================================================
const rawProjects = (projectsRaw as any)?.result || []

export const INITIAL_PROJECTS: ProjectResponse[] = rawProjects.map(
  (p: any) => ({
    id: p.id,
    name: p.name,
    address: p.address || "Long Hưng, Biên Hòa, Đồng Nai",
    generalInfo: p.generalInfo || null,
    region: p.region || "VUNG_DONG_NAI_1",
    sector: p.sector || "KHU_VUC_2",
    status: p.status || "ACTIVE",
    startDate: p.startDate || "2026-01-01",
    endDate: p.endDate || "2028-12-31",
    projectType: p.projectType || "HIGH_RISE",
    projectTypes: p.projectTypes || [p.projectType || "HIGH_RISE"],
    createdAt: p.createdAt || "2026-01-01T00:00:00.000Z",
    zonesCount: p.zonesCount || 2,
    membersCount: p.membersCount || 12,
    projectAdmins: p.projectAdmins || [
      { userId: 1, fullName: "Quản trị viên Hệ thống", roleName: "Giám đốc Dự án" },
    ],
    thumbnail:
      p.thumbnail ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    accProjectId: p.accProjectId || null,
  }),
)

export const INITIAL_ZONES: ZoneResponse[] = [
  {
    id: 1,
    projectId: 21,
    name: "Phân khu Đảo Phượng Hoàng (Phoenix)",
    code: "PK_01",
    startTime: "2026-01-01",
    endTime: "2028-12-31",
    createdBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    projectId: 21,
    name: "Phân khu River Park 1",
    code: "PK_02",
    startTime: "2026-01-01",
    endTime: "2028-12-31",
    createdBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    projectId: 20,
    name: "Phân khu The Sun Harbor 1",
    code: "PK_03",
    startTime: "2026-01-01",
    endTime: "2028-12-31",
    createdBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

// ============================================================================
// 3. DEPARTMENTS
// ============================================================================
function flattenDeptTree(root: any): DepartmentResponse[] {
  const result: DepartmentResponse[] = []
  const queue: any[] = [root]
  let currentId = 1
  const codeToIdMap = new Map<string, number>()

  while (queue.length > 0) {
    const node = queue.shift()!
    const id = currentId++
    codeToIdMap.set(node.code, id)

    const parentId = node.parentCode ? codeToIdMap.get(node.parentCode) ?? null : null

    result.push({
      id,
      code: node.code,
      name: node.name,
      type: node.type || "Department",
      level: node.level ?? 1,
      parentId,
      status: node.status || "ACTIVE",
      description: node.name,
      startDate: node.startDate || "2020-01-01",
      endDate: node.endDate || null,
      createdAt: node.createdAt || "2026-01-01T00:00:00Z",
      updatedAt: node.updatedAt || null,
    })

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        queue.push(child)
      }
    }
  }

  return result
}

const deptRawRoot = (departmentsRaw as any)?.tree || departmentsRaw
export const INITIAL_DEPARTMENTS: DepartmentResponse[] = flattenDeptTree(deptRawRoot)

// ============================================================================
// 4. ROLES
// ============================================================================
const rawRoles = (rolesRaw as any)?.result || []
export const INITIAL_ROLES: RoleResponse[] = rawRoles.map((r: any) => ({
  id: r.id,
  code: r.code || null,
  shortCode: r.shortCode || r.code || null,
  name: r.name,
  level: r.level || 1,
  parentRoleId: r.parentRoleId || null,
  departmentId: r.departmentId || null,
  planningMethod: r.planningMethod || "BY_PROJECT",
  description: r.description || r.name,
  createdAt: r.createdAt || "2026-01-01T00:00:00Z",
  updatedAt: r.updatedAt || null,
}))

// ============================================================================
// 5. USERS
// ============================================================================
const rawUsersList = (usersRaw as any)?.list || []

const DEFAULT_PROJECT_SUMMARIES = [
  {
    id: 21,
    name: "Aqua - Đảo 5",
    roleId: 15,
    roleName: "Giám đốc Dự án",
    projectRole: "PROJECT_ADMIN" as const,
    status: "ACTIVE",
    projectId: 21,
    projectName: "Aqua - Đảo 5",
  },
  {
    id: 20,
    name: "Aqua - Đảo 4",
    roleId: 16,
    roleName: "Phó TGĐ Điều hành",
    projectRole: "PROJECT_ADMIN" as const,
    status: "ACTIVE",
    projectId: 20,
    projectName: "Aqua - Đảo 4",
  },
]

export const MOCK_USERS_ACCOUNTS: UserMeResponse[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn Admin (Super Admin)",
    phone: "0901234567",
    email: "admin@gmail.com",
    status: "ACTIVE",
    systemRole: "SUPER_ADMIN",
    roleId: 15,
    roleName: "Quản trị viên Hệ thống",
    perNumber: "NV0001",
    novatorStatus: 1,
    departmentCode: "NVG",
    divisionCode: "NVGN1",
    managerPerNumber: null,
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: DEFAULT_PROJECT_SUMMARIES,
    currentProject: DEFAULT_PROJECT_SUMMARIES[0],
    role: "SUPER_ADMIN",
  },
  {
    id: 2,
    fullName: "Trần Giám Đốc (GĐ/PGĐ Dự án)",
    phone: "0902345678",
    email: "gmd.dn1.gdp.p3.1@novaland.com.vn",
    status: "ACTIVE",
    systemRole: "USER",
    roleId: 16,
    roleName: "Giám đốc Điều hành",
    perNumber: "NV0002",
    novatorStatus: 1,
    departmentCode: "12003961",
    divisionCode: "11001534",
    managerPerNumber: "NV0001",
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: DEFAULT_PROJECT_SUMMARIES,
    currentProject: DEFAULT_PROJECT_SUMMARIES[0],
    role: "PROJECT_ADMIN",
  },
  {
    id: 3,
    fullName: "Lê Trưởng Phòng (Zone Admin)",
    phone: "0903456789",
    email: "gmd.dn1.tp.p3.2.1@novaland.com.vn",
    status: "ACTIVE",
    systemRole: "USER",
    roleId: 18,
    roleName: "Trưởng phòng Quản lý Xây dựng",
    perNumber: "NV0003",
    novatorStatus: 1,
    departmentCode: "12003961",
    divisionCode: "11001534",
    managerPerNumber: "NV0002",
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: [DEFAULT_PROJECT_SUMMARIES[0]],
    currentProject: DEFAULT_PROJECT_SUMMARIES[0],
    role: "ZONE_ADMIN",
  },
  {
    id: 4,
    fullName: "Phạm Trưởng BP (Task Inspector)",
    phone: "0904567890",
    email: "gmd.dn1.tbp.p3.2.2@novaland.com.vn",
    status: "ACTIVE",
    systemRole: "USER",
    roleId: 19,
    roleName: "Trưởng bộ phận Giám sát",
    perNumber: "NV0004",
    novatorStatus: 1,
    departmentCode: "13004826",
    divisionCode: "11001534",
    managerPerNumber: "NV0003",
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: [DEFAULT_PROJECT_SUMMARIES[0]],
    currentProject: DEFAULT_PROJECT_SUMMARIES[0],
    role: "TASK_INSPECTOR",
  },
  {
    id: 5,
    fullName: "Hoàng Kỹ Sư (Task Executor)",
    phone: "0905678901",
    email: "gms.cg.3.4@novaland.com.vn",
    status: "ACTIVE",
    systemRole: "USER",
    roleId: 20,
    roleName: "Kỹ sư Giám sát thi công",
    perNumber: "NV0005",
    novatorStatus: 1,
    departmentCode: "13004826",
    divisionCode: "11001534",
    managerPerNumber: "NV0004",
    provider: "LOCAL",
    createdAt: "2026-01-01T00:00:00Z",
    projects: [DEFAULT_PROJECT_SUMMARIES[0]],
    currentProject: DEFAULT_PROJECT_SUMMARIES[0],
    role: "TASK_EXECUTOR",
  },
]

export const INITIAL_USERS: UserWithProjectsResponse[] = [
  ...MOCK_USERS_ACCOUNTS,
  ...rawUsersList.map((u: any, idx: number) => ({
    id: idx + 10,
    fullName: u.fullName || "Nhân viên Novaland",
    phone: u.phone || null,
    email: u.email || `employee_${idx + 10}@novaland.com.vn`,
    status: "ACTIVE" as const,
    systemRole: "USER" as const,
    roleId: 20,
    roleName: u.positionName || "Chuyên viên",
    perNumber: u.perNumber || `NV${1000 + idx}`,
    novatorStatus: u.status || 0,
    departmentCode: u.department || null,
    divisionCode: u.division || null,
    managerPerNumber: u.managerID || null,
    provider: "LOCAL",
    createdAt: u.createdAt || "2026-01-01T00:00:00Z",
    projects: [DEFAULT_PROJECT_SUMMARIES[0]],
  })),
]

// ============================================================================
// 6. MILESTONES & DEPENDENCIES
// ============================================================================
export const INITIAL_MILESTONES: MilestoneResponse[] = [
  {
    id: 1,
    code: "M_KHOI_DONG",
    name: "Khởi động dự án",
    description: "Thành lập ban điều hành và phê duyệt chủ trương",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [],
    successorIds: [2],
  },
  {
    id: 2,
    code: "M_GPMB",
    name: "Đền bù & Giải phóng mặt bằng",
    description: "Hoàn tất phương án bồi thường và bàn giao quỹ đất sạch",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [1],
    successorIds: [3],
  },
  {
    id: 3,
    code: "M_PD_1_500",
    name: "Phê duyệt quy hoạch 1/500",
    description: "UBND Tỉnh phê duyệt đồ án quy hoạch chi tiết xây dựng 1/500",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [2],
    successorIds: [4],
  },
  {
    id: 4,
    code: "M_BC_KTKT",
    name: "Báo cáo nghiên cứu khả thi",
    description: "Thẩm định thiết kế cơ sở và phê duyệt dự án đầu tư",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [3],
    successorIds: [5],
  },
  {
    id: 5,
    code: "M_GPXD",
    name: "Giấy phép xây dựng (GPXD)",
    description: "Sở Xây dựng cấp giấy phép xây dựng chính thức",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [4],
    successorIds: [6],
  },
  {
    id: 6,
    code: "M_KHOI_CONG",
    name: "Khởi công xây dựng",
    description: "Lễ động thổ và triển khai thi công cọc thử, cọc đại trà",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [5],
    successorIds: [7],
  },
  {
    id: 7,
    code: "M_CAT_NOC",
    name: "Cất nóc công trình",
    description: "Hoàn thành toàn bộ kết cấu bê tông cốt thép phần thân",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [6],
    successorIds: [8],
  },
  {
    id: 8,
    code: "M_HOAN_THIEN",
    name: "Hoàn thiện cơ điện & nội thất",
    description: "Thi công hoàn thiện kiến trúc, MEP, cảnh quan cây xanh",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [7],
    successorIds: [9],
  },
  {
    id: 9,
    code: "M_BAN_GIAO",
    name: "Bàn giao đưa vào sử dụng",
    description: "Nghiệm thu PCCC, nghiệm thu nhà nước và bàn giao cho khách hàng",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [8],
    successorIds: [10],
  },
  {
    id: 10,
    code: "M_QUYET_TOAN",
    name: "Quyết toán & Đóng dự án",
    description: "Quyết toán hợp đồng nhà thầu và cấp giấy chứng nhận QSDĐ",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    predecessorIds: [9],
    successorIds: [],
  },
]

export const INITIAL_MILESTONE_DEPENDENCIES: MilestoneDependencyResponse[] = [
  { id: 1, fromMilestoneId: 1, toMilestoneId: 2, dependencyType: "FINISH_TO_START" },
  { id: 2, fromMilestoneId: 2, toMilestoneId: 3, dependencyType: "FINISH_TO_START" },
  { id: 3, fromMilestoneId: 3, toMilestoneId: 4, dependencyType: "FINISH_TO_START" },
  { id: 4, fromMilestoneId: 4, toMilestoneId: 5, dependencyType: "FINISH_TO_START" },
  { id: 5, fromMilestoneId: 5, toMilestoneId: 6, dependencyType: "FINISH_TO_START" },
  { id: 6, fromMilestoneId: 6, toMilestoneId: 7, dependencyType: "FINISH_TO_START" },
  { id: 7, fromMilestoneId: 7, toMilestoneId: 8, dependencyType: "FINISH_TO_START" },
  { id: 8, fromMilestoneId: 8, toMilestoneId: 9, dependencyType: "FINISH_TO_START" },
  { id: 9, fromMilestoneId: 9, toMilestoneId: 10, dependencyType: "FINISH_TO_START" },
]

// ============================================================================
// 7. PROPERTIES (CƠ SỞ ĐỊNH BIÊN)
// ============================================================================
export const INITIAL_PROPERTIES: PropertyResponse[] = [
  {
    id: 1,
    code: "PROP_DIEN_TICH_SAN",
    name: "Diện tích sàn xây dựng (GFA)",
    dataType: "NUMBER",
    projectType: "ALL",
    unit: "m²",
    options: null,
    description: "Tổng diện tích sàn xây dựng toàn dự án",
    isActive: true,
    departmentIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "PROP_SO_TANG",
    name: "Số tầng cao",
    dataType: "NUMBER",
    projectType: "HIGH_RISE",
    unit: "tầng",
    options: null,
    description: "Số tầng nổi công trình cao nhất trong dự án",
    isActive: true,
    departmentIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    code: "PROP_SO_CAN_HO",
    name: "Tổng số lượng sản phẩm",
    dataType: "NUMBER",
    projectType: "ALL",
    unit: "căn",
    options: null,
    description: "Số lượng căn hộ, biệt thự, nhà phố thương mại",
    isActive: true,
    departmentIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 4,
    code: "PROP_QUY_MO_DAT",
    name: "Quy mô diện tích đất",
    dataType: "NUMBER",
    projectType: "ALL",
    unit: "ha",
    options: null,
    description: "Tổng diện tích đất quy hoạch thực hiện dự án",
    isActive: true,
    departmentIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 5,
    code: "PROP_CAP_CONG_TRINH",
    name: "Cấp công trình",
    dataType: "SELECT",
    projectType: "ALL",
    unit: null,
    options: ["Cấp đặc biệt", "Cấp I", "Cấp II", "Cấp III"],
    description: "Cấp công trình theo phân loại của Bộ Xây dựng",
    isActive: true,
    departmentIds: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

// ============================================================================
// 8. STANDARDS (KHUNG ĐỊNH BIÊN CHUẨN)
// ============================================================================
export const INITIAL_STANDARDS: HeadcountStandardResponse[] = [
  {
    id: 1,
    roleId: 15,
    role: INITIAL_ROLES[0] || {
      id: 15,
      code: "ROLE_GDD_AQUA",
      shortCode: "GDDA",
      name: "Giám đốc Dự án",
      level: 1,
      parentRoleId: null,
      departmentId: null,
      planningMethod: "BY_PROJECT",
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
    fromMilestoneId: 1,
    fromMilestone: INITIAL_MILESTONES[0],
    toMilestoneId: 9,
    toMilestone: INITIAL_MILESTONES[8],
    headcount: 1,
    headcountMin: 1,
    headcountMax: 1,
    note: "1 Giám đốc dự án phụ trách xuyên suốt từ Khởi động đến Bàn giao",
    fromLeadTimeMonths: 1,
    toLeadTimeMonths: 0,
    durationMonths: 36,
    monthlyFactors: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    projectType: "ALL",
    criteriaCount: 0,
    criteria: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    roleId: 18,
    role: INITIAL_ROLES[2] || {
      id: 18,
      code: "ROLE_TP_XD",
      shortCode: "TP XD",
      name: "Trưởng phòng Quản lý Xây dựng",
      level: 2,
      parentRoleId: null,
      departmentId: null,
      planningMethod: "BY_PROJECT",
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
    fromMilestoneId: 5,
    fromMilestone: INITIAL_MILESTONES[4],
    toMilestoneId: 8,
    toMilestone: INITIAL_MILESTONES[7],
    headcount: 2,
    headcountMin: 1,
    headcountMax: 3,
    note: "Phụ trách giai đoạn thi công xây dựng",
    fromLeadTimeMonths: 2,
    toLeadTimeMonths: 1,
    durationMonths: 24,
    monthlyFactors: [0.5, 0.8, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.5, 0.2],
    projectType: "ALL",
    criteriaCount: 0,
    criteria: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

// ============================================================================
// 9. ACCESS ROLES & PERMISSIONS
// ============================================================================
export const INITIAL_ACCESS_ROLES: AccessRoleResponse[] = [
  {
    id: 1,
    name: "Quản trị viên Hệ thống",
    description: "Toàn quyền quản trị và thiết lập hệ thống định biên",
    scope: "GLOBAL",
    isSystem: true,
    parentId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Giám đốc / Ban Điều hành Dự án",
    description: "Quản lý kế hoạch tiến độ, phê duyệt và điều phối nhân sự dự án",
    scope: "PROJECT",
    isSystem: true,
    parentId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Quản lý Phân khu",
    description: "Quản lý công tác thi công và nhân sự tại từng phân khu",
    scope: "PROJECT",
    isSystem: false,
    parentId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "Trưởng bộ phận Giám sát",
    description: "Kiểm tra, phân công và giám sát định biên nhân sự",
    scope: "PROJECT",
    isSystem: false,
    parentId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Kỹ sư Điều hành / Nhân viên",
    description: "Tiếp nhận công việc và cập nhật tiến độ công tác",
    scope: "PROJECT",
    isSystem: false,
    parentId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

export const INITIAL_PERMISSIONS: PermissionResponse[] = [
  { id: 1, key: "VIEW_PROJECT", label: "Xem dự án", groupName: "Dự án", scope: "PROJECT", description: null },
  { id: 2, key: "EDIT_PROJECT", label: "Chỉnh sửa dự án", groupName: "Dự án", scope: "PROJECT", description: null },
  { id: 3, key: "VIEW_PLAN", label: "Xem kế hoạch", groupName: "Kế hoạch", scope: "PROJECT", description: null },
  { id: 4, key: "EDIT_PLAN", label: "Điều chỉnh kế hoạch", groupName: "Kế hoạch", scope: "PROJECT", description: null },
  { id: 5, key: "VIEW_STAFF", label: "Xem nhân sự", groupName: "Nhân sự", scope: "PROJECT", description: null },
  { id: 6, key: "ASSIGN_STAFF", label: "Phân bổ nhân sự", groupName: "Nhân sự", scope: "PROJECT", description: null },
  { id: 7, key: "MANAGE_STANDARD", label: "Quản lý định biên chuẩn", groupName: "Định biên", scope: "GLOBAL", description: null },
  { id: 8, key: "VIEW_REPORT", label: "Xem báo cáo định biên", groupName: "Báo cáo", scope: "GLOBAL", description: null },
]

// ============================================================================
// 10. PLANS
// ============================================================================
export const INITIAL_PLANS: PlanResponse[] = [
  {
    id: 1,
    projectId: 21,
    versionName: "v1.0 (Kế hoạch năm 2026)",
    status: "ACTIVE",
    validFrom: "2026-01-01",
    note: "Kế hoạch tiến độ tổng thể đã được Ban Tổng Giám đốc phê duyệt",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    phases: [
      {
        id: 1,
        planId: 1,
        orderIndex: 1,
        milestoneId: 1,
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        durationMonths: 3,
        description: null,
        createdAt: "2026-01-01T00:00:00Z",
        milestone: {
          id: 1,
          code: "M_KHOI_DONG",
          name: "Khởi động dự án",
          description: null,
        },
      },
      {
        id: 2,
        planId: 1,
        orderIndex: 2,
        milestoneId: 5,
        startDate: "2026-04-01",
        endDate: "2026-08-31",
        durationMonths: 5,
        description: null,
        createdAt: "2026-01-01T00:00:00Z",
        milestone: {
          id: 5,
          code: "M_GPXD",
          name: "Giấy phép xây dựng (GPXD)",
          description: null,
        },
      },
      {
        id: 3,
        planId: 1,
        orderIndex: 3,
        milestoneId: 6,
        startDate: "2026-09-01",
        endDate: "2027-06-30",
        durationMonths: 10,
        description: null,
        createdAt: "2026-01-01T00:00:00Z",
        milestone: {
          id: 6,
          code: "M_KHOI_CONG",
          name: "Khởi công xây dựng",
          description: null,
        },
      },
    ],
  },
]

// ============================================================================
// 11. HEADCOUNT PROJECTS
// ============================================================================
export const INITIAL_HEADCOUNT_PROJECTS: HeadcountProjectResponse[] = [
  {
    id: 1,
    projectId: 21,
    isActive: true,
    note: "Dự án trọng điểm Đảo Phượng Hoàng",
    project: INITIAL_PROJECTS[0],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    projectId: 20,
    isActive: true,
    note: "Dự án Aqua City Đảo 4",
    project: INITIAL_PROJECTS[1],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

export const INITIAL_AVAILABLE_PROJECTS: AvailableProjectItem[] = INITIAL_PROJECTS.map(
  (p) => ({
    id: p.id,
    code: `DA_${p.id}`,
    name: p.name,
    address: p.address,
    status: p.status,
    regionId: 1,
    regionName: "Vùng Đồng Nai 1",
    sectorId: 2,
    sectorName: "Khu vực 2",
  }),
)
