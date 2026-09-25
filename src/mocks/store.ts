/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AccessRoleQueryParams,
  AccessRoleResponse,
  AvailableProjectItem,
  ChangePasswordRequest,
  CreateAccessRolePayload,
  DepartmentCreate,
  DepartmentQueryParams,
  DepartmentResponse,
  DepartmentTreeNodeResponse,
  DepartmentUpdate,
  EvaluateStandardPayload,
  FileUploadResponse,
  GetUserTreeParams,
  HeadcountProjectCreatePayload,
  HeadcountProjectQueryParams,
  HeadcountProjectResponse,
  HeadcountProjectUpdatePayload,
  HeadcountStandardCreatePayload,
  HeadcountStandardQueryParams,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
  IQueryProjects,
  IQueryUsers,
  ItemResponse,
  ListResponse,
  MessageResponse,
  MilestoneCreate,
  MilestoneDependencyCreate,
  MilestoneDependencyResponse,
  MilestoneQueryParams,
  MilestoneResponse,
  MilestoneUpdate,
  PermissionResponse,
  PhaseResponse,
  PlanCreatePayload,
  PlanResponse,
  PlanUpdatePayload,
  ProjectCreate,
  ProjectPropertiesMatrixResponse,
  ProjectResponse,
  ProjectUpdate,
  PropertyCreate,
  PropertyQueryParams,
  PropertyResponse,
  PropertyUpdate,
  RegionCreate,
  RegionDetail,
  RegionQueryParams,
  RegionResponse,
  RegionUpdate,
  RoleCreate,
  RoleQueryParams,
  RoleResponse,
  RoleTreeNodeResponse,
  RoleUpdate,
  SaveProjectPropertiesPayload,
  SectorCreate,
  SectorQueryParams,
  SectorResponse,
  SectorUpdate,
  StandardMatchResult,
  UpdateAccessRolePayload,
  UserAccessRoleResponse,
  UserCreate,
  UserMeResponse,
  UserProjectRoleCreate,
  UserProjectRoleDetailResponse,
  UserProjectRoleUpdate,
  UserResponse,
  UserStatusUpdate,
  UserTreeNodeResponse,
  UserUpdate,
  UserWithProjectsResponse,
  ZoneCreate,
  ZoneResponse,
  ZoneUpdate,
} from "@/types"

import {
  INITIAL_ACCESS_ROLES,
  INITIAL_AVAILABLE_PROJECTS,
  INITIAL_DEPARTMENTS,
  INITIAL_HEADCOUNT_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_MILESTONE_DEPENDENCIES,
  INITIAL_PERMISSIONS,
  INITIAL_PLANS,
  INITIAL_PROJECTS,
  INITIAL_PROPERTIES,
  INITIAL_REGIONS,
  INITIAL_ROLES,
  INITIAL_SECTORS,
  INITIAL_STANDARDS,
  INITIAL_USERS,
  INITIAL_ZONES,
  MOCK_USERS_ACCOUNTS,
} from "./mockData"

const sleep = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms))

function paginate<T>(
  items: T[],
  page = 1,
  limit = 10,
): {
  data: T[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
} {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Number(limit) || 10)
  const totalElements = items.length
  const totalPages = Math.ceil(totalElements / l) || 1
  const start = (p - 1) * l
  const data = items.slice(start, start + l)

  return {
    data,
    meta: {
      page: p,
      size: l,
      totalElements,
      totalPages,
      hasNext: p < totalPages,
      hasPrevious: p > 1,
    },
  }
}

class MockStore {
  private sectors: SectorResponse[] = [...INITIAL_SECTORS]
  private regions: RegionDetail[] = [...INITIAL_REGIONS]
  private projects: ProjectResponse[] = [...INITIAL_PROJECTS]
  private zones: ZoneResponse[] = [...INITIAL_ZONES]
  private departments: DepartmentResponse[] = [...INITIAL_DEPARTMENTS]
  private roles: RoleResponse[] = [...INITIAL_ROLES]
  private users: UserWithProjectsResponse[] = [...INITIAL_USERS]
  private milestones: MilestoneResponse[] = [...INITIAL_MILESTONES]
  private milestoneDeps: MilestoneDependencyResponse[] = [
    ...INITIAL_MILESTONE_DEPENDENCIES,
  ]
  private properties: PropertyResponse[] = [...INITIAL_PROPERTIES]
  private standards: HeadcountStandardResponse[] = [...INITIAL_STANDARDS]
  private accessRoles: AccessRoleResponse[] = [...INITIAL_ACCESS_ROLES]
  private permissions: PermissionResponse[] = [...INITIAL_PERMISSIONS]
  private plans: PlanResponse[] = [...INITIAL_PLANS]
  private headcountProjects: HeadcountProjectResponse[] = [
    ...INITIAL_HEADCOUNT_PROJECTS,
  ]
  private availableProjects: AvailableProjectItem[] = [
    ...INITIAL_AVAILABLE_PROJECTS,
  ]

  // Map of project property values: projectId -> values
  private projectPropertyValues: Map<number, any[]> = new Map()

  // User project assignments
  private userProjectAssignments: UserProjectRoleDetailResponse[] = [
    {
      id: 1,
      userId: 1,
      projectId: 21,
      projectName: "Aqua - Đảo 5",
      zoneId: null,
      roleId: 15,
      roleName: "Giám đốc Dự án",
      userFullName: "Nguyễn Văn Admin",
      userName: "admin",
      projectRole: "PROJECT_ADMIN",
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
    },
  ]

  // Current session user (default to Super Admin)
  private currentUser: UserMeResponse = { ...MOCK_USERS_ACCOUNTS[0] }

  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------
  async login(email: string): Promise<UserMeResponse> {
    await sleep()
    const targetEmail = (email || "").trim().toLowerCase()
    const found =
      MOCK_USERS_ACCOUNTS.find(
        (u) => Boolean(u.email) && u.email!.toLowerCase() === targetEmail,
      ) ||
      this.users.find(
        (u) => Boolean(u.email) && u.email!.toLowerCase() === targetEmail,
      )

    if (found) {
      this.currentUser = {
        ...found,
        projects: (found as any).projects || [
          {
            id: 21,
            name: "Aqua - Đảo 5",
            roleId: found.roleId || 15,
            roleName: found.roleName || "Nhân sự",
            projectRole:
              found.systemRole === "SUPER_ADMIN"
                ? ("SUPER_ADMIN" as any)
                : ("PROJECT_ADMIN" as any),
            status: "ACTIVE",
          },
        ],
        currentProject: (found as any).currentProject || {
          id: 21,
          name: "Aqua - Đảo 5",
          roleId: found.roleId || 15,
          roleName: found.roleName || "Nhân sự",
          projectRole:
            found.systemRole === "SUPER_ADMIN"
              ? ("SUPER_ADMIN" as any)
              : ("PROJECT_ADMIN" as any),
          status: "ACTIVE",
        },
        role:
          found.systemRole === "SUPER_ADMIN"
            ? "SUPER_ADMIN"
            : (found as any).role || "PROJECT_ADMIN",
      }
    }

    if (typeof document !== "undefined") {
      document.cookie =
        "JSESSIONID=mock_session_active; path=/; max-age=31536000; SameSite=Lax"
    }

    return this.currentUser
  }

  async getMe(): Promise<UserMeResponse> {
    await sleep(20)
    return this.currentUser
  }

  async logout(): Promise<void> {
    await sleep()
    if (typeof document !== "undefined") {
      document.cookie = "JSESSIONID=; path=/; max-age=0"
    }
  }

  // --------------------------------------------------------------------------
  // PROJECTS
  // --------------------------------------------------------------------------
  async getProjects(
    params: IQueryProjects = {},
  ): Promise<ListResponse<ProjectResponse>> {
    await sleep()
    let list = [...this.projects]

    if (params.keyword) {
      const q = String(params.keyword).toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q)),
      )
    }

    if (params.region) {
      list = list.filter((p) => p.region === params.region)
    }

    if (params.sector) {
      list = list.filter((p) => p.sector === params.sector)
    }

    if (params.status) {
      list = list.filter((p) => p.status === params.status)
    }

    const { data, meta } = paginate(list, Number(params.page), Number(params.limit))
    return { code: 0, message: "Success", result: data, meta }
  }

  async getProject(id: number): Promise<ProjectResponse> {
    await sleep()
    const p = this.projects.find((item) => item.id === Number(id))
    if (!p) throw new Error(`Project #${id} not found`)
    return p
  }

  async createProject(data: ProjectCreate): Promise<ProjectResponse> {
    await sleep()
    const nextId =
      this.projects.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newProj: ProjectResponse = {
      id: nextId,
      name: data.name,
      address: data.address || null,
      generalInfo: data.generalInfo || null,
      region: data.region || "VUNG_DONG_NAI_1",
      sector: data.sector || "KHU_VUC_2",
      status: data.status || "PLANNING",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      projectType: data.projectType || "HIGH_RISE",
      projectTypes: data.projectTypes || [data.projectType || "HIGH_RISE"],
      thumbnail:
        data.thumbnail ||
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      zonesCount: 0,
      membersCount: 0,
      projectAdmins: [],
    }
    this.projects.unshift(newProj)
    return newProj
  }

  async updateProject(
    id: number,
    data: ProjectUpdate,
  ): Promise<ProjectResponse> {
    await sleep()
    const idx = this.projects.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error(`Project #${id} not found`)
    this.projects[idx] = { ...this.projects[idx], ...data }
    return this.projects[idx]
  }

  async deleteProject(id: number): Promise<void> {
    await sleep()
    this.projects = this.projects.filter((p) => p.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // ZONES
  // --------------------------------------------------------------------------
  async getZones(params: any = {}): Promise<ListResponse<ZoneResponse>> {
    await sleep()
    let list = [...this.zones]
    if (params.projectId) {
      list = list.filter((z) => z.projectId === Number(params.projectId))
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getZone(id: number): Promise<ZoneResponse> {
    await sleep()
    const z = this.zones.find((item) => item.id === Number(id))
    if (!z) throw new Error(`Zone #${id} not found`)
    return z
  }

  async createZone(data: ZoneCreate): Promise<ZoneResponse> {
    await sleep()
    const nextId =
      this.zones.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newZone: ZoneResponse = {
      id: nextId,
      projectId: data.projectId,
      name: data.name,
      code: data.code || null,
      startTime: data.startTime || "2026-01-01",
      endTime: data.endTime || "2028-12-31",
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.zones.push(newZone)
    return newZone
  }

  async updateZone(id: number, data: ZoneUpdate): Promise<ZoneResponse> {
    await sleep()
    const idx = this.zones.findIndex((z) => z.id === Number(id))
    if (idx === -1) throw new Error(`Zone #${id} not found`)
    this.zones[idx] = {
      ...this.zones[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.zones[idx]
  }

  async deleteZone(id: number): Promise<void> {
    await sleep()
    this.zones = this.zones.filter((z) => z.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // DEPARTMENTS
  // --------------------------------------------------------------------------
  async getDepartments(
    params: DepartmentQueryParams = {},
  ): Promise<ListResponse<DepartmentResponse>> {
    await sleep()
    let list = [...this.departments]
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
      )
    }
    if (params.status && params.status !== "ALL") {
      list = list.filter((d) => d.status === params.status)
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getDepartmentTree(): Promise<DepartmentTreeNodeResponse[]> {
    await sleep()
    const map = new Map<number, DepartmentTreeNodeResponse>()
    const roots: DepartmentTreeNodeResponse[] = []

    for (const d of this.departments) {
      map.set(d.id, { ...d, children: [] })
    }

    for (const d of this.departments) {
      const node = map.get(d.id)!
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }

  async getDepartment(id: number): Promise<DepartmentResponse> {
    await sleep()
    const d = this.departments.find((item) => item.id === Number(id))
    if (!d) throw new Error(`Department #${id} not found`)
    return d
  }

  async createDepartment(data: DepartmentCreate): Promise<DepartmentResponse> {
    await sleep()
    const nextId =
      this.departments.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newDept: DepartmentResponse = {
      id: nextId,
      code: data.code,
      name: data.name,
      type: data.type || "Department",
      level: data.level || 1,
      parentId: data.parentId || null,
      status: data.status || "ACTIVE",
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      createdAt: new Date().toISOString(),
    }
    this.departments.push(newDept)
    return newDept
  }

  async updateDepartment(
    id: number,
    data: DepartmentUpdate,
  ): Promise<DepartmentResponse> {
    await sleep()
    const idx = this.departments.findIndex((d) => d.id === Number(id))
    if (idx === -1) throw new Error(`Department #${id} not found`)
    this.departments[idx] = { ...this.departments[idx], ...data }
    return this.departments[idx]
  }

  async deleteDepartment(id: number): Promise<void> {
    await sleep()
    this.departments = this.departments.filter((d) => d.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // ROLES
  // --------------------------------------------------------------------------
  async getRoles(
    params: RoleQueryParams = {},
  ): Promise<ListResponse<RoleResponse>> {
    await sleep()
    let list = [...this.roles]
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.code && r.code.toLowerCase().includes(q)),
      )
    }
    if (params.departmentId) {
      list = list.filter((r) => r.departmentId === Number(params.departmentId))
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getRoleTree(): Promise<RoleTreeNodeResponse[]> {
    await sleep()
    const map = new Map<number, RoleTreeNodeResponse>()
    const roots: RoleTreeNodeResponse[] = []

    for (const r of this.roles) {
      map.set(r.id, { ...r, children: [] })
    }

    for (const r of this.roles) {
      const node = map.get(r.id)!
      if (r.parentRoleId && map.has(r.parentRoleId)) {
        map.get(r.parentRoleId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }

  async getRole(id: number): Promise<RoleResponse> {
    await sleep()
    const r = this.roles.find((item) => item.id === Number(id))
    if (!r) throw new Error(`Role #${id} not found`)
    return r
  }

  async createRole(data: RoleCreate): Promise<RoleResponse> {
    await sleep()
    const nextId =
      this.roles.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newRole: RoleResponse = {
      id: nextId,
      code: data.code,
      shortCode: data.shortCode || data.code,
      name: data.name,
      level: data.level || 1,
      parentRoleId: data.parentRoleId || null,
      departmentId: data.departmentId || null,
      planningMethod: data.planningMethod || "BY_PROJECT",
      description: data.description || data.name,
      createdAt: new Date().toISOString(),
    }
    this.roles.push(newRole)
    return newRole
  }

  async updateRole(id: number, data: RoleUpdate): Promise<RoleResponse> {
    await sleep()
    const idx = this.roles.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw new Error(`Role #${id} not found`)
    this.roles[idx] = { ...this.roles[idx], ...data }
    return this.roles[idx]
  }

  async deleteRole(id: number): Promise<void> {
    await sleep()
    this.roles = this.roles.filter((r) => r.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async getUsers(
    params: IQueryUsers = {},
  ): Promise<ListResponse<UserWithProjectsResponse>> {
    await sleep()
    let list = [...this.users]
    if (params.keyword) {
      const q = String(params.keyword).toLowerCase()
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.perNumber && u.perNumber.toLowerCase().includes(q)),
      )
    }
    if (params.status) {
      list = list.filter((u) => u.status === params.status)
    }
    const { data, meta } = paginate(list, Number(params.page), Number(params.limit))
    return { code: 0, message: "Success", result: data, meta }
  }

  async getUserTree(_params?: GetUserTreeParams): Promise<UserTreeNodeResponse[]> {
    await sleep()
    const topUsers = this.users.slice(0, 15)
    return topUsers.map((u) => ({
      ...u,
      children: [],
    }))
  }

  async getUser(id: number): Promise<UserResponse> {
    await sleep()
    const u = this.users.find((item) => item.id === Number(id))
    if (!u) throw new Error(`User #${id} not found`)
    return u
  }

  async createUser(data: UserCreate): Promise<UserResponse> {
    await sleep()
    const nextId =
      this.users.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newUser: UserWithProjectsResponse = {
      id: nextId,
      fullName: data.fullName,
      phone: data.phone || null,
      email: data.email || null,
      status: "ACTIVE",
      systemRole: data.role || "USER",
      roleId: data.roleId || null,
      roleName: "Nhân viên mới",
      perNumber: data.perNumber || `NV${nextId}`,
      novatorStatus: 1,
      departmentCode: data.departmentCode || null,
      divisionCode: data.divisionCode || null,
      managerPerNumber: data.managerPerNumber || null,
      provider: "LOCAL",
      createdAt: new Date().toISOString(),
      projects: [],
    }
    this.users.unshift(newUser)
    return newUser
  }

  async updateUser(id: number, data: UserUpdate): Promise<UserResponse> {
    await sleep()
    const idx = this.users.findIndex((u) => u.id === Number(id))
    if (idx === -1) throw new Error(`User #${id} not found`)
    this.users[idx] = { ...this.users[idx], ...data }
    return this.users[idx]
  }

  async deleteUser(id: number): Promise<void> {
    await sleep()
    this.users = this.users.filter((u) => u.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // USER PROJECT ROLES
  // --------------------------------------------------------------------------
  async getUserProjectRoles(userId: number): Promise<UserProjectRoleDetailResponse[]> {
    await sleep()
    return this.userProjectAssignments.filter(
      (a) => a.userId === Number(userId),
    )
  }

  async getAllUserProjectRoles(
    params: any = {},
  ): Promise<ListResponse<UserProjectRoleDetailResponse>> {
    await sleep()
    let list = [...this.userProjectAssignments]
    if (params.projectId) {
      list = list.filter((a) => a.projectId === Number(params.projectId))
    }
    if (params.userId) {
      list = list.filter((a) => a.userId === Number(params.userId))
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async createUserProjectRole(
    data: UserProjectRoleCreate,
  ): Promise<UserProjectRoleDetailResponse> {
    await sleep()
    const nextId =
      this.userProjectAssignments.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const user = this.users.find((u) => u.id === Number(data.userId))
    const proj = this.projects.find((p) => p.id === Number(data.projectId))
    const role = this.roles.find((r) => r.id === Number(data.roleId))

    const newAssignment: UserProjectRoleDetailResponse = {
      id: nextId,
      userId: data.userId,
      projectId: data.projectId,
      projectName: proj?.name || "Dự án",
      zoneId: data.zoneId ?? null,
      roleId: data.roleId,
      roleName: role?.name || "Vai trò",
      userFullName: user?.fullName || "Nhân viên",
      userName: user?.email || null,
      projectRole: (data as any).projectRole || "PROJECT_ADMIN",
      isPrimary: data.isPrimary ?? true,
      effectiveFrom: data.effectiveFrom || "2026-01-01",
      effectiveTo: data.effectiveTo || null,
      status: "ACTIVE",
      replacementUserId: null,
      replacementFrom: null,
      replacementTo: null,
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.userProjectAssignments.push(newAssignment)
    return newAssignment
  }

  async updateUserProjectRole(
    id: number,
    data: UserProjectRoleUpdate,
  ): Promise<UserProjectRoleDetailResponse> {
    await sleep()
    const idx = this.userProjectAssignments.findIndex((a) => a.id === Number(id))
    if (idx === -1) throw new Error(`Assignment #${id} not found`)
    this.userProjectAssignments[idx] = {
      ...this.userProjectAssignments[idx],
      ...data,
      userId: data.userId ?? this.userProjectAssignments[idx].userId,
      projectId: data.projectId ?? this.userProjectAssignments[idx].projectId,
      roleId: data.roleId ?? this.userProjectAssignments[idx].roleId,
      projectRole: data.projectRole ?? this.userProjectAssignments[idx].projectRole,
      isPrimary: data.isPrimary ?? this.userProjectAssignments[idx].isPrimary,
      status: (data.status as any) ?? this.userProjectAssignments[idx].status,
      updatedAt: new Date().toISOString(),
    }
    return this.userProjectAssignments[idx]
  }

  async deleteUserProjectRole(id: number): Promise<void> {
    await sleep()
    this.userProjectAssignments = this.userProjectAssignments.filter(
      (a) => a.id !== Number(id),
    )
  }

  // --------------------------------------------------------------------------
  // MILESTONES
  // --------------------------------------------------------------------------
  async getMilestones(
    params: MilestoneQueryParams = {},
  ): Promise<ListResponse<MilestoneResponse>> {
    await sleep()
    let list = [...this.milestones]
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
      )
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getMilestone(id: number): Promise<MilestoneResponse> {
    await sleep()
    const m = this.milestones.find((item) => item.id === Number(id))
    if (!m) throw new Error(`Milestone #${id} not found`)
    return m
  }

  async createMilestone(data: MilestoneCreate): Promise<MilestoneResponse> {
    await sleep()
    const nextId =
      this.milestones.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newM: MilestoneResponse = {
      id: nextId,
      code: data.code,
      name: data.name,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      predecessorIds: data.predecessorIds || [],
    }
    this.milestones.push(newM)
    return newM
  }

  async updateMilestone(
    id: number,
    data: MilestoneUpdate,
  ): Promise<MilestoneResponse> {
    await sleep()
    const idx = this.milestones.findIndex((m) => m.id === Number(id))
    if (idx === -1) throw new Error(`Milestone #${id} not found`)
    this.milestones[idx] = { ...this.milestones[idx], ...data }
    return this.milestones[idx]
  }

  async deleteMilestone(id: number): Promise<void> {
    await sleep()
    this.milestones = this.milestones.filter((m) => m.id !== Number(id))
  }

  async getMilestoneDependencies(): Promise<MilestoneDependencyResponse[]> {
    await sleep()
    return this.milestoneDeps
  }

  async createMilestoneDependency(
    data: MilestoneDependencyCreate,
  ): Promise<MilestoneDependencyResponse> {
    await sleep()
    const nextId =
      this.milestoneDeps.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newDep: MilestoneDependencyResponse = {
      id: nextId,
      fromMilestoneId: data.fromMilestoneId,
      toMilestoneId: data.toMilestoneId,
      dependencyType: data.dependencyType || "FINISH_TO_START",
      description: data.description || null,
      createdAt: new Date().toISOString(),
    }
    this.milestoneDeps.push(newDep)
    return newDep
  }

  async deleteMilestoneDependency(params: {
    id?: number
    fromMilestoneId?: number
    toMilestoneId?: number
  }): Promise<void> {
    await sleep()
    if (params.id) {
      this.milestoneDeps = this.milestoneDeps.filter((d) => d.id !== params.id)
    } else if (params.fromMilestoneId && params.toMilestoneId) {
      this.milestoneDeps = this.milestoneDeps.filter(
        (d) =>
          !(
            d.fromMilestoneId === params.fromMilestoneId &&
            d.toMilestoneId === params.toMilestoneId
          ),
      )
    }
  }

  // --------------------------------------------------------------------------
  // STANDARDS
  // --------------------------------------------------------------------------
  async getStandards(
    params: HeadcountStandardQueryParams = {},
  ): Promise<ListResponse<HeadcountStandardResponse>> {
    await sleep()
    let list = [...this.standards]
    if (params.roleId) {
      list = list.filter((s) => s.roleId === Number(params.roleId))
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getStandard(id: number): Promise<HeadcountStandardResponse> {
    await sleep()
    const s = this.standards.find((item) => item.id === Number(id))
    if (!s) throw new Error(`Standard #${id} not found`)
    return s
  }

  async createStandard(
    data: HeadcountStandardCreatePayload,
  ): Promise<HeadcountStandardResponse> {
    await sleep()
    const nextId =
      this.standards.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const role = this.roles.find((r) => r.id === data.roleId) || this.roles[0]
    const fromM =
      this.milestones.find((m) => m.id === data.fromMilestoneId) ||
      this.milestones[0]
    const toM = data.toMilestoneId
      ? this.milestones.find((m) => m.id === data.toMilestoneId) || null
      : null

    const newStd: HeadcountStandardResponse = {
      id: nextId,
      roleId: data.roleId,
      role,
      fromMilestoneId: data.fromMilestoneId,
      fromMilestone: fromM,
      toMilestoneId: data.toMilestoneId || null,
      toMilestone: toM,
      headcount: data.headcount,
      headcountMin: data.headcountMin || null,
      headcountMax: data.headcountMax || null,
      note: data.note || null,
      fromLeadTimeMonths: data.fromLeadTimeMonths || 0,
      toLeadTimeMonths: data.toLeadTimeMonths || 0,
      durationMonths: data.durationMonths || 12,
      monthlyFactors: data.monthlyFactors || [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      projectType: data.projectType || "ALL",
      criteriaCount: (data.criteria || []).length,
      criteria: (data.criteria || []).map((c, idx) => ({
        id: idx + 1,
        standardId: nextId,
        propertyId: c.propertyId,
        conditionOperator: c.conditionOperator,
        minValue: c.minValue ?? null,
        maxValue: c.maxValue ?? null,
        valueText: c.valueText ?? null,
        note: c.note ?? null,
        property:
          this.properties.find((p) => p.id === c.propertyId) || this.properties[0],
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.standards.push(newStd)
    return newStd
  }

  async updateStandard(
    id: number,
    data: HeadcountStandardUpdatePayload,
  ): Promise<HeadcountStandardResponse> {
    await sleep()
    const idx = this.standards.findIndex((s) => s.id === Number(id))
    if (idx === -1) throw new Error(`Standard #${id} not found`)
    const updatedCriteria = data.criteria
      ? data.criteria.map((c, i) => ({
          id: c.id || i + 1,
          standardId: id,
          propertyId: c.propertyId,
          conditionOperator: c.conditionOperator,
          minValue: c.minValue ?? null,
          maxValue: c.maxValue ?? null,
          valueText: c.valueText ?? null,
          note: c.note ?? null,
          property:
            this.properties.find((p) => p.id === c.propertyId) || this.properties[0],
        }))
      : this.standards[idx].criteria

    this.standards[idx] = {
      ...this.standards[idx],
      ...data,
      criteria: updatedCriteria,
      updatedAt: new Date().toISOString(),
    }
    return this.standards[idx]
  }

  async deleteStandard(id: number): Promise<void> {
    await sleep()
    this.standards = this.standards.filter((s) => s.id !== Number(id))
  }

  async evaluateStandards(
    _payload: EvaluateStandardPayload,
  ): Promise<StandardMatchResult[]> {
    await sleep()
    return this.standards.map((s) => ({
      roleId: s.roleId,
      roleName: s.role?.name || "Chức danh",
      standard: s,
      matchedCriteria: [],
      isMatch: true,
    }))
  }

  // --------------------------------------------------------------------------
  // PROPERTIES
  // --------------------------------------------------------------------------
  async getProperties(
    params: PropertyQueryParams = {},
  ): Promise<ListResponse<PropertyResponse>> {
    await sleep()
    let list = [...this.properties]
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      )
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getProperty(id: number): Promise<PropertyResponse> {
    await sleep()
    const p = this.properties.find((item) => item.id === Number(id))
    if (!p) throw new Error(`Property #${id} not found`)
    return p
  }

  async createProperty(data: PropertyCreate): Promise<PropertyResponse> {
    await sleep()
    const nextId =
      this.properties.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newProp: PropertyResponse = {
      id: nextId,
      code: data.code,
      name: data.name,
      dataType: data.dataType,
      projectType: data.projectType || "ALL",
      unit: data.unit || null,
      options: data.options || null,
      description: data.description || null,
      isActive: data.isActive ?? true,
      departmentIds: data.departmentIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.properties.push(newProp)
    return newProp
  }

  async updateProperty(
    id: number,
    data: PropertyUpdate,
  ): Promise<PropertyResponse> {
    await sleep()
    const idx = this.properties.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error(`Property #${id} not found`)
    this.properties[idx] = {
      ...this.properties[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.properties[idx]
  }

  async deleteProperty(id: number): Promise<void> {
    await sleep()
    this.properties = this.properties.filter((p) => p.id !== Number(id))
  }

  async getProjectProperties(
    projectId: number,
  ): Promise<ProjectPropertiesMatrixResponse> {
    await sleep()
    const proj = this.projects.find((p) => p.id === Number(projectId))
    const existingValues = this.projectPropertyValues.get(Number(projectId)) || [
      {
        projectId: Number(projectId),
        propertyId: 1,
        projectType: "HIGH_RISE",
        propertyCode: "PROP_DIEN_TICH_SAN",
        propertyName: "Diện tích sàn xây dựng (GFA)",
        dataType: "NUMBER",
        unit: "m²",
        valueNumber: 150000,
      },
      {
        projectId: Number(projectId),
        propertyId: 2,
        projectType: "HIGH_RISE",
        propertyCode: "PROP_SO_TANG",
        propertyName: "Số tầng cao",
        dataType: "NUMBER",
        unit: "tầng",
        valueNumber: 25,
      },
    ]

    return {
      projectId: Number(projectId),
      projectType: proj?.projectType || "HIGH_RISE",
      projectTypes: proj?.projectTypes || ["HIGH_RISE"],
      properties: this.properties,
      values: existingValues,
    }
  }

  async saveProjectProperties(
    projectId: number,
    payload: SaveProjectPropertiesPayload,
  ): Promise<void> {
    await sleep()
    const values = payload.values.map((v) => {
      const prop = this.properties.find((p) => p.id === v.propertyId)
      return {
        projectId: Number(projectId),
        propertyId: v.propertyId,
        projectType: v.projectType,
        propertyCode: prop?.code || "",
        propertyName: prop?.name || "",
        dataType: prop?.dataType || "NUMBER",
        unit: prop?.unit || null,
        valueNumber: v.valueNumber,
        valueText: v.valueText,
        updatedAt: new Date().toISOString(),
      }
    })
    this.projectPropertyValues.set(Number(projectId), values)
  }

  // --------------------------------------------------------------------------
  // SECTORS & REGIONS
  // --------------------------------------------------------------------------
  async getSectors(
    params: SectorQueryParams = {},
  ): Promise<ListResponse<SectorResponse>> {
    await sleep()
    let list = [...this.sectors]
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q)),
      )
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getSector(id: number): Promise<SectorResponse> {
    await sleep()
    const s = this.sectors.find((item) => item.id === Number(id))
    if (!s) throw new Error(`Sector #${id} not found`)
    return s
  }

  async createSector(data: SectorCreate): Promise<SectorResponse> {
    await sleep()
    const nextId =
      this.sectors.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newSec: SectorResponse = {
      id: nextId,
      code: data.code || `KHU_VUC_${nextId}`,
      name: data.name,
      description: data.description || null,
      createdAt: new Date().toISOString(),
    }
    this.sectors.push(newSec)
    return newSec
  }

  async updateSector(id: number, data: SectorUpdate): Promise<SectorResponse> {
    await sleep()
    const idx = this.sectors.findIndex((s) => s.id === Number(id))
    if (idx === -1) throw new Error(`Sector #${id} not found`)
    this.sectors[idx] = { ...this.sectors[idx], ...data }
    return this.sectors[idx]
  }

  async deleteSector(id: number): Promise<void> {
    await sleep()
    this.sectors = this.sectors.filter((s) => s.id !== Number(id))
  }

  async getRegions(
    params: RegionQueryParams = {},
  ): Promise<ListResponse<RegionDetail>> {
    await sleep()
    let list = [...this.regions]
    if (params.sectorId) {
      list = list.filter((r) => r.sectorId === Number(params.sectorId))
    }
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || (r.code && r.code.toLowerCase().includes(q)),
      )
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getRegion(id: number): Promise<RegionDetail> {
    await sleep()
    const r = this.regions.find((item) => item.id === Number(id))
    if (!r) throw new Error(`Region #${id} not found`)
    return r
  }

  async createRegion(data: RegionCreate): Promise<RegionResponse> {
    await sleep()
    const nextId =
      this.regions.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const sec = this.sectors.find((s) => s.id === data.sectorId)
    const newReg: RegionDetail = {
      id: nextId,
      sectorId: data.sectorId,
      sectorName: sec?.name,
      code: data.code || `VUNG_${nextId}`,
      name: data.name,
      description: data.description || null,
      createdAt: new Date().toISOString(),
    }
    this.regions.push(newReg)
    return newReg
  }

  async updateRegion(id: number, data: RegionUpdate): Promise<RegionResponse> {
    await sleep()
    const idx = this.regions.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw new Error(`Region #${id} not found`)
    this.regions[idx] = { ...this.regions[idx], ...data }
    return this.regions[idx]
  }

  async deleteRegion(id: number): Promise<void> {
    await sleep()
    this.regions = this.regions.filter((r) => r.id !== Number(id))
  }

  // --------------------------------------------------------------------------
  // ACCESS ROLES & PERMISSIONS
  // --------------------------------------------------------------------------
  async getAccessRoles(
    params: AccessRoleQueryParams = {},
  ): Promise<ListResponse<AccessRoleResponse>> {
    await sleep()
    let list = [...this.accessRoles]
    if (params.scope) {
      list = list.filter((r) => r.scope === params.scope)
    }
    if (params.keyword) {
      const q = params.keyword.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q))
    }
    const { data, meta } = paginate(list, params.page, params.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getAccessRole(id: number): Promise<AccessRoleResponse> {
    await sleep()
    const r = this.accessRoles.find((item) => item.id === Number(id))
    if (!r) throw new Error(`Access Role #${id} not found`)
    return r
  }

  async createAccessRole(
    data: CreateAccessRolePayload,
  ): Promise<AccessRoleResponse> {
    await sleep()
    const nextId =
      this.accessRoles.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newRole: AccessRoleResponse = {
      id: nextId,
      name: data.name,
      description: data.description || null,
      scope: data.scope || "PROJECT",
      isSystem: false,
      parentId: data.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.accessRoles.push(newRole)
    return newRole
  }

  async updateAccessRole(
    id: number,
    data: UpdateAccessRolePayload,
  ): Promise<AccessRoleResponse> {
    await sleep()
    const idx = this.accessRoles.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw new Error(`Access Role #${id} not found`)
    this.accessRoles[idx] = {
      ...this.accessRoles[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.accessRoles[idx]
  }

  async deleteAccessRole(id: number): Promise<void> {
    await sleep()
    this.accessRoles = this.accessRoles.filter((r) => r.id !== Number(id))
  }

  async getPermissions(
    params: { scope?: string; groupName?: string } = {},
  ): Promise<ListResponse<PermissionResponse>> {
    await sleep()
    let list = [...this.permissions]
    if (params.scope) {
      list = list.filter((p) => p.scope === params.scope)
    }
    if (params.groupName) {
      list = list.filter((p) => p.groupName === params.groupName)
    }
    return {
      code: 0,
      message: "Success",
      result: list,
      meta: {
        page: 1,
        size: list.length,
        totalElements: list.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  }

  async getUserAccessRoles(_userId: number): Promise<UserAccessRoleResponse[]> {
    await sleep()
    return this.accessRoles.slice(0, 2).map((r) => ({
      id: r.id,
      name: r.name,
      scope: r.scope,
      isSystem: r.isSystem,
      description: r.description,
      grantedAt: "2026-01-01T00:00:00Z",
    }))
  }

  async updateUserAccessRoles(
    _userId: number,
    _accessRoleIds: number[],
  ): Promise<void> {
    await sleep()
  }

  // --------------------------------------------------------------------------
  // PLANS
  // --------------------------------------------------------------------------
  async getPlans(projectId: number): Promise<ListResponse<PlanResponse>> {
    await sleep()
    const list = this.plans.filter((p) => p.projectId === Number(projectId))
    return {
      code: 0,
      message: "Success",
      result: list,
      meta: {
        page: 1,
        size: list.length,
        totalElements: list.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  }

  async getPlan(projectId: number, planId: number): Promise<PlanResponse> {
    await sleep()
    const p = this.plans.find(
      (item) => item.projectId === Number(projectId) && item.id === Number(planId),
    )
    if (!p) throw new Error(`Plan #${planId} for project #${projectId} not found`)
    return p
  }

  async createPlan(
    projectId: number,
    data: PlanCreatePayload,
  ): Promise<PlanResponse> {
    await sleep()
    const nextId =
      this.plans.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const newPlan: PlanResponse = {
      id: nextId,
      projectId: Number(projectId),
      versionName: data.versionName,
      status: "DRAFT",
      validFrom: data.validFrom,
      note: data.note || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: (data.phases || []).map((ph, idx) => ({
        id: idx + 1,
        planId: nextId,
        orderIndex: ph.orderIndex || idx + 1,
        milestoneId: ph.milestoneId,
        startDate: ph.startDate,
        endDate: ph.endDate,
        durationMonths: ph.durationMonths || 1,
        description: ph.description || null,
        createdAt: new Date().toISOString(),
        milestone: {
          id: ph.milestoneId,
          name: this.milestones.find((m) => m.id === ph.milestoneId)?.name || "Mốc",
          code: this.milestones.find((m) => m.id === ph.milestoneId)?.code || null,
          description: null,
        },
      })),
    }
    this.plans.push(newPlan)
    return newPlan
  }

  async updatePlan(
    projectId: number,
    planId: number,
    data: PlanUpdatePayload,
  ): Promise<PlanResponse> {
    await sleep()
    const idx = this.plans.findIndex(
      (p) => p.projectId === Number(projectId) && p.id === Number(planId),
    )
    if (idx === -1) throw new Error(`Plan #${planId} not found`)
    this.plans[idx] = {
      ...this.plans[idx],
      ...data,
      phases: data.phases
        ? (data.phases as PhaseResponse[])
        : this.plans[idx].phases,
      updatedAt: new Date().toISOString(),
    }
    return this.plans[idx]
  }

  async deletePlan(projectId: number, planId: number): Promise<void> {
    await sleep()
    this.plans = this.plans.filter(
      (p) => !(p.projectId === Number(projectId) && p.id === Number(planId)),
    )
  }

  async activatePlan(projectId: number, planId: number): Promise<PlanResponse> {
    await sleep()
    for (const p of this.plans) {
      if (p.projectId === Number(projectId)) {
        if (p.id === Number(planId)) {
          p.status = "ACTIVE"
        } else if (p.status === "ACTIVE") {
          p.status = "ARCHIVED"
        }
      }
    }
    return this.getPlan(projectId, planId)
  }

  // --------------------------------------------------------------------------
  // HEADCOUNT PROJECTS
  // --------------------------------------------------------------------------
  async getHeadcountProjects(
    params?: HeadcountProjectQueryParams,
  ): Promise<ListResponse<HeadcountProjectResponse>> {
    await sleep()
    let list = [...this.headcountProjects]
    if (params?.isActive !== undefined) {
      list = list.filter((p) => p.isActive === params.isActive)
    }
    const { data, meta } = paginate(list, params?.page, params?.limit)
    return { code: 0, message: "Success", result: data, meta }
  }

  async getHeadcountProject(id: number): Promise<HeadcountProjectResponse> {
    await sleep()
    const p = this.headcountProjects.find((item) => item.id === Number(id))
    if (!p) throw new Error(`Headcount Project #${id} not found`)
    return p
  }

  async getAvailableProjects(): Promise<ListResponse<AvailableProjectItem>> {
    await sleep()
    return {
      code: 0,
      message: "Success",
      result: this.availableProjects,
      meta: {
        page: 1,
        size: this.availableProjects.length,
        totalElements: this.availableProjects.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    }
  }

  async createHeadcountProject(
    data: HeadcountProjectCreatePayload,
  ): Promise<HeadcountProjectResponse> {
    await sleep()
    const nextId =
      this.headcountProjects.reduce((max, cur) => Math.max(max, cur.id), 0) + 1
    const proj =
      this.projects.find((p) => p.id === data.projectId) || this.projects[0]
    const newHP: HeadcountProjectResponse = {
      id: nextId,
      projectId: data.projectId,
      isActive: data.isActive ?? true,
      note: data.note || null,
      project: proj,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.headcountProjects.push(newHP)
    return newHP
  }

  async updateHeadcountProject(
    id: number,
    data: HeadcountProjectUpdatePayload,
  ): Promise<HeadcountProjectResponse> {
    await sleep()
    const idx = this.headcountProjects.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error(`Headcount Project #${id} not found`)
    this.headcountProjects[idx] = {
      ...this.headcountProjects[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.headcountProjects[idx]
  }

  async deleteHeadcountProject(id: number): Promise<void> {
    await sleep()
    this.headcountProjects = this.headcountProjects.filter(
      (p) => p.id !== Number(id),
    )
  }

  // --------------------------------------------------------------------------
  // UPLOADS
  // --------------------------------------------------------------------------
  async uploadFile(file: File): Promise<FileUploadResponse> {
    await sleep(150)
    let url =
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      try {
        url = URL.createObjectURL(file)
      } catch {
        // ignore
      }
    }
    return {
      fileUrl: url,
      url,
      originalFileName: file.name,
      filename: file.name,
      storedFileName: `mock_${Date.now()}_${file.name}`,
      contentType: file.type,
      content_type: file.type,
      size: file.size,
    }
  }
}

export const mockStore = new MockStore()
