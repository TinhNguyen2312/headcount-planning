import * as dotenv from "dotenv";
dotenv.config();

import { eq, sql } from "drizzle-orm";
import { db, departments, roles } from "../db";

async function main() {
  console.log("=".repeat(65));
  console.log("  Re-aligning Departments & Roles exactly according to PDF  ");
  console.log("=".repeat(65));

  // =========================================================================
  // 1. ALL DEPARTMENTS FROM PDF
  // =========================================================================
  const deptDefs = [
    // HỆ THỐNG
    {
      code: "HDQT",
      name: "Hội đồng Quản trị",
      type: "Hội đồng",
      level: 1,
      parentCode: null as string | null,
      description: "Hệ thống - Hội đồng Quản trị",
    },
    // TỔNG CÔNG TY
    {
      code: "BTGD",
      name: "Ban Tổng Giám đốc",
      type: "Ban",
      level: 2,
      parentCode: "HDQT",
      description: "Tổng Công ty - Ban Tổng Giám đốc",
    },
    // ĐƠN VỊ CƠ SỞ / CỤM DỰ ÁN
    {
      code: "GMD",
      name: "Ban Điều hành Dự án Khu vực",
      type: "Ban",
      level: 3,
      parentCode: "BTGD",
      description: "BAN ĐIỀU HÀNH DỰ ÁN KHU VỰC [TÊN KHU VỰC] (GMD.[…]-NVLG)",
    },
    {
      code: "DA",
      name: "Ban Điều hành Cụm Dự án",
      type: "Ban",
      level: 4,
      parentCode: "GMD",
      description: "BAN ĐIỀU HÀNH DỰ ÁN KHU VỰC [TÊN CỤM DỰ ÁN] – DỰ ÁN [TÊN DỰ ÁN]",
    },

    // 5 Phòng Ban chính thuộc Dự án (Level 5 under DA)
    {
      code: "PLP",
      name: "Phòng Thủ tục Pháp lý Dự án",
      type: "Phòng",
      level: 5,
      parentCode: "DA",
      description: "PHÒNG THỦ TỤC PHÁP LÝ DỰ ÁN (PLP-[…])",
    },
    {
      code: "DMD",
      name: "Phòng Quản lý Thiết kế",
      type: "Phòng",
      level: 5,
      parentCode: "DA",
      description: "PHÒNG QUẢN LÝ THIẾT KẾ (DMD-[…])",
    },
    {
      code: "PMD",
      name: "Phòng Điều hành Dự án",
      type: "Phòng",
      level: 5,
      parentCode: "DA",
      description: "[TÊN DỰ ÁN] PHÒNG ĐIỀU HÀNH DỰ ÁN (PMD-[…])",
    },
    {
      code: "PCD",
      name: "Phòng Quản lý Xây dựng, An toàn và Môi trường",
      type: "Phòng",
      level: 5,
      parentCode: "DA",
      description: "PHÒNG QUẢN LÝ XÂY DỰNG AN TOÀN VÀ MÔI TRƯỜNG (PCD-[…])",
    },
    {
      code: "PM_VH",
      name: "Phòng Quản lý Vận hành Dự án",
      type: "Phòng",
      level: 5,
      parentCode: "DA",
      description: "PHÒNG QUẢN LÝ VẬN HÀNH DỰ ÁN (PM-[…])",
    },

    // Các đơn vị trực thuộc PCD (Level 6 under PCD)
    {
      code: "PCD_XD",
      name: "Bộ phận Xây dựng",
      type: "Bộ phận",
      level: 6,
      parentCode: "PCD",
      description: "BỘ PHẬN XÂY DỰNG",
    },
    {
      code: "PCD_MEP",
      name: "Bộ phận Cơ điện",
      type: "Bộ phận",
      level: 6,
      parentCode: "PCD",
      description: "BỘ PHẬN CƠ ĐIỆN",
    },
    {
      code: "PCD_HTKT",
      name: "Bộ phận Hạ tầng Kỹ thuật",
      type: "Bộ phận",
      level: 6,
      parentCode: "PCD",
      description: "BỘ PHẬN HẠ TẦNG KỸ THUẬT",
    },
    {
      code: "PCD_HT",
      name: "Nhóm Hỗ trợ",
      type: "Nhóm",
      level: 6,
      parentCode: "PCD",
      description: "NHÓM HỖ TRỢ (PCD)",
    },

    // 4 Bộ phận trực thuộc Phòng Quản lý Vận hành Dự án (Level 6 under PM_VH)
    {
      code: "BP_BGCU",
      name: "Bộ phận Bàn giao và Cung ứng",
      type: "Bộ phận",
      level: 6,
      parentCode: "PM_VH",
      description: "BP BÀN GIAO VÀ CUNG ỨNG",
    },
    {
      code: "BP_VHKT",
      name: "Bộ phận Vận hành và Khai thác",
      type: "Bộ phận",
      level: 6,
      parentCode: "PM_VH",
      description: "BP VẬN HÀNH VÀ KHAI THÁC",
    },
    {
      code: "BP_BH",
      name: "Bộ phận Bảo hành",
      type: "Bộ phận",
      level: 6,
      parentCode: "PM_VH",
      description: "BP BẢO HÀNH",
    },
    {
      code: "BP_NSHC",
      name: "Bộ phận Ngân sách và Hành chính",
      type: "Bộ phận",
      level: 6,
      parentCode: "PM_VH",
      description: "BP NGÂN SÁCH VÀ HÀNH CHÍNH",
    },

    // Các Nhóm trực thuộc các Bộ phận trên (Level 7)
    {
      code: "NHOM_BGCU",
      name: "Nhóm Bàn giao và Cung ứng",
      type: "Nhóm",
      level: 7,
      parentCode: "BP_BGCU",
      description: "NHÓM BÀN GIAO VÀ CUNG ỨNG",
    },
    {
      code: "NHOM_VHKT",
      name: "Nhóm Vận hành và Khai thác",
      type: "Nhóm",
      level: 7,
      parentCode: "BP_VHKT",
      description: "NHÓM VẬN HÀNH VÀ KHAI THÁC",
    },
    {
      code: "NHOM_BH_XD",
      name: "Nhóm Bảo hành Xây dựng",
      type: "Nhóm",
      level: 7,
      parentCode: "BP_BH",
      description: "NHÓM BẢO HÀNH XÂY DỰNG",
    },
    {
      code: "NHOM_BH_MEP",
      name: "Nhóm Bảo hành Cơ điện",
      type: "Nhóm",
      level: 7,
      parentCode: "BP_BH",
      description: "NHÓM BẢO HÀNH CƠ ĐIỆN",
    },
    {
      code: "NHOM_NSHC",
      name: "Nhóm Ngân sách và Hành chính",
      type: "Nhóm",
      level: 7,
      parentCode: "BP_NSHC",
      description: "NHÓM NGÂN SÁCH VÀ HÀNH CHÍNH",
    },
  ];

  // Map dept code -> id in DB
  const deptCodeToId = new Map<string, number>();

  const allExistingDepts = await db.select().from(departments);
  for (const d of allExistingDepts) {
    deptCodeToId.set(d.code, d.id);
  }

  // If OM exists as code, map PM_VH to it or ensure PM_VH
  if (deptCodeToId.has("OM") && !deptCodeToId.has("PM_VH")) {
    const omId = deptCodeToId.get("OM")!;
    await db
      .update(departments)
      .set({
        code: "PM_VH",
        name: "Phòng Quản lý Vận hành Dự án",
        type: "Phòng",
        level: 5,
        description: "PHÒNG QUẢN LÝ VẬN HÀNH DỰ ÁN (PM-[…])",
      })
      .where(eq(departments.id, omId));
    deptCodeToId.delete("OM");
    deptCodeToId.set("PM_VH", omId);
    console.log(`[+] Mapped department 'OM' (id=${omId}) -> 'PM_VH'`);
  }

  // Upsert departments in topological order
  for (const def of deptDefs) {
    const parentId = def.parentCode ? deptCodeToId.get(def.parentCode) ?? null : null;
    const existingId = deptCodeToId.get(def.code);

    if (existingId) {
      await db
        .update(departments)
        .set({
          name: def.name,
          type: def.type,
          level: def.level,
          parentId: parentId,
          status: "ACTIVE",
          description: def.description,
          updatedAt: sql`NOW()`,
        })
        .where(eq(departments.id, existingId));
      console.log(`  [Dept Updated] [${def.code}] ${def.name} (id=${existingId}, parentId=${parentId})`);
    } else {
      const [inserted] = await db
        .insert(departments)
        .values({
          code: def.code,
          name: def.name,
          type: def.type,
          level: def.level,
          parentId: parentId,
          status: "ACTIVE",
          description: def.description,
        })
        .returning({ id: departments.id });
      deptCodeToId.set(def.code, inserted.id);
      console.log(`  [Dept Inserted] [${def.code}] ${def.name} (id=${inserted.id}, parentId=${parentId})`);
    }
  }

  // Second pass for departments: ensure all parentId links are accurate
  for (const def of deptDefs) {
    if (def.parentCode) {
      const parentId = deptCodeToId.get(def.parentCode)!;
      const selfId = deptCodeToId.get(def.code)!;
      await db.update(departments).set({ parentId }).where(eq(departments.id, selfId));
    }
  }
  console.log(`\n[+] Successfully aligned ${deptDefs.length} departments!\n`);

  // =========================================================================
  // 2. ALL ROLES DEFINITION (56 ROLES)
  // =========================================================================
  interface RoleDef {
    code: string;
    shortCode: string;
    name: string;
    level: number;
    deptCode: string;
    parentRoleCode: string | null;
    planningMethod: "BY_SECTOR" | "BY_REGION" | "BY_PROJECT";
    description?: string;
  }

  const roleDefs: RoleDef[] = [
    // A. HỘI ĐỒNG QUẢN TRỊ (HDQT)
    {
      code: "ROLE_PCT_HDQT",
      shortCode: "PCT HĐQT",
      name: "Phó Chủ tịch HĐQT",
      level: 1,
      deptCode: "HDQT",
      parentRoleCode: null,
      planningMethod: "BY_SECTOR",
      description: "Phó Chủ tịch Hội đồng Quản trị",
    },

    // B. BAN TỔNG GIÁM ĐỐC (BTGD)
    {
      code: "ROLE_TGD",
      shortCode: "TGD",
      name: "Tổng Giám đốc",
      level: 2,
      deptCode: "BTGD",
      parentRoleCode: "ROLE_PCT_HDQT",
      planningMethod: "BY_SECTOR",
      description: "Tổng Giám đốc",
    },
    {
      code: "ROLE_PTGD_TCKTDT",
      shortCode: "PTGD TCKTĐT",
      name: "Phó TGĐ Tài chính – Kế toán - Đầu tư",
      level: 2,
      deptCode: "BTGD",
      parentRoleCode: "ROLE_PCT_HDQT",
      planningMethod: "BY_SECTOR",
      description: "Phó TGĐ Tài chính – Kế toán - Đầu tư",
    },
    {
      code: "ROLE_PTGD_DHDA",
      shortCode: "PTGD ĐHDA",
      name: "Phó TGĐ Điều hành Dự án",
      level: 2,
      deptCode: "BTGD",
      parentRoleCode: "ROLE_PCT_HDQT",
      planningMethod: "BY_SECTOR",
      description: "Phó TGĐ Điều hành Dự án",
    },
    {
      code: "ROLE_PTGD_KDMKT",
      shortCode: "PTGD KD-MKT",
      name: "Phó TGĐ Kinh doanh – Marketing",
      level: 2,
      deptCode: "BTGD",
      parentRoleCode: "ROLE_PCT_HDQT",
      planningMethod: "BY_SECTOR",
      description: "Phó TGĐ Kinh doanh – Marketing",
    },
    {
      code: "ROLE_PTGD_QTHT",
      shortCode: "PTGD QTHT",
      name: "Phó TGĐ Quản trị Hệ thống",
      level: 2,
      deptCode: "BTGD",
      parentRoleCode: "ROLE_PCT_HDQT",
      planningMethod: "BY_SECTOR",
      description: "Phó TGĐ Quản trị Hệ thống",
    },

    // C. BAN ĐIỀU HÀNH DỰ ÁN KHU VỰC (GMD)
    {
      code: "ROLE_GMD_GD_PGD",
      shortCode: "GĐ/PGĐ BĐHDA",
      name: "GĐ/PGĐ Ban Điều hành Dự án",
      level: 3,
      deptCode: "GMD",
      parentRoleCode: "ROLE_PTGD_DHDA",
      planningMethod: "BY_REGION",
      description: "GĐ/PGĐ Điều hành Dự án (GM): quản lý 9-4",
    },

    // D1. PHÒNG THỦ TỤC PHÁP LÝ DỰ ÁN (PLP)
    {
      code: "ROLE_PLP_GD_PGD",
      shortCode: "GĐ/PGĐ TTPL",
      name: "GĐ/PGĐ Phòng Thủ tục Pháp lý Dự án",
      level: 4,
      deptCode: "PLP",
      parentRoleCode: "ROLE_GMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_PLP_TP",
      shortCode: "TP TTPL",
      name: "Trưởng phòng Thủ tục Pháp lý Dự án",
      level: 5,
      deptCode: "PLP",
      parentRoleCode: "ROLE_PLP_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_PLP_CG",
      shortCode: "CG TTPL",
      name: "Chuyên gia Thủ tục Pháp lý Dự án",
      level: 6,
      deptCode: "PLP",
      parentRoleCode: "ROLE_PLP_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_PLP_CVCC",
      shortCode: "CVCC TTPL",
      name: "Chuyên viên cao cấp Thủ tục Pháp lý Dự án",
      level: 6,
      deptCode: "PLP",
      parentRoleCode: "ROLE_PLP_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_PLP_CV",
      shortCode: "CV TTPL",
      name: "Chuyên viên Thủ tục Pháp lý Dự án",
      level: 6,
      deptCode: "PLP",
      parentRoleCode: "ROLE_PLP_TP",
      planningMethod: "BY_PROJECT",
    },

    // D2. PHÒNG QUẢN LÝ THIẾT KẾ (DMD)
    {
      code: "ROLE_DMD_GD_PGD",
      shortCode: "GĐ/PGĐ QLTK",
      name: "GĐ/PGĐ Phòng Quản lý Thiết kế",
      level: 4,
      deptCode: "DMD",
      parentRoleCode: "ROLE_GMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_TP",
      shortCode: "TP QLTK",
      name: "Trưởng phòng Quản lý Thiết kế",
      level: 5,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_MEP",
      shortCode: "CG QLTK CĐ",
      name: "Chuyên gia QLTK Cơ điện",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_KT",
      shortCode: "CG QLTK KT",
      name: "Chuyên gia QLTK Kiến trúc",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_NT",
      shortCode: "CG QLTK NT",
      name: "Chuyên gia QLTK Nội thất",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_KC",
      shortCode: "CG QLTK KC",
      name: "Chuyên gia QLTK Kết cấu",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_HT",
      shortCode: "CG QLTK HT",
      name: "Chuyên gia QLTK Hạ tầng",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_DMD_CG_CQ",
      shortCode: "CG QLTK CQ",
      name: "Chuyên gia QLTK Cảnh Quan",
      level: 6,
      deptCode: "DMD",
      parentRoleCode: "ROLE_DMD_TP",
      planningMethod: "BY_PROJECT",
    },

    // D3. [TÊN DỰ ÁN] PHÒNG ĐIỀU HÀNH DỰ ÁN (PMD)
    {
      code: "ROLE_PMD_PGD",
      shortCode: "PGĐ PĐHDA",
      name: "PGĐ Phòng Điều hành Dự án",
      level: 4,
      deptCode: "PMD",
      parentRoleCode: "ROLE_GMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_PMD_TP_PP",
      shortCode: "TP/PP QLDA",
      name: "Trưởng phòng/Phó phòng Quản lý Dự án",
      level: 5,
      deptCode: "PMD",
      parentRoleCode: "ROLE_PMD_PGD",
      planningMethod: "BY_PROJECT",
      description: "TP Quản lý Dự án / CG Quản lý Dự án / CVCC Giám sát Dự án: điều phối 4",
    },
    {
      code: "ROLE_PMD_CVCC_DP",
      shortCode: "CVCC ĐPDA",
      name: "CVCC Điều phối Dự án",
      level: 6,
      deptCode: "PMD",
      parentRoleCode: "ROLE_PMD_TP_PP",
      planningMethod: "BY_PROJECT",
    },

    // D4. PHÒNG QUẢN LÝ XÂY DỰNG, AN TOÀN VÀ MÔI TRƯỜNG (PCD)
    {
      code: "20047380",
      shortCode: "GĐ/PGĐ QLXD,AT&MT",
      name: "GD/PGĐ Phòng Quản lý Xây dựng, An toàn và Môi trường",
      level: 4,
      deptCode: "PCD",
      parentRoleCode: "ROLE_GMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20015457",
      shortCode: "TP QLXD,AT&MT",
      name: "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường",
      level: 5,
      deptCode: "PCD",
      parentRoleCode: "20047380",
      planningMethod: "BY_PROJECT",
    },
    // Bộ phận Xây dựng (PCD_XD)
    {
      code: "20076715",
      shortCode: "TBP QLXD",
      name: "Trưởng bộ phận Quản lý Xây dựng",
      level: 6,
      deptCode: "PCD_XD",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20047138",
      shortCode: "KSCC GSXD",
      name: "KSCC/KS Giám sát Xây dựng",
      level: 7,
      deptCode: "PCD_XD",
      parentRoleCode: "20076715",
      planningMethod: "BY_PROJECT",
    },
    // Bộ phận Cơ điện (PCD_MEP)
    {
      code: "20012148",
      shortCode: "TBP QLMEP",
      name: "Trưởng bộ phận Quản lý Cơ điện",
      level: 6,
      deptCode: "PCD_MEP",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20046801",
      shortCode: "KSCC GSMEP",
      name: "KSCC/KS Giám sát Cơ điện",
      level: 7,
      deptCode: "PCD_MEP",
      parentRoleCode: "20012148",
      planningMethod: "BY_PROJECT",
    },
    // Bộ phận Hạ tầng Kỹ thuật (PCD_HTKT)
    {
      code: "20047384",
      shortCode: "TBP QLHTKT",
      name: "Trưởng bộ phận Quản lý Hạ tầng Kỹ thuật",
      level: 6,
      deptCode: "PCD_HTKT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20047387",
      shortCode: "KSCC GSHTKT",
      name: "KSCC/KS Giám sát Hạ tầng Kỹ thuật",
      level: 7,
      deptCode: "PCD_HTKT",
      parentRoleCode: "20047384",
      planningMethod: "BY_PROJECT",
    },
    // Nhóm Hỗ trợ (PCD_HT)
    {
      code: "20047388",
      shortCode: "KTSCC CT",
      name: "KTS cao cấp công trường",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
      description: "Áp dụng đối với dự án Hotel, Resort nghỉ dưỡng",
    },
    {
      code: "20047389",
      shortCode: "KSCC KSCL&TĐ",
      name: "KSCC Kiểm soát Chất lượng, tiến độ",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20047390",
      shortCode: "KSCC KSTĐ",
      name: "KSCC Kiểm soát Trắc đạc",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20047391",
      shortCode: "KSCC KSATLĐ",
      name: "KSCC Kiểm soát ATLĐ",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "20047392",
      shortCode: "KSCC KS CX",
      name: "KSCC Kiểm soát cây xanh",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
      description: "Áp dụng đối với các dự án có quản lý vườn ươm",
    },
    {
      code: "20047393",
      shortCode: "TKCT",
      name: "Thư ký Công trường",
      level: 6,
      deptCode: "PCD_HT",
      parentRoleCode: "20015457",
      planningMethod: "BY_PROJECT",
    },

    // D5. PHÒNG QUẢN LÝ VẬN HÀNH DỰ ÁN (PM_VH)
    {
      code: "ROLE_PMVH_GD_PGD",
      shortCode: "GĐ/PGĐ QLVH",
      name: "GĐ/PGĐ Phòng Quản lý Vận hành Dự án",
      level: 4,
      deptCode: "PM_VH",
      parentRoleCode: "ROLE_GMD_GD_PGD",
      planningMethod: "BY_PROJECT",
    },

    // D5.1. BP BÀN GIAO VÀ CUNG ỨNG (BP_BGCU)
    {
      code: "ROLE_BGCU_PGD_TBP",
      shortCode: "PGĐ/TBP BGCU",
      name: "PGĐ/Trưởng bộ phận Bàn giao và Cung ứng",
      level: 5,
      deptCode: "BP_BGCU",
      parentRoleCode: "ROLE_PMVH_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BGCU_TN",
      shortCode: "TN BGCU",
      name: "Trưởng nhóm Bàn giao và Cung ứng",
      level: 6,
      deptCode: "NHOM_BGCU",
      parentRoleCode: "ROLE_BGCU_PGD_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BGCU_CV_BG",
      shortCode: "CVCC/CV BG",
      name: "CVCC/CV Bàn giao",
      level: 7,
      deptCode: "NHOM_BGCU",
      parentRoleCode: "ROLE_BGCU_TN",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BGCU_CV_CU",
      shortCode: "CVCC/CV CU",
      name: "CVCC/CV Cung ứng",
      level: 7,
      deptCode: "NHOM_BGCU",
      parentRoleCode: "ROLE_BGCU_TN",
      planningMethod: "BY_PROJECT",
    },

    // D5.2. BP VẬN HÀNH VÀ KHAI THÁC (BP_VHKT)
    {
      code: "ROLE_VHKT_PGD_TBP",
      shortCode: "PGĐ/TBP VHKT",
      name: "PGĐ/Trưởng bộ phận Vận hành và Khai thác",
      level: 5,
      deptCode: "BP_VHKT",
      parentRoleCode: "ROLE_PMVH_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_VHKT_TN",
      shortCode: "TN VHKT",
      name: "Trưởng nhóm Vận hành và Khai thác",
      level: 6,
      deptCode: "NHOM_VHKT",
      parentRoleCode: "ROLE_VHKT_PGD_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_VHKT_CV",
      shortCode: "CVCC/CV VHKT",
      name: "CVCC/CV Vận hành và Khai thác",
      level: 7,
      deptCode: "NHOM_VHKT",
      parentRoleCode: "ROLE_VHKT_TN",
      planningMethod: "BY_PROJECT",
    },

    // D5.3. BP BẢO HÀNH (BP_BH)
    {
      code: "ROLE_BH_PGD_TBP",
      shortCode: "PGĐ/TBP BH",
      name: "PGĐ/Trưởng bộ phận Bảo hành",
      level: 5,
      deptCode: "BP_BH",
      parentRoleCode: "ROLE_PMVH_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BH_TN_XD",
      shortCode: "TN BH XD",
      name: "Trưởng nhóm Bảo hành Xây dựng",
      level: 6,
      deptCode: "NHOM_BH_XD",
      parentRoleCode: "ROLE_BH_PGD_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BH_KS_XD",
      shortCode: "KSCC/KS BH XD",
      name: "KSCC/KS Bảo hành Xây dựng",
      level: 7,
      deptCode: "NHOM_BH_XD",
      parentRoleCode: "ROLE_BH_TN_XD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BH_NV_SC",
      shortCode: "NV SCBH",
      name: "NV Sửa chữa Bảo hành",
      level: 7,
      deptCode: "NHOM_BH_XD",
      parentRoleCode: "ROLE_BH_TN_XD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BH_TN_MEP",
      shortCode: "TN BH CĐ",
      name: "Trưởng nhóm Bảo hành Cơ điện",
      level: 6,
      deptCode: "NHOM_BH_MEP",
      parentRoleCode: "ROLE_BH_PGD_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_BH_KS_MEP",
      shortCode: "KSCC/KS BH CĐ",
      name: "KSCC/KS Bảo hành Cơ điện",
      level: 7,
      deptCode: "NHOM_BH_MEP",
      parentRoleCode: "ROLE_BH_TN_MEP",
      planningMethod: "BY_PROJECT",
    },

    // D5.4. BP NGÂN SÁCH VÀ HÀNH CHÍNH (BP_NSHC)
    {
      code: "ROLE_NSHC_TBP",
      shortCode: "TBP NSHC",
      name: "Trưởng bộ phận Ngân sách và Hành chính",
      level: 5,
      deptCode: "BP_NSHC",
      parentRoleCode: "ROLE_PMVH_GD_PGD",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_NSHC_TN",
      shortCode: "TN NSHC",
      name: "Trưởng nhóm Ngân sách và Hành chính",
      level: 6,
      deptCode: "NHOM_NSHC",
      parentRoleCode: "ROLE_NSHC_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_NSHC_CV",
      shortCode: "CV NSHC",
      name: "CV Ngân sách và Hành chính",
      level: 7,
      deptCode: "NHOM_NSHC",
      parentRoleCode: "ROLE_NSHC_TN",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_NSHC_TKTH",
      shortCode: "TKTH",
      name: "Thư ký Tổng hợp",
      level: 6,
      deptCode: "BP_NSHC",
      parentRoleCode: "ROLE_NSHC_TBP",
      planningMethod: "BY_PROJECT",
    },
    {
      code: "ROLE_NSHC_TKHC",
      shortCode: "TKHC",
      name: "Thư ký Hành chính",
      level: 6,
      deptCode: "BP_NSHC",
      parentRoleCode: "ROLE_NSHC_TBP",
      planningMethod: "BY_PROJECT",
    },
  ];

  // Map role code -> id in DB
  const roleCodeToId = new Map<string, number>();

  const allExistingRoles = await db.select().from(roles);
  for (const r of allExistingRoles) {
    if (r.code) {
      roleCodeToId.set(r.code, r.id);
    }
  }

  // Upsert roles
  for (const r of roleDefs) {
    const deptId = deptCodeToId.get(r.deptCode);
    if (!deptId) {
      throw new Error(`Dept code ${r.deptCode} not found in DB!`);
    }

    const parentRoleId = r.parentRoleCode ? roleCodeToId.get(r.parentRoleCode) ?? null : null;
    const existingId = roleCodeToId.get(r.code);

    if (existingId) {
      await db
        .update(roles)
        .set({
          name: r.name,
          shortCode: r.shortCode,
          level: r.level,
          departmentId: deptId,
          parentRoleId: parentRoleId,
          planningMethod: r.planningMethod,
          description: r.description ?? null,
        })
        .where(eq(roles.id, existingId));
      console.log(`  [Role Updated] [${r.code}] ${r.name} (id=${existingId}, deptId=${deptId}, parentRoleId=${parentRoleId})`);
    } else {
      const [inserted] = await db
        .insert(roles)
        .values({
          code: r.code,
          shortCode: r.shortCode,
          name: r.name,
          level: r.level,
          departmentId: deptId,
          parentRoleId: parentRoleId,
          planningMethod: r.planningMethod,
          description: r.description ?? null,
        })
        .returning({ id: roles.id });
      roleCodeToId.set(r.code, inserted.id);
      console.log(`  [Role Inserted] [${r.code}] ${r.name} (id=${inserted.id}, deptId=${deptId}, parentRoleId=${parentRoleId})`);
    }
  }

  // Second pass for roles: ensure all parentRoleIds and departmentIds are exact
  for (const r of roleDefs) {
    const selfId = roleCodeToId.get(r.code)!;
    const deptId = deptCodeToId.get(r.deptCode)!;
    const parentRoleId = r.parentRoleCode ? roleCodeToId.get(r.parentRoleCode)! : null;

    await db
      .update(roles)
      .set({
        parentRoleId: parentRoleId,
        departmentId: deptId,
        level: r.level,
      })
      .where(eq(roles.id, selfId));
  }

  console.log(`\n[+] Successfully aligned all ${roleDefs.length} roles!\n`);

  // Verification
  console.log("=".repeat(65));
  console.log("  Verifying Complete Tree  ");
  console.log("=".repeat(65));

  const allDeptsNow = await db.select().from(departments);
  const allRolesNow = await db.select().from(roles);

  console.log(`Total departments in DB: ${allDeptsNow.length}`);
  console.log(`Total roles in DB: ${allRolesNow.length}`);

  let brokenRoleDepts = 0;
  for (const r of allRolesNow) {
    if (r.departmentId && !allDeptsNow.some((d) => d.id === r.departmentId)) {
      console.error(`  [ERROR] Role id=${r.id} has invalid deptId=${r.departmentId}`);
      brokenRoleDepts++;
    }
  }
  if (brokenRoleDepts === 0) {
    console.log("[✓] 100% of roles have VALID department references!");
  }

  let brokenRoleParents = 0;
  for (const r of allRolesNow) {
    if (r.parentRoleId && !allRolesNow.some((p) => p.id === r.parentRoleId)) {
      console.error(`  [ERROR] Role id=${r.id} has invalid parentRoleId=${r.parentRoleId}`);
      brokenRoleParents++;
    }
  }
  if (brokenRoleParents === 0) {
    console.log("[✓] 100% of roles have VALID parent role references!");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Error aligning org chart:", err);
  process.exit(1);
});
