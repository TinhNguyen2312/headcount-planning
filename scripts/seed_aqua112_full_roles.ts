import { and, eq, sql } from "drizzle-orm"
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

const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
const DEM = ["Văn", "Thị", "Minh", "Đức", "Quốc", "Hữu", "Thanh", "Ngọc", "Gia", "Xuân", "Quang", "Đình", "Hải", "Tuấn", "Kim"]
const TEN = ["Hùng", "Trí", "Cường", "Mai", "Anh", "Bảo", "Thu", "Huy", "Tuấn", "Hương", "Nghĩa", "Nam", "Kiệt", "Ngân", "Thành", "Phùng", "Thưởng", "Đăng", "Tâm", "Hiếu", "Thắng", "Quân", "An", "Thể", "Thảo", "Dũng", "Sơn", "Tùng", "Long", "Giang", "Khoa", "Phong"]

function generateMoreUsers(count: number, startNum: number) {
  const list: { fullName: string; email: string; perNumber: string }[] = []
  for (let i = 0; i < count; i++) {
    const h = HO[(i + 3) % HO.length]
    const d = DEM[(i * 5) % DEM.length]
    const t = TEN[(i * 11) % TEN.length]
    const fullName = `${h} ${d} ${t}`
    const perNumber = `NV${startNum + i}`
    const emailPrefix = `${t.toLowerCase()}.${h.toLowerCase()}${startNum + i}`
    const email = `${emailPrefix}@novagroup.vn`
    list.push({ fullName, email, perNumber })
  }
  return list
}

async function seedAqua112Full() {
  console.log("=== BẮT ĐẦU BỔ SUNG ĐẦY ĐỦ TOÀN BỘ CHỨC DANH CHO DỰ ÁN AQUA 112HA ===")

  // 1. Lấy thông tin dự án Aqua 112Ha (ID: 1)
  const [aqua112] = await db
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
    .where(eq(projects.id, 1))
    .limit(1)

  if (!aqua112) {
    console.error("Không tìm thấy dự án Aqua 112Ha (ID: 1)")
    process.exit(1)
  }

  console.log(`Dự án mục tiêu: [${aqua112.code}] ${aqua112.name} (Vùng: ${aqua112.regionName}, Khu vực: ${aqua112.sectorName})`)

  // 2. Lấy danh sách các chức danh đã gán tại Aqua 112Ha
  const currentAssigned = await db
    .select({ roleId: userProjects.roleId })
    .from(userProjects)
    .where(
      and(
        eq(userProjects.projectId, 1),
        eq(userProjects.status, "ACTIVE")
      )
    )
  const assignedRoleIds = new Set(currentAssigned.map((a) => a.roleId))
  console.log(`Hiện tại Aqua 112Ha đã có: ${currentAssigned.length} phân công (với ${assignedRoleIds.size} chức danh khác nhau).`)

  // 3. Lấy tất cả chức danh trong hệ thống
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

  const missingRoles = allRoles.filter((r) => !assignedRoleIds.has(r.id))
  console.log(`Số chức danh còn THIẾU tại Aqua 112Ha: ${missingRoles.length} chức danh.`)

  // 4. Chuẩn bị kho nhân sự
  // Tạo thêm 60 nhân sự mới từ NV2001 -> NV2060 để đảm bảo không bị thiếu user rảnh
  const newBatch = generateMoreUsers(60, 2001)
  for (const item of newBatch) {
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

  const allAvailableUsers = await db.select().from(users).where(eq(users.status, "ACTIVE"))
  console.log(`Tổng số nhân sự ACTIVE trong hệ thống: ${allAvailableUsers.length}`)

  // 5. Gán nhân sự cho từng chức danh còn thiếu tại Aqua 112Ha
  let successCount = 0
  let skippedCount = 0

  for (const role of missingRoles) {
    let assigned = false

    for (const candidate of allAvailableUsers) {
      // Kiểm tra xem candidate này đã được gán tại Aqua 112Ha chưa
      const [alreadyInAqua] = await db
        .select({ id: userProjects.id })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.userId, candidate.id),
            eq(userProjects.projectId, 1),
            eq(userProjects.status, "ACTIVE")
          )
        )
        .limit(1)

      if (alreadyInAqua) {
        continue // Mỗi nhân sự chỉ gán 1 vai trò chính tại Aqua 112Ha
      }

      // Kiểm tra ràng buộc planning_method
      const val = await validateUserProjectAssignment({
        userId: candidate.id,
        projectId: 1,
        roleId: role.id,
        status: "ACTIVE",
      })

      if (val.valid) {
        await db.insert(userProjects).values({
          userId: candidate.id,
          projectId: 1,
          roleId: role.id,
          isPrimary: true,
          status: "ACTIVE",
          effectiveFrom: "2026-01-01",
        })
        successCount++
        assigned = true
        console.log(` + [GÁN THÀNH CÔNG] [${role.departmentCode || "BP"}] ${candidate.fullName} (${candidate.perNumber}) -> ${role.name} (${role.planningMethod || "BY_PROJECT"})`)
        break
      }
    }

    if (!assigned) {
      skippedCount++
      console.warn(` - [KHÔNG THỂ GÁN] Chức danh '${role.name}' (${role.planningMethod}) không tìm được nhân sự khả dụng thỏa điều kiện.`)
    }
  }

  console.log(`\n=== TỔNG KẾT: Đã gán thêm ${successCount} chức danh mới cho Aqua 112Ha (bỏ qua: ${skippedCount}) ===`)

  // 6. In bảng tổng kết chi tiết cơ cấu nhân sự mới tại Aqua 112Ha
  const finalSummary: any = await db.execute(sql`
    SELECT 
      d.name as department_name,
      d.code as department_code,
      COUNT(up.id) as staff_count,
      STRING_AGG(DISTINCT r.name, ', ') as roles_list
    FROM user_projects up
    INNER JOIN roles r ON up.role_id = r.id
    INNER JOIN departments d ON r.department_id = d.id
    WHERE up.project_id = 1 AND up.status = 'ACTIVE'
    GROUP BY d.name, d.code
    ORDER BY staff_count DESC;
  `)
  console.log("\nChi tiết cơ cấu toàn bộ nhân sự theo phòng ban tại Aqua 112Ha:\n", finalSummary)

  const [totalAquaStaff]: any = await db.execute(sql`
    SELECT COUNT(id) as total FROM user_projects WHERE project_id = 1 AND status = 'ACTIVE';
  `)
  console.log(`\n=> TỔNG CỘNG NHÂN SỰ TẠI AQUA 112HA HIỆN TẠI: ${totalAquaStaff.total} NHÂN SỰ`)
}

seedAqua112Full()
  .then(() => {
    console.log("Hoàn tất!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Lỗi:", err)
    process.exit(1)
  })
