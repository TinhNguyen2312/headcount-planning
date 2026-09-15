import { and, eq, inArray, sql } from "drizzle-orm"
import {
  db,
  departments,
  projects,
  regions,
  roles,
  sectors,
  userProjects,
  users,
} from "../src/db"
import { validateUserProjectAssignment } from "../src/lib/userProjectHelpers"

// Họ và tên đệm tiếng Việt phổ biến
const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
const DEM = ["Văn", "Thị", "Minh", "Đức", "Quốc", "Hữu", "Thanh", "Ngọc", "Gia", "Xuân", "Quang", "Đình", "Hải", "Tuấn", "Kim"]
const TEN = ["Hùng", "Trí", "Cường", "Mai", "Anh", "Bảo", "Thu", "Huy", "Tuấn", "Hương", "Nghĩa", "Nam", "Kiệt", "Ngân", "Thành", "Phùng", "Thưởng", "Đăng", "Tâm", "Hiếu", "Thắng", "Quân", "An", "Thể", "Thảo", "Dũng", "Sơn", "Tùng", "Long", "Giang", "Khoa", "Phong"]

function generatePersonnelList(count: number) {
  const list: { fullName: string; email: string; perNumber: string }[] = []
  let seedNum = 1001

  for (let i = 0; i < count; i++) {
    const h = HO[i % HO.length]
    const d = DEM[(i * 3) % DEM.length]
    const t = TEN[(i * 7) % TEN.length]
    const fullName = `${h} ${d} ${t}`
    const perNumber = `NV${seedNum + i}`
    const emailPrefix = `${t.toLowerCase()}.${h.toLowerCase()}${seedNum + i}`
    const email = `${emailPrefix}@novagroup.vn`
    list.push({ fullName, email, perNumber })
  }
  return list
}

async function seed() {
  console.log("=== BẮT ĐẦU SEED NHÂN SỰ DỰ ÁN (~30 NHÂN SỰ / DỰ ÁN) ===")

  // 1. Xác định 3 dự án mục tiêu (Bắt buộc có Aqua 112Ha)
  const targetProjects = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      regionId: projects.regionId,
      regionName: regions.name,
      sectorId: regions.sectorId,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(regions, eq(projects.regionId, regions.id))
    .leftJoin(sectors, eq(regions.sectorId, sectors.id))
    .where(
      inArray(projects.code, ["AQUA_112HA", "AQUA_45HA", "AQUA_81HA"])
    )

  console.log(`Đã chọn ${targetProjects.length} dự án mục tiêu:`)
  targetProjects.forEach((p) => console.log(` - [${p.code}] ${p.name} (ID: ${p.id})`))

  const targetProjectIds = targetProjects.map((p) => p.id)

  // 2. Xóa các phân công cũ của 3 dự án này để làm mới dữ liệu chuẩn xác
  console.log("Dọn dẹp phân công cũ của các dự án mục tiêu...")
  await db
    .delete(userProjects)
    .where(inArray(userProjects.projectId, targetProjectIds))

  // 3. Lấy toàn bộ danh sách chức danh và nhóm theo phòng ban
  const allRoles = await db
    .select({
      id: roles.id,
      code: roles.code,
      name: roles.name,
      planningMethod: roles.planningMethod,
      departmentId: roles.departmentId,
      departmentCode: departments.code,
      departmentName: departments.name,
    })
    .from(roles)
    .leftJoin(departments, eq(roles.departmentId, departments.id))

  console.log(`Hệ thống có ${allRoles.length} chức danh.`)

  // Phân loại role theo phòng ban
  const rolesByDept = new Map<string, typeof allRoles>()
  for (const r of allRoles) {
    const dCode = r.departmentCode || "PCD"
    const list = rolesByDept.get(dCode) || []
    list.push(r)
    rolesByDept.set(dCode, list)
  }

  // 4. Tạo hoặc lấy kho nhân sự (cần khoảng 90 - 100 nhân sự)
  const generatedNames = generatePersonnelList(100)
  for (const item of generatedNames) {
    const [exist] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.perNumber, item.perNumber))
      .limit(1)

    if (!exist) {
      await db.insert(users).values({
        fullName: item.fullName,
        email: item.email,
        perNumber: item.perNumber,
        systemRole: "USER",
        provider: "LOCAL",
        status: "ACTIVE",
      })
    }
  }

  const poolUsers = await db
    .select({ id: users.id, fullName: users.fullName, perNumber: users.perNumber })
    .from(users)
    .where(sql`per_number LIKE 'NV1%'`)

  console.log(`Kho nhân sự khả dụng: ${poolUsers.length} nhân sự.`)

  let userIdx = 0
  const getNextUser = () => {
    const u = poolUsers[userIdx % poolUsers.length]
    userIdx++
    return u
  }

  // 5. Cấu hình cơ cấu nhân sự chuẩn cho từng dự án (~30 người / dự án):
  // - Ban Điều hành DA (PMD): 4 người
  // - Pháp lý Dự án (PLP): 4 người
  // - Quản lý Thiết kế (DMD): 5 người
  // - Quản lý Xây dựng (PCD): 14 người (Trưởng phòng, Trưởng bộ phận, các kỹ sư giám sát)
  // - Vận hành Dự án (OM): 3 người
  // Tổng cộng = 30 người / dự án!

  const targetDeptQuota: { deptCode: string; count: number }[] = [
    { deptCode: "PMD", count: 4 },
    { deptCode: "PLP", count: 4 },
    { deptCode: "DMD", count: 5 },
    { deptCode: "PCD", count: 14 },
    { deptCode: "OM", count: 3 },
  ]

  // A. Xử lý các chức danh BY_REGION (Giám đốc Vùng chung cho cả 3 dự án)
  // Vì cả 3 dự án Aqua 112ha, 45ha, 81ha đều thuộc Vùng Đồng Nai 1
  const regionRoles = allRoles.filter((r) => r.planningMethod === "BY_REGION")
  if (regionRoles.length > 0) {
    const sharedRegionUser = getNextUser()
    const sharedRole = regionRoles[0] // Ví dụ GĐ/PGĐ Vùng
    for (const proj of targetProjects) {
      const val = await validateUserProjectAssignment({
        userId: sharedRegionUser.id,
        projectId: proj.id,
        roleId: sharedRole.id,
        status: "ACTIVE",
      })
      if (val.valid) {
        await db.insert(userProjects).values({
          userId: sharedRegionUser.id,
          projectId: proj.id,
          roleId: sharedRole.id,
          isPrimary: true,
          status: "ACTIVE",
          effectiveFrom: "2026-01-01",
        })
        console.log(`[SHARED BY_REGION] ${sharedRegionUser.fullName} (${sharedRole.name}) -> ${proj.name}`)
      }
    }
  }

  // B. Phân bổ các nhân sự còn lại theo từng Dự án để đạt mốc ~30 nhân sự
  for (const proj of targetProjects) {
    console.log(`\n--- Phân bổ nhân sự cho dự án [${proj.code}] ${proj.name} ---`)

    for (const quota of targetDeptQuota) {
      let deptRoleList = rolesByDept.get(quota.deptCode) || []
      if (deptRoleList.length === 0) {
        // Fallback sang PCD nếu phòng ban này ít role
        deptRoleList = rolesByDept.get("PCD") || allRoles
      }

      let assignedInDept = 0
      for (let i = 0; i < quota.count; i++) {
        const role = deptRoleList[i % deptRoleList.length]

        // Tìm 1 user khả dụng thỏa mãn validateUserProjectAssignment
        let attempts = 0
        let assigned = false

        while (attempts < poolUsers.length && !assigned) {
          const candidate = getNextUser()
          attempts++

          const val = await validateUserProjectAssignment({
            userId: candidate.id,
            projectId: proj.id,
            roleId: role.id,
            status: "ACTIVE",
          })

          if (val.valid) {
            // Kiểm tra xem user này đã có trong dự án này chưa
            const [exist] = await db
              .select({ id: userProjects.id })
              .from(userProjects)
              .where(
                and(
                  eq(userProjects.userId, candidate.id),
                  eq(userProjects.projectId, proj.id),
                )
              )
              .limit(1)

            if (!exist) {
              await db.insert(userProjects).values({
                userId: candidate.id,
                projectId: proj.id,
                roleId: role.id,
                isPrimary: assignedInDept === 0,
                status: "ACTIVE",
                effectiveFrom: "2026-01-01",
              })
              assignedInDept++
              assigned = true
              console.log(
                ` + [${quota.deptCode}] ${candidate.fullName} -> ${role.name} (${role.planningMethod || "BY_PROJECT"})`
              )
            }
          }
        }
      }
    }
  }

  console.log("\n=== TỔNG KẾT ĐỐI SOÁT NHÂN SỰ SAU KHI SEED ===")
  const summary: any = await db.execute(sql`
    SELECT 
      p.id, 
      p.code, 
      p.name, 
      COUNT(up.id) as total_staff
    FROM projects p
    LEFT JOIN user_projects up ON p.id = up.project_id AND up.status = 'ACTIVE'
    WHERE p.id IN (${sql.raw(targetProjectIds.join(","))})
    GROUP BY p.id, p.code, p.name
    ORDER BY p.id;
  `)
  console.log("Số lượng nhân sự từng dự án mục tiêu:", summary)

  // Thống kê phân bổ theo phòng ban cho Aqua 112Ha
  const aqua112DeptSummary: any = await db.execute(sql`
    SELECT 
      d.code as dept_code,
      d.name as dept_name,
      COUNT(up.id) as staff_count
    FROM user_projects up
    INNER JOIN roles r ON up.role_id = r.id
    INNER JOIN departments d ON r.department_id = d.id
    WHERE up.project_id = 1 AND up.status = 'ACTIVE'
    GROUP BY d.code, d.name
    ORDER BY staff_count DESC;
  `)
  console.log("\nChi tiết nhân sự theo phòng ban tại Aqua 112Ha:", aqua112DeptSummary)
}

seed()
  .then(() => {
    console.log("Seed hoàn tất thành công!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Lỗi seed:", err)
    process.exit(1)
  })
