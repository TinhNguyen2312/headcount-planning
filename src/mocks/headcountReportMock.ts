export interface MonthlyData {
  monthIndex: number
  monthLabel: string // e.g. "T01/2026"
  standardHeadcount: number // ĐB
  actualHeadcount: number // TT
  surplus: number // Thừa
  shortage: number // Thiếu
}

export interface ActualStaffBreakdown {
  userId: number
  perNumber: string
  fullName: string
  assignedProjects: { code: string; name: string }[]
  headcountRatio: number
}

export interface StandardBasisDetail {
  phaseName: string
  milestoneName: string
  leadTimeMonths: number
  projectScale: string
  baseHeadcount: number
  monthlyFactor: number
}

export interface MatrixRowItem {
  id: string
  isSubTotal?: boolean
  regionId: number
  regionCode: string
  regionName: string
  projectId: number
  projectCode: string
  projectName: string
  departmentId: number
  departmentCode: string
  departmentName: string
  roleId: number
  roleCode: string
  roleName: string
  planningMethod: "BY_PROJECT" | "BY_REGION" | "BY_SECTOR"
  months: MonthlyData[]
  actualStaffList: ActualStaffBreakdown[]
  standardBasis: StandardBasisDetail
}

export interface RecommendationItem {
  id: string
  type: "TRANSFER" | "RECRUITMENT"
  projectId: number
  projectCode: string
  projectName: string
  departmentCode: string
  departmentName: string
  roleId: number
  roleName: string
  planningMethod: "BY_PROJECT" | "BY_REGION" | "BY_SECTOR"
  currentPeriodQty: number
  previousPeriodQty: number
  neededQty: number
  confirmedQty: number
  consecutiveShortageMonths?: number // Số tháng thiếu liên tục
  status: "INITIAL" | "CONFIRMED" | "FINISHED"
  proposalCodes: string[]
  notes?: string
}

export interface ProposalItem {
  id: string
  code: string // e.g. "TD_202609_001_1"
  type: "TRANSFER" | "RECRUITMENT"
  recommendationId: string
  projectCode: string
  projectName: string
  departmentName: string
  roleName: string
  targetCount: number
  status: "OPEN" | "CONFIRMED" | "FINISHED" | "CLOSED"
  createdAt: string
  approver?: string
}

export interface SavedReportItem {
  id: string
  reportCode: string
  title: string
  scopeType: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"
  scopeName: string
  fromMonth: string
  toMonth: string
  totalStandard: number
  totalActual: number
  totalSurplus: number
  totalShortage: number
  fulfillmentRate: number
  status: "DRAFT" | "SUBMITTED" | "APPROVED"
  createdBy: string
  createdAt: string
}

// 6 tháng phân tích mặc định: T01/2026 -> T06/2026
export const MOCK_MONTHS_LABEL = [
  "T01/2026",
  "T02/2026",
  "T03/2026",
  "T04/2026",
  "T05/2026",
  "T06/2026",
]

export const MOCK_SCOPE_OPTIONS = {
  sectors: [
    { value: "KV2", label: "Khu vực 2 - Đồng Nai & Bà Rịa Vũng Tàu" },
    { value: "KV1", label: "Khu vực 1 - TP. Hồ Chí Minh" },
  ],
  regions: [
    { value: "DN1", label: "Vùng Đồng Nai 1 (Aqua City)" },
    { value: "DN2", label: "Vùng Đồng Nai 2" },
    { value: "VT1", label: "Vùng Vũng Tàu 1" },
  ],
  projects: [
    {
      value: "1",
      code: "AQUA_112HA",
      label: "Aqua - 112Ha (Đảo Phượng Hoàng)",
    },
    { value: "3", code: "AQUA_81HA", label: "Aqua - 81Ha" },
    { value: "2", code: "AQUA_45HA", label: "Aqua - 45Ha" },
  ],
}

/**
 * Danh sách dữ liệu Matrix ma trận:
 * - 2 DỰ ÁN: Aqua - 112Ha và Aqua - 81Ha (cùng VÙNG ĐỒNG NAI 1)
 * - 3 CHỨC DANH ĐỊNH BIÊN:
 *   1. GĐ/PGĐ Ban Điều hành Dự án (BY_REGION) -> 1 Giám đốc phụ trách cả 2 dự án, mỗi bên 0.5 headcount!
 *   2. KS Giám sát Cọc (BY_PROJECT) -> Aqua 112Ha thiếu 2.0 (tuyển dụng), Aqua 81Ha cân bằng 1.0
 *   3. CVCC Điều phối Dự án (BY_PROJECT) -> Aqua 112Ha thừa 1.0 (thuyên chuyển), Aqua 81Ha cân bằng 1.0
 */
export const MOCK_MATRIX_ROWS: MatrixRowItem[] = [
  // =========================================================================
  // CHỨC DANH 1: GĐ/PGĐ Ban Điều hành Dự án (BY_REGION)
  // 1 Giám đốc (Trần Minh Trí) phụ trách 2 dự án trong Vùng Đồng Nai 1 -> mỗi bên 0.5
  // =========================================================================
  {
    id: "mat-gmd-112",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 1,
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentId: 100,
    departmentCode: "GMD",
    departmentName: "Ban Điều hành Vùng",
    roleId: 1,
    roleCode: "GMD_GD",
    roleName: "GĐ/PGĐ Ban Điều hành Dự án",
    planningMethod: "BY_REGION",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 108,
        perNumber: "NV1001",
        fullName: "Trần Minh Trí",
        assignedProjects: [
          { code: "AQUA_112HA", name: "Aqua - 112Ha" },
          { code: "AQUA_81HA", name: "Aqua - 81Ha" },
        ],
        headcountRatio: 0.5,
      },
    ],
    standardBasis: {
      phaseName: "Quản trị chiến lược & Điều hành cụm dự án Vùng Đồng Nai 1",
      milestoneName: "Khởi đầu đến Bàn giao (M01 -> M19)",
      leadTimeMonths: 0,
      projectScale: "Phân vùng Đồng Nai 1 (Định biên chia đều 0.5/DA)",
      baseHeadcount: 0.5,
      monthlyFactor: 1.0,
    },
  },
  {
    id: "mat-gmd-81",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 3,
    projectCode: "AQUA_81HA",
    projectName: "Aqua - 81Ha",
    departmentId: 100,
    departmentCode: "GMD",
    departmentName: "Ban Điều hành Vùng",
    roleId: 1,
    roleCode: "GMD_GD",
    roleName: "GĐ/PGĐ Ban Điều hành Dự án",
    planningMethod: "BY_REGION",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 0.5,
        actualHeadcount: 0.5,
        surplus: 0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 108,
        perNumber: "NV1001",
        fullName: "Trần Minh Trí",
        assignedProjects: [
          { code: "AQUA_112HA", name: "Aqua - 112Ha" },
          { code: "AQUA_81HA", name: "Aqua - 81Ha" },
        ],
        headcountRatio: 0.5,
      },
    ],
    standardBasis: {
      phaseName: "Quản trị chiến lược & Điều hành cụm dự án Vùng Đồng Nai 1",
      milestoneName: "Khởi đầu đến Bàn giao (M01 -> M19)",
      leadTimeMonths: 0,
      projectScale: "Phân vùng Đồng Nai 1 ",
      baseHeadcount: 0.5,
      monthlyFactor: 1.0,
    },
  },

  // =========================================================================
  // CHỨC DANH 2: KS Giám sát Cọc (BY_PROJECT)
  // Aqua 112Ha: ĐB = 3.0, TT = 1.0 -> Thiếu 2.0 (Kéo dài liên tục 4 tháng)
  // Aqua 81Ha: ĐB = 1.0, TT = 1.0 -> Cân bằng
  // =========================================================================
  {
    id: "mat-coc-112",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 1,
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentId: 104,
    departmentCode: "PCD",
    departmentName: "Quản lý Xây dựng",
    roleId: 21,
    roleCode: "PCD_GS_COC",
    roleName: "KS Giám sát Cọc",
    planningMethod: "BY_PROJECT",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 3.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 2.0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 3.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 2.0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 3.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 2.0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 2.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 1.0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 101,
        perNumber: "NV1021",
        fullName: "Trần Đình Trọng",
        assignedProjects: [{ code: "AQUA_112HA", name: "Aqua - 112Ha" }],
        headcountRatio: 1.0,
      },
    ],
    standardBasis: {
      phaseName: "Thi công cọc, kè phân khu Đảo Phượng Hoàng",
      milestoneName: "Hoàn tất ép cọc đại trà (M06)",
      leadTimeMonths: 1,
      projectScale: "3 Robot ép cọc (Quy mô 1.200 cọc)",
      baseHeadcount: 3.0,
      monthlyFactor: 1.0,
    },
  },
  {
    id: "mat-coc-81",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 3,
    projectCode: "AQUA_81HA",
    projectName: "Aqua - 81Ha",
    departmentId: 104,
    departmentCode: "PCD",
    departmentName: "Quản lý Xây dựng",
    roleId: 21,
    roleCode: "PCD_GS_COC",
    roleName: "KS Giám sát Cọc",
    planningMethod: "BY_PROJECT",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 110,
        perNumber: "NV1035",
        fullName: "Lê Quốc Anh",
        assignedProjects: [{ code: "AQUA_81HA", name: "Aqua - 81Ha" }],
        headcountRatio: 1.0,
      },
    ],
    standardBasis: {
      phaseName: "Thi công cọc đại trà phân khu 81Ha",
      milestoneName: "Hoàn tất ép cọc đại trà (M06)",
      leadTimeMonths: 1,
      projectScale: "1 Robot ép cọc (Quy mô 400 cọc)",
      baseHeadcount: 1.0,
      monthlyFactor: 1.0,
    },
  },

  // =========================================================================
  // CHỨC DANH 3: CVCC Điều phối Dự án (BY_PROJECT)
  // Aqua 112Ha: ĐB = 1.0, TT = 2.0 -> Thừa 1.0 (Đề xuất Thuyên chuyển)
  // Aqua 81Ha: ĐB = 1.0, TT = 1.0 -> Cân bằng
  // =========================================================================
  {
    id: "mat-pmd-112",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 1,
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentId: 101,
    departmentCode: "PMD",
    departmentName: "Phòng Điều hành Dự án",
    roleId: 4,
    roleCode: "PMD_CVCC_DIEU_PHOI",
    roleName: "CVCC Điều phối Dự án",
    planningMethod: "BY_PROJECT",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 2.0,
        surplus: 1.0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 104,
        perNumber: "NV1004",
        fullName: "Nguyễn Văn Hùng",
        assignedProjects: [{ code: "AQUA_112HA", name: "Aqua - 112Ha" }],
        headcountRatio: 1.0,
      },
      {
        userId: 105,
        perNumber: "NV1005",
        fullName: "Lê Minh Tuấn",
        assignedProjects: [{ code: "AQUA_112HA", name: "Aqua - 112Ha" }],
        headcountRatio: 1.0,
      },
    ],
    standardBasis: {
      phaseName: "Theo dõi điều phối tiến độ & thủ tục đầu tư",
      milestoneName: "Khởi công đến Hoàn tất (M03 -> M18)",
      leadTimeMonths: 0,
      projectScale: "Dự án nhóm A quy mô > 100ha",
      baseHeadcount: 1.0,
      monthlyFactor: 1.0,
    },
  },
  {
    id: "mat-pmd-81",
    regionId: 1,
    regionCode: "DN1",
    regionName: "Vùng Đồng Nai 1",
    projectId: 3,
    projectCode: "AQUA_81HA",
    projectName: "Aqua - 81Ha",
    departmentId: 101,
    departmentCode: "PMD",
    departmentName: "Phòng Điều hành Dự án",
    roleId: 4,
    roleCode: "PMD_CVCC_DIEU_PHOI",
    roleName: "CVCC Điều phối Dự án",
    planningMethod: "BY_PROJECT",
    months: [
      {
        monthIndex: 1,
        monthLabel: "T01/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 2,
        monthLabel: "T02/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 3,
        monthLabel: "T03/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 4,
        monthLabel: "T04/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 5,
        monthLabel: "T05/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
      {
        monthIndex: 6,
        monthLabel: "T06/2026",
        standardHeadcount: 1.0,
        actualHeadcount: 1.0,
        surplus: 0,
        shortage: 0,
      },
    ],
    actualStaffList: [
      {
        userId: 111,
        perNumber: "NV1042",
        fullName: "Phạm Tuấn Nam",
        assignedProjects: [{ code: "AQUA_81HA", name: "Aqua - 81Ha" }],
        headcountRatio: 1.0,
      },
    ],
    standardBasis: {
      phaseName: "Theo dõi điều phối tiến độ phân kỳ 81Ha",
      milestoneName: "Khởi công đến Hoàn tất (M03 -> M18)",
      leadTimeMonths: 0,
      projectScale: "Dự án quy mô 81ha",
      baseHeadcount: 1.0,
      monthlyFactor: 1.0,
    },
  },
]

// Dữ liệu Khuyến nghị Thuyên chuyển & Tuyển dụng (Mục 4.5)
export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  // 1. Tuyển dụng: KS Giám sát Cọc (Thiếu 2.0 kéo dài 3-4 tháng tại Aqua 112Ha)
  {
    id: "rec-td-1",
    type: "RECRUITMENT",
    projectId: 1,
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentCode: "PCD",
    departmentName: "Quản lý Xây dựng",
    roleId: 21,
    roleName: "KS Giám sát Cọc",
    planningMethod: "BY_PROJECT",
    currentPeriodQty: 2, // Làm tròn từ thiếu 2.0
    previousPeriodQty: 0,
    neededQty: 2,
    confirmedQty: 2,
    consecutiveShortageMonths: 4, // Thiếu liên tục 4 tháng (T1->T4 >= 3T)
    status: "CONFIRMED",
    proposalCodes: ["TD_202609_001_1", "TD_202609_001_2"],
    notes:
      "Dự án Aqua 112Ha vào cao điểm ép cọc phân khu Đảo 1 với 3 robot ép cọc đồng thời.",
  },

  // 2. Thuyên chuyển: CVCC Điều phối Dự án (Thừa 1.0 tại Aqua 112Ha -> Đề xuất chuyển sang Aqua 81Ha)
  {
    id: "rec-tc-1",
    type: "TRANSFER",
    projectId: 1,
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentCode: "PMD",
    departmentName: "Phòng Điều hành Dự án",
    roleId: 4,
    roleName: "CVCC Điều phối Dự án",
    planningMethod: "BY_PROJECT",
    currentPeriodQty: 1, // Làm tròn nguyên từ thừa 1.0
    previousPeriodQty: 0,
    neededQty: 1,
    confirmedQty: 1,
    status: "CONFIRMED",
    proposalCodes: ["TC_202609_001_1"],
    notes:
      "Dư thừa 1 nhân sự điều phối tại Aqua 112Ha; đề xuất điều chuyển hỗ trợ dự án khác trong Vùng.",
  },
]

// Danh sách các Mã Đề xuất đã sinh (Mục 4.6)
export const MOCK_PROPOSALS: ProposalItem[] = [
  {
    id: "prop-1",
    code: "TD_202609_001_1",
    type: "RECRUITMENT",
    recommendationId: "rec-td-1",
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentName: "Quản lý Xây dựng",
    roleName: "KS Giám sát Cọc",
    targetCount: 1,
    status: "CONFIRMED",
    createdAt: "2026-09-15 09:30",
    approver: "Trần Minh Trí (GĐ Dự án)",
  },
  {
    id: "prop-2",
    code: "TD_202609_001_2",
    type: "RECRUITMENT",
    recommendationId: "rec-td-1",
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentName: "Quản lý Xây dựng",
    roleName: "KS Giám sát Cọc",
    targetCount: 1,
    status: "OPEN",
    createdAt: "2026-09-15 09:30",
    approver: "Đang chờ duyệt",
  },
  {
    id: "prop-3",
    code: "TC_202609_001_1",
    type: "TRANSFER",
    recommendationId: "rec-tc-1",
    projectCode: "AQUA_112HA",
    projectName: "Aqua - 112Ha",
    departmentName: "Phòng Điều hành Dự án",
    roleName: "CVCC Điều phối Dự án",
    targetCount: 1,
    status: "CONFIRMED",
    createdAt: "2026-09-15 09:35",
    approver: "Lê Trường Thọ (Phó TGĐ)",
  },
]

// Danh sách Báo cáo đã lưu trong lịch sử
export const MOCK_SAVED_REPORTS: SavedReportItem[] = [
  {
    id: "rep-1",
    reportCode: "BC_202609_001",
    title:
      "Báo cáo Định biên Vùng Đồng Nai 1 (Aqua 112Ha & Aqua 81Ha) - 6 Tháng Đầu Năm 2026",
    scopeType: "BY_REGION",
    scopeName: "Vùng Đồng Nai 1 (Aqua City)",
    fromMonth: "01/2026",
    toMonth: "06/2026",
    totalStandard: 45.0,
    totalActual: 42.0,
    totalSurplus: 6.0,
    totalShortage: 7.0,
    fulfillmentRate: 93.3,
    status: "APPROVED",
    createdBy: "HRBP - Nguyễn Thị Mai",
    createdAt: "2026-09-15 08:30:00",
  },
  {
    id: "rep-2",
    reportCode: "BC_202608_003",
    title: "Báo cáo Định biên Dự án Aqua 112Ha - Quý 3/2026",
    scopeType: "BY_PROJECT",
    scopeName: "Aqua - 112Ha",
    fromMonth: "07/2026",
    toMonth: "12/2026",
    totalStandard: 62.0,
    totalActual: 51.5,
    totalSurplus: 4.5,
    totalShortage: 15.0,
    fulfillmentRate: 83.1,
    status: "APPROVED",
    createdBy: "HRBP - Phạm Hồng Ánh",
    createdAt: "2026-08-20 14:15:00",
  },
]

/**
 * Hàm tự động tính toán và chèn dòng SubTotal ngay sau mỗi Chức danh
 */
export const buildMatrixWithSubTotals = (
  baseRows: MatrixRowItem[],
): MatrixRowItem[] => {
  const result: MatrixRowItem[] = []

  // Nhóm các dòng theo chức danh (roleCode)
  const roleGroups = new Map<string, MatrixRowItem[]>()
  for (const r of baseRows) {
    if (r.isSubTotal) continue
    const list = roleGroups.get(r.roleCode) || []
    list.push(r)
    roleGroups.set(r.roleCode, list)
  }

  for (const [roleCode, rows] of roleGroups.entries()) {
    // 1. Thêm các dòng dự án của chức danh này
    result.push(...rows)

    // 2. Tính SubTotal: cộng thẳng ĐB và TT của tất cả dự án trong nhóm chức danh,
    //    sau đó tính Thiếu/Thừa từ net của tổng (không cộng Thiếu/Thừa từng dòng riêng lẻ).
    //    Ví dụ: ĐB_A=1.0, ĐB_B=0.5 → SubTotal ĐB=1.5 | TT_A=0.5, TT_B=0.5 → SubTotal TT=1.0
    //    → Thiếu = 1.5 - 1.0 = 0.5 (cần tuyển thêm 0.5 người cho toàn chức danh này)
    const subTotalMonths: MonthlyData[] = MOCK_MONTHS_LABEL.map(
      (label, mIdx) => {
        let totalDB = 0 // Σ Định biên của nhóm chức danh
        let totalTT = 0 // Σ Thực tế của nhóm chức danh
        for (const row of rows) {
          totalDB += row.months[mIdx]?.standardHeadcount ?? 0
          totalTT += row.months[mIdx]?.actualHeadcount ?? 0
        }

        const shortage = Math.max(0, totalDB - totalTT)
        const surplus = Math.max(0, totalTT - totalDB)

        return {
          monthIndex: mIdx + 1,
          monthLabel: label,
          standardHeadcount: totalDB,
          actualHeadcount: totalTT,
          surplus,
          shortage,
        }
      },
    )

    const sample = rows[0]
    result.push({
      id: `subtotal-${roleCode}`,
      isSubTotal: true,
      regionId: sample.regionId,
      regionCode: sample.regionCode,
      regionName: sample.regionName,
      projectId: 0,
      projectCode: "",
      projectName: "",
      departmentId: sample.departmentId,
      departmentCode: sample.departmentCode,
      departmentName: sample.departmentName,
      roleId: sample.roleId,
      roleCode: sample.roleCode,
      roleName: sample.roleName,
      planningMethod: sample.planningMethod,
      months: subTotalMonths,
      actualStaffList: [],
      standardBasis: sample.standardBasis,
    })
  }

  return result
}
