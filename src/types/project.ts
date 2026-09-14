import type { ProjectRole } from "./auth"
import type { IBaseQuery } from "./common"

export interface IQueryProjects extends IBaseQuery {
  region?: ProjectRegion | string
  sector?: ProjectSector | string
  status?: ProjectStatus | string
}

export type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED"

export type ProjectSector = "KHU_VUC_1" | "KHU_VUC_2" | "KHU_VUC_3"

export const PROJECT_SECTOR_LABELS: Record<ProjectSector, string> = {
  KHU_VUC_1: "Khu vực 1",
  KHU_VUC_2: "Khu vực 2",
  KHU_VUC_3: "Khu vực 3",
}

export const PROJECT_SECTOR_OPTIONS: { value: ProjectSector; label: string }[] =
  (Object.keys(PROJECT_SECTOR_LABELS) as ProjectSector[]).map((key) => ({
    value: key,
    label: PROJECT_SECTOR_LABELS[key],
  }))

export type ProjectRegion =
  | "VUNG_TPHCM_1"
  | "VUNG_TPHCM_2_1"
  | "VUNG_TPHCM_2_2"
  | "VUNG_TPHCM_2_3"
  | "VUNG_TPHCM_3"
  | "VUNG_BA_RIA_VUNG_TAU"
  | "VUNG_HO_TRAM_1"
  | "VUNG_HO_TRAM_2"
  | "VUNG_DONG_NAI_1"
  | "VUNG_DONG_NAI_2"
  | "VUNG_DONG_NAI_3"
  | "VUNG_PHAN_THIET_1"
  | "VUNG_PHAN_THIET_2"
  | "VUNG_PHAN_THIET_3"
  | "VUNG_DA_LAT_1"
  | "VUNG_DA_LAT_2"
  | "VUNG_DA_LAT_3"
  | "VUNG_KHANH_HOA"
  | "VUNG_STAY"
  | "VUNG_PLAY"
  | "VUNG_DBSCL_1"
  | "VUNG_DBSCL_2"
  | "VUNG_TAY_NINH_LONG_AN"
  | "VUNG_KHU_CN"
  | "VUNG_PHU_QUOC"
  | "VUNG_HUE_DA_NANG"

export const PROJECT_REGION_LABELS: Record<ProjectRegion, string> = {
  VUNG_TPHCM_1: "Vùng TP.HCM 1",
  VUNG_TPHCM_2_1: "Vùng TP.HCM 2.1",
  VUNG_TPHCM_2_2: "Vùng TP.HCM 2.2",
  VUNG_TPHCM_2_3: "Vùng TP.HCM 2.3",
  VUNG_TPHCM_3: "Vùng TP.HCM 3",
  VUNG_BA_RIA_VUNG_TAU: "Vùng Bà Rịa - Vũng Tàu",
  VUNG_HO_TRAM_1: "Vùng Hồ Tràm 1",
  VUNG_HO_TRAM_2: "Vùng Hồ Tràm 2",
  VUNG_DONG_NAI_1: "Vùng Đồng Nai 1",
  VUNG_DONG_NAI_2: "Vùng Đồng Nai 2",
  VUNG_DONG_NAI_3: "Vùng Đồng Nai 3",
  VUNG_PHAN_THIET_1: "Vùng Phan Thiết 1",
  VUNG_PHAN_THIET_2: "Vùng Phan Thiết 2",
  VUNG_PHAN_THIET_3: "Vùng Phan Thiết 3",
  VUNG_DA_LAT_1: "Vùng Đà Lạt 1",
  VUNG_DA_LAT_2: "Vùng Đà Lạt 2",
  VUNG_DA_LAT_3: "Vùng Đà Lạt 3",
  VUNG_KHANH_HOA: "Vùng Khánh Hòa",
  VUNG_STAY: "Vùng Stay",
  VUNG_PLAY: "Vùng Play",
  VUNG_DBSCL_1: "Vùng ĐBSCL 1",
  VUNG_DBSCL_2: "Vùng ĐBSCL 2",
  VUNG_TAY_NINH_LONG_AN: "Vùng Tây Ninh (Long An)",
  VUNG_KHU_CN: "Vùng Khu CN",
  VUNG_PHU_QUOC: "Vùng Phú Quốc",
  VUNG_HUE_DA_NANG: "Vùng Huế-Đà Nẵng",
}

export const PROJECT_REGION_OPTIONS: { value: ProjectRegion; label: string }[] =
  (Object.keys(PROJECT_REGION_LABELS) as ProjectRegion[]).map((key) => ({
    value: key,
    label: PROJECT_REGION_LABELS[key],
  }))

export interface ProjectResponse {
  id: number
  name: string
  address: string | null
  generalInfo?: string | null
  region?: ProjectRegion | null
  sector?: ProjectSector | null
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
  createdAt: string
  zonesCount?: number
  membersCount?: number
  projectAdmins?: Array<{ userId: number; fullName: string; roleName: string }>
  zones?: ZoneResponse[]
  thumbnail: string
  accProjectId?: string | null
}

export interface ProjectCreate {
  name: string
  address?: string | null
  generalInfo?: string | null
  region?: ProjectRegion | null
  sector?: ProjectSector | null
  status?: ProjectStatus
  startDate?: string | null
  endDate?: string | null
  thumbnail?: string
  accProjectId?: string | null
}

export interface ProjectUpdate extends Partial<ProjectCreate> {}

export interface ZoneResponse {
  id: number
  projectId: number
  name: string
  code: string | null
  startTime: string
  endTime: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface ZoneCreate {
  projectId: number
  name: string
  code?: string | null
  startTime: string
  endTime: string
}

export interface ZoneUpdate extends Partial<ZoneCreate> {}

export type UserProjectRoleStatus = "ACTIVE" | "ENDED"

export interface UserProjectRoleResponse {
  id: number
  userId: number
  projectId: number
  zoneId: number | null
  roleId: number
  projectRole: ProjectRole
  isPrimary: boolean
  effectiveFrom: string | null
  effectiveTo: string | null
  status: UserProjectRoleStatus
  replacementUserId: number | null
  replacementFrom: string | null
  replacementTo: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface UserProjectRoleDetailResponse extends UserProjectRoleResponse {
  userName?: string | null
  userFullName: string
  roleName: string
  projectName: string
  zoneName?: string | null
  replacementUserName?: string | null
  replacementUserFullName?: string | null
}

export interface UserProjectRoleCreate {
  userId: number
  projectId: number
  zoneId?: number | null
  roleId: number
  projectRole: ProjectRole
  isPrimary?: boolean
  effectiveFrom: string
  effectiveTo?: string | null
  status?: UserProjectRoleStatus | null
  replacementUserId?: number | null
  replacementFrom?: string | null
  replacementTo?: string | null
}

export interface UserProjectRoleUpdate {
  userId?: number | null
  projectId?: number | null
  zoneId?: number | null
  roleId?: number | null
  projectRole?: ProjectRole | null
  isPrimary?: boolean | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  status?: UserProjectRoleStatus | null
  replacementUserId?: number | null
  replacementFrom?: string | null
  replacementTo?: string | null
}

export interface AssignReplacementRequest {
  replacementUserId: number
  replacementFrom: string
  replacementTo: string
}

export interface ZoneEffectiveFromItem {
  zoneId: number
  zoneName: string
  zoneCode?: string | null
  effectiveFrom: string
}

export interface AddProjectUserPayload {
  userId: number
  roleId: number
  projectId: number
  projectRole: ProjectRole
  zoneAssignments: {
    zoneId: number | null
    effectiveFrom: string
  }[]
}

export interface EditProjectMemberDiffActions {
  toUpdateEffectiveFrom: {
    id: number
    data: Pick<UserProjectRoleUpdate, "effectiveFrom">
  }[]
  toRemoveAssignmentIds: number[]
  toAddAssignments: UserProjectRoleCreate[]
}
