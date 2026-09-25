import type {
  DemoAccount,
  TemplateTask,
  DefaultTaskDependency,
  Project,
} from "@/types/mtl";
import templateData from "@/constants/mtl/mtl-template.json";
import dependencyData from "@/constants/mtl/mtl-dependencies.json";

export const STORAGE_KEY = "mtl-workspace-projects-v1";
export const ACTIVE_KEY = "mtl-workspace-active-project-v1";
export const CATALOG_KEY = "mtl-workspace-custom-catalog-v1";
export const CATALOG_ENABLED_KEY = "mtl-workspace-enabled-catalog-v2";
export const CATALOG_WORK_TYPE_KEY = "mtl-workspace-catalog-work-type-v1";
export const SESSION_KEY = "mtl-workspace-session-v1";

export const WORK_DONE = "#2ea44f";
export const WORK_LATE = "#d92b2b";
export const WORK_RUNNING = "#102d4b";

export const TEMPLATE = templateData as TemplateTask[];
export const DEFAULT_DEPENDENCIES = dependencyData as DefaultTaskDependency[];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "gmd.gdb@novaland.com.vn",
    password: "MTL@2026",
    name: "Giám đốc Ban điều hành dự án",
    role: "Giám đốc Ban điều hành dự án",
    initials: "GD",
    email: "gmd.gdb@novaland.com.vn",
    badge: "",
    badgeType: "blue",
    system: "gmd",
    desc: "",
  },
  {
    username: "gmd.pgd@novaland.com.vn",
    password: "MTL@2026",
    name: "Phó giám đốc Phòng điều hành dự án",
    role: "Phó giám đốc Phòng điều hành dự án",
    initials: "PG",
    email: "gmd.pgd@novaland.com.vn",
    badge: "",
    badgeType: "orange",
    system: "gmd",
    desc: "",
  },
  {
    username: "gmd.tpcc@novaland.com.vn",
    password: "MTL@2026",
    name: "Trưởng phòng cao cấp Quản lý dự án",
    role: "Trưởng phòng cao cấp Quản lý dự án",
    initials: "TP",
    email: "gmd.tpcc@novaland.com.vn",
    badge: "",
    badgeType: "green",
    system: "gmd",
    desc: "",
  },
  {
    username: "gmd.tp@novaland.com.vn",
    password: "MTL@2026",
    name: "Trưởng phòng Quản lý dự án",
    role: "Trưởng phòng Quản lý dự án",
    initials: "TP",
    email: "gmd.tp@novaland.com.vn",
    badge: "",
    badgeType: "cyan",
    system: "gmd",
    desc: "",
  },
  {
    username: "itd.admin@novagroup.vn",
    password: "MTL@2026",
    name: "Admin hệ thống",
    role: "Admin hệ thống",
    initials: "AD",
    email: "itd.admin@novagroup.vn",
    badge: "",
    badgeType: "purple",
    system: "admin",
    desc: "",
  },
  {
    username: "hrc.tp@novagroup.vn",
    password: "MTL@2026",
    name: "Phạm Thu H",
    role: "Trưởng Ban Nhân sự",
    initials: "PH",
    email: "hrc.tp@novagroup.vn",
    badge: "Trưởng phòng",
    badgeType: "blue",
    system: "hrc",
    desc: "Ban Nhân sự · phụ trách định biên nhân sự và phê duyệt kế hoạch",
  },
  {
    username: "hrc.cb@novagroup.vn",
    password: "MTL@2026",
    name: "Trần Quốc B",
    role: "Chuyên viên C&B",
    initials: "TB",
    email: "hrc.cb@novagroup.vn",
    badge: "Chuyên viên",
    badgeType: "blue",
    system: "hrc",
    desc: "Ban Nhân sự · theo dõi chính sách & nhân sự hiện trường dự án",
  },
  {
    username: "pmd.01",
    password: "MTL@2026",
    name: "PMD Administrator",
    role: "Chủ trì lập MTL",
    initials: "PM",
    email: "pmd.admin@novagroup.vn",
    badge: "Chủ trì MTL",
    badgeType: "blue",
    system: "admin",
    desc: "Phòng Điều hành Dự án · lập, kiểm soát và điều phối tiến độ tổng thể",
  },
  {
    username: "gms.01",
    password: "MTL@2026",
    name: "GMS.P Appraiser",
    role: "Thẩm định MTL",
    initials: "GS",
    email: "gms.appraiser@novagroup.vn",
    badge: "Thẩm định MTL",
    badgeType: "blue",
    system: "admin",
    desc: "Ban Thẩm định MTL",
  },
];

/* Theo SOP06 mục 2.2, PBCM gồm 9 ban/phòng gián tiếp + 4 phòng trực tiếp = 13 đơn vị.
   PMD là đơn vị chủ trì lập MTL (phòng điều hành) */
export const GROUPS = [
  { code: "9.1", short: "HRC", name: "Ban Nhân sự", role: "indirect", scope: "9 phòng ban" },
  { code: "9.2", short: "FAC", name: "Ban Tài chính Kế toán", role: "indirect", scope: "9 phòng ban" },
  { code: "9.3", short: "SAC", name: "Ban Kinh doanh", role: "indirect", scope: "9 phòng ban" },
  { code: "9.4", short: "MAC", name: "Ban Marketing", role: "indirect", scope: "9 phòng ban" },
  { code: "9.5", short: "PTC", name: "Ban Cung ứng Đấu thầu", role: "indirect", scope: "9 phòng ban" },
  { code: "9.6", short: "QSB", name: "Phòng Khối lượng và Ngân sách", role: "indirect", scope: "9 phòng ban" },
  { code: "9.7", short: "SED", name: "Phòng An ninh", role: "indirect", scope: "9 phòng ban" },
  { code: "9.8", short: "IDD", name: "Phòng Thiết kế Nội bộ", role: "indirect", scope: "9 phòng ban" },
  { code: "9.9", short: "CSC", name: "Trung tâm Bồi thường GPMB", role: "indirect", scope: "9 phòng ban" },
  { code: "4.0", short: "PMD", name: "Phòng Điều hành Dự án", role: "coordinator", scope: "Chủ trì lập MTL" },
  { code: "4.1", short: "PLP", name: "Phòng Thủ tục Pháp lý Xây dựng", role: "direct", scope: "4 phòng trực tiếp" },
  { code: "4.2", short: "DMD", name: "Phòng Quản lý Thiết kế", role: "direct", scope: "4 phòng trực tiếp" },
  { code: "4.3", short: "PCD", name: "Phòng Quản lý Xây dựng, An toàn & Môi trường", role: "direct", scope: "4 phòng trực tiếp" },
  { code: "4.4", short: "OM", name: "Phòng Quản lý Vận hành Dự án", role: "direct", scope: "4 phòng trực tiếp" },
] as const;

export const PBCM_GROUPS = GROUPS.filter((group) => group.role !== "coordinator");
export const PBCM_CODES = new Set<string>(PBCM_GROUPS.map((group) => group.code));
export const INDIRECT_COUNT = GROUPS.filter((group) => group.role === "indirect").length;
export const DIRECT_COUNT = GROUPS.filter((group) => group.role === "direct").length;

export const GROUP_BY_CODE = Object.fromEntries(GROUPS.map((group) => [group.code, group]));
export const GROUP_ORDER = Object.fromEntries(GROUPS.map((group, index) => [group.code, index]));
export const SORTED_TEMPLATE = [...TEMPLATE].sort(
  (a, b) =>
    (GROUP_ORDER[a.groupCode] ?? 99) - (GROUP_ORDER[b.groupCode] ?? 99) ||
    a.code.localeCompare(b.code, undefined, { numeric: true }),
);

export const REGIONS = [
  "Vùng Đồng Nai 1",
  "Vùng Phan Thiết 1",
  "Vùng Hồ Chí Minh 1",
  "Vùng Hồ Tràm 1",
] as const;

export const PROJECT_GROUPS = [
  "Nhóm 1 (Đang nghiên cứu)",
  "Nhóm 2 (Đã mua đang thiết kế)",
  "Nhóm 3 (Đang xây dựng)",
  "Nhóm 4 (Đã bàn giao khách hàng)",
  "Nhóm 5 (Thoái vốn)",
] as const;

export const DEFAULT_INITIAL_PROJECTS: Partial<Project>[] = [
  {
    id: "proj-aqua-city-phoenix",
    code: "NVL-AQH-2026",
    name: "Aqua City - Đảo Phượng Hoàng (Phoenix Island)",
    type: "Khu đô thị sinh thái thông minh",
    investor: "Công ty TNHH BĐS Đà Lạt Valley",
    location: "Biên Hòa, Đồng Nai",
    area: "Đồng Nai",
    region: "Vùng Đồng Nai 1",
    group: "Nhóm 3 (Đang xây dựng)",
    scheduleStatus: "completed",
    approvalStatus: "approved",
    isOfficialApproved: true,
    eApprovalCode: "QĐ-NVL-2026/892",
    eApprovalDate: "2026-06-15",
    officialVersion: "v1.0",
    designTaskStatus: "da_duyet",
    fsStatus: "da_duyet",
    startDate: "2026-06-01",
    targetDate: "2028-12-31",
  },
  {
    id: "proj-novaworld-phanthiet",
    code: "NVL-NVW-2026",
    name: "NovaWorld Phan Thiet (PGA Golf & Resort)",
    type: "Tổ hợp Du lịch Nghỉ dưỡng Giải trí",
    investor: "Công ty CP Đầu tư Địa ốc No Va",
    location: "Phan Thiết, Bình Thuận",
    area: "Bình Thuận",
    region: "Vùng Phan Thiết 1",
    group: "Nhóm 3 (Đang xây dựng)",
    scheduleStatus: "in_progress",
    approvalStatus: "draft",
    isOfficialApproved: false,
    officialVersion: "v1.0",
    designTaskStatus: "pbcm_gop_y",
    fsStatus: "dang_tinh_toan",
    startDate: "2026-05-15",
    targetDate: "2028-06-30",
  },
  {
    id: "proj-the-grand-manhattan",
    code: "NVL-GMH-2026",
    name: "The Grand Manhattan (Cô Bắc - Cô Giang)",
    type: "Khu phức hợp Căn hộ Cao cấp & Thương mại",
    investor: "Công ty CP Đất Ngọc",
    location: "Quận 1, TP. Hồ Chí Minh",
    area: "TP.HCM",
    region: "Vùng Hồ Chí Minh 1",
    group: "Nhóm 3 (Đang xây dựng)",
    scheduleStatus: "in_progress",
    approvalStatus: "draft",
    isOfficialApproved: false,
    officialVersion: "v1.0",
    designTaskStatus: "dang_lap",
    fsStatus: "dang_tinh_toan",
    startDate: "2026-07-01",
    targetDate: "2027-12-31",
  },
];
