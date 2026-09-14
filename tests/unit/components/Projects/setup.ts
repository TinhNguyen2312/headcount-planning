import type {
  RoleResponse,
  UserProjectRoleDetailResponse,
  UserResponse,
  ZoneResponse,
} from "@/types"

export const mockProjectMember: UserProjectRoleDetailResponse = {
  id: 1,
  userId: 10,
  projectId: 1,
  zoneId: 101,
  roleId: 2,
  projectRole: "TASK_EXECUTOR",
  isPrimary: true,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  status: "ACTIVE",
  replacementUserId: null,
  replacementFrom: null,
  replacementTo: null,
  createdBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  userFullName: "Nguyễn Văn A",
  roleName: "Kỹ sư QLXD",
  projectName: "Aqua City",
  zoneName: "Zone 1",
}

export const mockZones: ZoneResponse[] = [
  { id: 101, name: "Zone 1", code: "Z1", projectId: 1, description: "" },
  { id: 102, name: "Zone 2", code: "Z2", projectId: 1, description: "" },
  { id: 103, name: "Zone 3", code: "Z3", projectId: 1, description: "" },
]

export const mockRoles: RoleResponse[] = [
  { id: 2, name: "Kỹ sư QLXD", code: "KS_QLXD" },
  { id: 3, name: "Trưởng phòng QLXD", code: "TP_QLXD" },
]

export const mockUsers: (UserResponse & { roleName?: string })[] = [
  {
    id: 10,
    fullName: "Nguyễn Văn A",
    perNumber: "NV001",
    email: "a@test.com",
    status: "ACTIVE",
    roleId: 2,
    roleName: "Kỹ sư QLXD",
  },
  {
    id: 20,
    fullName: "Trần Văn B",
    perNumber: "NV002",
    email: "b@test.com",
    status: "ACTIVE",
    roleId: 3,
    roleName: "Trưởng phòng QLXD",
  },
  {
    id: 30,
    fullName: "Lê Văn C",
    perNumber: "NV003",
    email: "c@test.com",
    status: "ACTIVE",
    roleId: 1,
    roleName: "GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn và Môi trường",
  },
]
