import * as dotenv from "dotenv"
dotenv.config()

import {
  db,
  headcountStandards,
  headcountCriteria,
  headcountMonthlyFactors,
  roles,
  milestones,
  properties,
} from "../src/db"
import { eq } from "drizzle-orm"

interface StandardSeedItem {
  roleCodeOrName: string
  fromMilestoneCode: string
  toMilestoneCode?: string
  headcount: string
  headcountMin?: string
  headcountMax?: string
  note?: string
  durationMonths?: number
  monthlyFactors?: number[]
  criteria?: {
    propertyCode: string
    operator: "BETWEEN" | "=" | "<=" | ">=" | "<" | ">"
    minValue?: number
    maxValue?: number
    note?: string
  }[]
}

const defaultMonthlyCurves: Record<number, number[]> = {
  3: [0.5, 1.0, 0.5],
  4: [0.5, 1.0, 1.0, 0.5],
  5: [0.3, 0.7, 1.0, 1.0, 0.5],
  6: [0.5, 0.5, 1.0, 1.0, 1.0, 0.5],
  7: [0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 0.5],
  8: [0.3, 0.5, 0.8, 1.0, 1.0, 1.0, 0.7, 0.4],
  10: [0.2, 0.3, 0.5, 0.7, 1.0, 1.0, 1.0, 0.7, 0.5, 0.2],
  12: [0.3, 0.5, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.8, 0.5, 0.3],
}

const seedData: StandardSeedItem[] = [
  // ===========================================================================
  // 1. KHỐI PLP (PHÁP LÝ DỰ ÁN) - M01 -> M02
  // ===========================================================================
  {
    roleCodeOrName: "ROLE_PLP_GD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "GĐ/PGĐ Thủ tục PLDA phụ trách cụm >= 1000ha hoặc 11-15 DA",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: ">=", minValue: 1000, note: "Diện tích đất >= 1000ha" },
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 11, maxValue: 15, note: "Cụm 11-15 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_GD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "PGĐ Thủ tục PLDA phụ trách cụm 500-1000ha (6-10 DA)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 500, maxValue: 1000, note: "Diện tích đất 500-1000ha" },
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 6, maxValue: 10, note: "Cụm 6-10 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_TP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "Trưởng phòng Thủ tục PLDA phụ trách cụm 1-5 DA độc lập (<500ha)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<", maxValue: 500, note: "Diện tích đất < 500ha" },
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 1, maxValue: 5, note: "Cụm 1-5 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_TP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "2.0",
    headcountMin: "2.0",
    headcountMax: "3.0",
    note: "2-3 Trưởng phòng Thủ tục PLDA khi cụm >= 11 dự án",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: ">=", minValue: 1000, note: "Diện tích đất >= 1000ha" },
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: ">=", minValue: 11, note: "Cụm >= 11 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_CG",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "Chuyên gia Thủ tục PLDA cụm 1-5 DA",
    durationMonths: 12,
    criteria: [
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 1, maxValue: 5, note: "Cụm 1-5 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_CG",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "2.0",
    headcountMin: "2.0",
    headcountMax: "2.0",
    note: "Chuyên gia Thủ tục PLDA cụm 6-15 DA",
    durationMonths: 12,
    criteria: [
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 6, maxValue: 15, note: "Cụm 6-15 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_CVCC",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "CVCC Thủ tục PLDA cụm 1-5 DA",
    durationMonths: 12,
    criteria: [
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 1, maxValue: 5, note: "Cụm 1-5 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_CVCC",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "2.0",
    headcountMin: "2.0",
    headcountMax: "3.0",
    note: "CVCC Thủ tục PLDA cụm 6-10 DA",
    durationMonths: 12,
    criteria: [
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: "BETWEEN", minValue: 6, maxValue: 10, note: "Cụm 6-10 DA" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PLP_CV",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M02",
    headcount: "1.0",
    headcountMin: "0.0",
    headcountMax: "1.0",
    note: "Chuyên viên Thủ tục PLDA (admin dự án)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "PROJECT_COUNT_IN_CLUSTER", operator: ">=", minValue: 16, note: "Cụm >= 16 DA" },
    ],
  },

  // ===========================================================================
  // 2. KHỐI DMD (QUẢN LÝ THIẾT KẾ) - M01 -> M03
  // ===========================================================================
  {
    roleCodeOrName: "ROLE_DMD_GD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "0.5",
    note: "GĐ/PGĐ QLTK kiêm nhiệm cụm 1500 - 4500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 1500, maxValue: 4500, note: "1500 - 4500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_GD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "GĐ/PGĐ QLTK chuyên trách dự án > 4500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 4500, note: "> 4500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_TP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "Trưởng phòng QLTK quản lý ý tưởng & điều phối các bộ môn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 13500, note: "<= 13500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_KT",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Chuyên gia QLTK Kiến trúc",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 13500, note: "<= 13500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_KC",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "0.5",
    note: "Chuyên gia QLTK Kết cấu dự án <= 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 1500, note: "<= 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_KC",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Chuyên gia QLTK Kết cấu dự án > 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 1500, note: "> 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_MEP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "0.5",
    note: "Chuyên gia QLTK Cơ điện dự án <= 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 1500, note: "<= 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_MEP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Chuyên gia QLTK Cơ điện dự án > 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 1500, note: "> 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_CQ",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "0.5",
    note: "Chuyên gia QLTK Cảnh quan dự án <= 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 1500, note: "<= 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_CQ",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Chuyên gia QLTK Cảnh quan dự án > 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 1500, note: "> 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_HT",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "0.5",
    note: "Chuyên gia QLTK Hạ tầng dự án <= 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 1500, note: "<= 1500 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_DMD_CG_HT",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M03",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Chuyên gia QLTK Hạ tầng dự án > 1500 căn",
    durationMonths: 12,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 1500, note: "> 1500 căn" },
    ],
  },

  // ===========================================================================
  // 3. KHỐI PMD (ĐIỀU HÀNH DỰ ÁN) - M01 -> M12
  // ===========================================================================
  {
    roleCodeOrName: "ROLE_PMD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "1.0",
    note: "PGĐ Điều hành Dự án phụ trách phân kỳ <= 50ha (hoặc <= 1000 căn)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 50, note: "<= 50ha" },
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 1000, note: "<= 1000 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "0.5",
    headcountMin: "0.2",
    headcountMax: "1.0",
    note: "PGĐ Điều hành Dự án phụ trách quy mô 50 - 100ha (1000-2000 căn)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 50, maxValue: 100, note: "50 - 100ha" },
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 1000, maxValue: 2000, note: "1000 - 2000 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "0.8",
    headcountMin: "0.3",
    headcountMax: "1.0",
    note: "PGĐ Điều hành Dự án phụ trách quy mô 100 - 200ha (2000-4000 căn)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 100, maxValue: 200, note: "100 - 200ha" },
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 2000, maxValue: 4000, note: "2000 - 4000 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_PGD",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "PGĐ Điều hành Dự án chuyên trách quy mô 200 - 300ha (4000-6000 căn)",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 200, maxValue: 300, note: "200 - 300ha" },
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 4000, maxValue: 6000, note: "4000 - 6000 căn" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_TP_PP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "0.5",
    headcountMin: "0.3",
    headcountMax: "1.0",
    note: "Trưởng phòng/Phó phòng QLDA quy mô <= 100ha",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 100, note: "<= 100ha" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_TP_PP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng phòng/Phó phòng QLDA quy mô 100 - 300ha",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 100, maxValue: 300, note: "100 - 300ha" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_CVCC_DP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "CVCC Điều phối Dự án quy mô <= 100ha",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 100, note: "<= 100ha" },
    ],
  },
  {
    roleCodeOrName: "ROLE_PMD_CVCC_DP",
    fromMilestoneCode: "M01",
    toMilestoneCode: "M12",
    headcount: "1.5",
    headcountMin: "1.0",
    headcountMax: "2.0",
    note: "CVCC Điều phối Dự án quy mô 100 - 200ha",
    durationMonths: 12,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 100, maxValue: 200, note: "100 - 200ha" },
    ],
  },

  // ===========================================================================
  // 4. KHỐI PCD (QUẢN LÝ XÂY DỰNG THEO TỪNG GIAI ĐOẠN)
  // ===========================================================================

  // 4A. Giai đoạn San lấp mặt bằng: M01 -> M04 (Chuẩn 4 tháng)
  {
    roleCodeOrName: "20047380", // GD/PGĐ PCD
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "GĐ/PGĐ PCD phụ trách vùng dự án (Giai đoạn San lấp)",
    durationMonths: 4,
  },
  {
    roleCodeOrName: "20047384", // Trưởng bộ phận Quản lý HTKT
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP Quản lý HTKT giai đoạn san lấp mặt bằng",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 50, note: "<= 50ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "KSCC/KS GS HTKT san lấp quy mô <= 15ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 15, note: "<= 15ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.5",
    headcountMin: "1.0",
    headcountMax: "2.0",
    note: "KSCC/KS GS HTKT san lấp quy mô 15 - 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 15, maxValue: 30, note: "15 - 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "2.0",
    headcountMin: "1.5",
    headcountMax: "2.0",
    note: "KSCC/KS GS HTKT san lấp quy mô 30 - 50ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 30, maxValue: 50, note: "30 - 50ha" },
    ],
  },
  {
    roleCodeOrName: "20047389", // KSCC Kiểm soát Chất lượng, tiến độ
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC QC, Planning san lấp mặt bằng <= 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 30, note: "<= 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047389", // KSCC Kiểm soát Chất lượng, tiến độ
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC QC, Planning san lấp mặt bằng > 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: ">", minValue: 30, note: "> 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047391", // KSCC Kiểm soát ATLĐ
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC ATLĐ san lấp mặt bằng <= 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 30, note: "<= 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047391", // KSCC Kiểm soát ATLĐ
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC ATLĐ san lấp mặt bằng > 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: ">", minValue: 30, note: "> 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047390", // KSCC Kiểm soát Trắc đạc
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC Trắc đạc san lấp mặt bằng <= 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 30, note: "<= 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047390", // KSCC Kiểm soát Trắc đạc
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC Trắc đạc san lấp mặt bằng > 30ha",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: ">", minValue: 30, note: "> 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047393", // Thư ký Công trường
    fromMilestoneCode: "M01",
    toMilestoneCode: "M04",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Thư ký công trường giai đoạn san lấp",
    durationMonths: 4,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 50, note: "<= 50ha" },
    ],
  },

  // 4B. Giai đoạn Ép cọc đại trà: M04 -> M06 (Chuẩn 5 tháng)
  {
    roleCodeOrName: "20076715", // Trưởng bộ phận Quản lý Xây dựng
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QLXD kiêm nhiệm giai đoạn ép cọc đại trà",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "<=", maxValue: 3, note: "<= 3 robot" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "1.5",
    headcountMin: "1.0",
    headcountMax: "2.0",
    note: "KSCC/KS Giám sát cọc cho 1 robot ép cọc (định mức 1.5 KS/robot)",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "=", minValue: 1, maxValue: 1, note: "1 Robot ép cọc" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "3.0",
    headcountMin: "2.5",
    headcountMax: "3.5",
    note: "KSCC/KS Giám sát cọc cho 2 robot ép cọc",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "=", minValue: 2, maxValue: 2, note: "2 Robot ép cọc" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "4.5",
    headcountMin: "4.0",
    headcountMax: "5.0",
    note: "KSCC/KS Giám sát cọc cho 3 robot ép cọc",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "=", minValue: 3, maxValue: 3, note: "3 Robot ép cọc" },
    ],
  },
  {
    roleCodeOrName: "20047389", // KSCC QC, Planning
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC QC, Planning giai đoạn ép cọc",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "<=", maxValue: 3, note: "<= 3 robot" },
    ],
  },
  {
    roleCodeOrName: "20047390", // KSCC Trắc đạc
    fromMilestoneCode: "M04",
    toMilestoneCode: "M06",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC Trắc đạc tim cọc",
    durationMonths: 5,
    criteria: [
      { propertyCode: "ROBOT_COUNT", operator: "<=", maxValue: 3, note: "<= 3 robot" },
    ],
  },

  // 4C. Giai đoạn Thi công Hạ tầng kỹ thuật cơ bản: M04 -> M08 (Chuẩn 6-8 tháng)
  {
    roleCodeOrName: "20047384", // Trưởng BP Quản lý HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QL HTKT quy mô <= 15ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 15, note: "<= 15ha" },
    ],
  },
  {
    roleCodeOrName: "20047384", // Trưởng BP Quản lý HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "1.5",
    headcountMin: "1.0",
    headcountMax: "2.0",
    note: "Trưởng BP QL HTKT quy mô 15 - 30ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 15, maxValue: 30, note: "15 - 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047384", // Trưởng BP Quản lý HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "2.0",
    headcountMin: "1.5",
    headcountMax: "2.0",
    note: "Trưởng BP QL HTKT quy mô 30 - 50ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 30, maxValue: 50, note: "30 - 50ha" },
    ],
  },
  {
    roleCodeOrName: "20012148", // Trưởng BP Quản lý Cơ điện
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QL Cơ điện phụ trách hạ tầng MEP",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 50, note: "<= 50ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "2.0",
    headcountMin: "2.0",
    headcountMax: "3.0",
    note: "KSCC/KS Giám sát HTKT đường/cống quy mô <= 15ha (định mức 5-7.5ha/KS)",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 15, note: "<= 15ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "4.0",
    headcountMin: "3.5",
    headcountMax: "4.5",
    note: "KSCC/KS Giám sát HTKT đường/cống quy mô 15 - 30ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 15, maxValue: 30, note: "15 - 30ha" },
    ],
  },
  {
    roleCodeOrName: "20047387", // KSCC/KS Giám sát HTKT
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "6.0",
    headcountMin: "5.0",
    headcountMax: "7.0",
    note: "KSCC/KS Giám sát HTKT đường/cống quy mô 30 - 50ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 30, maxValue: 50, note: "30 - 50ha" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.5",
    note: "KSCC Giám sát Cơ điện hạ tầng <= 15ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "<=", maxValue: 15, note: "<= 15ha" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "2.0",
    headcountMin: "1.5",
    headcountMax: "2.5",
    note: "KSCC Giám sát Cơ điện hạ tầng 15 - 30ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 15, maxValue: 30, note: "15 - 30ha" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M04",
    toMilestoneCode: "M08",
    headcount: "3.0",
    headcountMin: "2.5",
    headcountMax: "3.5",
    note: "KSCC Giám sát Cơ điện hạ tầng 30 - 50ha",
    durationMonths: 6,
    criteria: [
      { propertyCode: "LAND_AREA", operator: "BETWEEN", minValue: 30, maxValue: 50, note: "30 - 50ha" },
    ],
  },

  // 4D. Giai đoạn Thi công Nhà thấp tầng: M06 -> M10 (Chuẩn 7-10 tháng)
  {
    roleCodeOrName: "20076715", // Trưởng BP QLXD
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QLXD phụ trách thi công thân/thô <= 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 200, note: "<= 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20076715", // Trưởng BP QLXD
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.5",
    note: "Trưởng BP QLXD phụ trách thi công thân/thô > 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 200, note: "> 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20012148", // Trưởng BP QL Cơ điện
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QL Cơ điện MEP thấp tầng <= 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 200, note: "<= 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20012148", // Trưởng BP QL Cơ điện
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "Trưởng BP QL Cơ điện MEP thấp tầng > 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 200, note: "> 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "2.5",
    headcountMin: "2.0",
    headcountMax: "3.0",
    note: "KSCC/KS Giám sát XD nhà thô < 100 căn villa",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<", maxValue: 100, note: "< 100 căn" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "5.0",
    headcountMin: "4.0",
    headcountMax: "6.0",
    note: "KSCC/KS Giám sát XD nhà thô 100 - 200 căn villa",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 100, maxValue: 200, note: "100 - 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047138", // KSCC/KS Giám sát Xây dựng
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "8.0",
    headcountMin: "7.0",
    headcountMax: "9.0",
    note: "KSCC/KS Giám sát XD nhà thô 200 - 300 căn villa",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 200, maxValue: 300, note: "200 - 300 căn" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "1.0",
    headcountMax: "1.0",
    note: "KSCC Giám sát Cơ điện nhà thô < 100 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<", maxValue: 100, note: "< 100 căn" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "2.0",
    headcountMin: "1.5",
    headcountMax: "2.5",
    note: "KSCC Giám sát Cơ điện nhà thô 100 - 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 100, maxValue: 200, note: "100 - 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20046801", // KSCC/KS Giám sát Cơ điện
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "3.0",
    headcountMin: "2.5",
    headcountMax: "3.5",
    note: "KSCC Giám sát Cơ điện nhà thô 200 - 300 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "BETWEEN", minValue: 200, maxValue: 300, note: "200 - 300 căn" },
    ],
  },
  {
    roleCodeOrName: "20047389", // KSCC QC, Planning
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC QC, Planning thi công nhà thô <= 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 200, note: "<= 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047389", // KSCC QC, Planning
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC QC, Planning thi công nhà thô > 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 200, note: "> 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047391", // KSCC ATLĐ
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC ATLĐ thi công nhà thô <= 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 200, note: "<= 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047391", // KSCC ATLĐ
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC ATLĐ thi công nhà thô > 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 200, note: "> 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047390", // KSCC Trắc đạc
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "0.5",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC Trắc đạc trục nhà thô <= 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: "<=", maxValue: 200, note: "<= 200 căn" },
    ],
  },
  {
    roleCodeOrName: "20047390", // KSCC Trắc đạc
    fromMilestoneCode: "M06",
    toMilestoneCode: "M10",
    headcount: "1.0",
    headcountMin: "0.5",
    headcountMax: "1.0",
    note: "KSCC Trắc đạc trục nhà thô > 200 căn",
    durationMonths: 7,
    criteria: [
      { propertyCode: "SCALE_LOW_RISE", operator: ">", minValue: 200, note: "> 200 căn" },
    ],
  },
]

async function seedStandards() {
  console.log("================================================================================")
  console.log("BẮT ĐẦU SEED DỮ LIỆU ĐỊNH BIÊN CHUẨN (HEADCOUNT STANDARDS) TỪ 2 FILE EXCEL")
  console.log("================================================================================")

  // 1. Fetch reference maps
  const dbRoles = await db.select().from(roles)
  const dbMilestones = await db.select().from(milestones)
  const dbProperties = await db.select().from(properties)

  console.log(`Tìm thấy: ${dbRoles.length} Roles, ${dbMilestones.length} Milestones, ${dbProperties.length} Properties`)

  // Create helper lookup maps
  const roleMap = new Map<string, number>()
  for (const r of dbRoles) {
    if (r.code) roleMap.set(r.code.trim().toUpperCase(), r.id)
    roleMap.set(r.name.trim().toLowerCase(), r.id)
  }

  const milestoneMap = new Map<string, number>()
  for (const m of dbMilestones) {
    milestoneMap.set(m.code.trim().toUpperCase(), m.id)
  }

  const propertyMap = new Map<string, number>()
  for (const p of dbProperties) {
    propertyMap.set(p.code.trim().toUpperCase(), p.id)
  }

  let createdStandardsCount = 0
  let createdCriteriaCount = 0
  let createdMonthlyFactorsCount = 0

  for (const item of seedData) {
    // Resolve Role ID
    let roleId = roleMap.get(item.roleCodeOrName.trim().toUpperCase())
    if (!roleId) {
      roleId = roleMap.get(item.roleCodeOrName.trim().toLowerCase())
    }
    if (!roleId) {
      console.warn(`[CẢNH BÁO] Không tìm thấy Role: ${item.roleCodeOrName}`)
      continue
    }

    // Resolve Milestones
    const targetMilestoneCode = item.toMilestoneCode || item.fromMilestoneCode
    const milestoneId = milestoneMap.get(targetMilestoneCode.trim().toUpperCase())
    if (!milestoneId) {
      console.warn(`[CẢNH BÁO] Không tìm thấy Milestone: ${targetMilestoneCode}`)
      continue
    }

    // Determine monthly curve
    const duration = item.durationMonths || 12
    const factors = item.monthlyFactors || defaultMonthlyCurves[duration] || Array(duration).fill(1.0)

    // Execute in transaction
    await db.transaction(async (tx) => {
      // Insert standard
      const [newStandard] = await tx
        .insert(headcountStandards)
        .values({
          roleId,
          milestoneId,
          headcount: item.headcount,
          headcountMin: item.headcountMin || null,
          headcountMax: item.headcountMax || null,
          note: item.note || null,
          durationMonths: duration,
          monthlyFactors: factors,
        })
        .returning()

      createdStandardsCount++

      // Insert Criteria
      if (item.criteria && item.criteria.length > 0) {
        for (const c of item.criteria) {
          const propId = propertyMap.get(c.propertyCode.trim().toUpperCase())
          if (!propId) {
            console.warn(`  [CẢNH BÁO] Không tìm thấy Property: ${c.propertyCode}`)
            continue
          }

          await tx.insert(headcountCriteria).values({
            standardId: newStandard.id,
            propertyId: propId,
            conditionOperator: c.operator,
            minValue: c.minValue !== undefined ? String(c.minValue) : null,
            maxValue: c.maxValue !== undefined ? String(c.maxValue) : null,
            note: c.note || null,
          })
          createdCriteriaCount++
        }
      }

      // Insert child table monthly factors (for dual persistence compatibility)
      for (let m = 1; m <= duration; m++) {
        const factorVal = factors[m - 1] !== undefined ? factors[m - 1] : 1.0
        await tx.insert(headcountMonthlyFactors).values({
          standardId: newStandard.id,
          durationMonths: duration,
          monthNo: m,
          factor: String(factorVal),
        })
        createdMonthlyFactorsCount++
      }
    })
  }

  console.log("\n================================================================================")
  console.log(`HOÀN TẤT SEED DỮ LIỆU LÊN SUPABASE:`)
  console.log(`- Đã tạo ${createdStandardsCount} bản ghi [headcount_standards]`)
  console.log(`- Đã tạo ${createdCriteriaCount} bản ghi [headcount_criteria]`)
  console.log(`- Đã tạo ${createdMonthlyFactorsCount} bản ghi [headcount_monthly_factors]`)
  console.log("================================================================================")

  process.exit(0)
}

seedStandards().catch((e) => {
  console.error("Lỗi khi seed:", e)
  process.exit(1)
})
