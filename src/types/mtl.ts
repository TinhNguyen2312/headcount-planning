import type { ParameterImpact, ProjectParameters } from "@/lib/mtl/mtl-parameter-engine";
import type { MilestoneDates, MilestoneSources } from "@/lib/mtl/mtl-milestones";

export type { MilestoneDates, MilestoneSources };

export type WorkType = "" | "Báo cáo định kỳ" | "Tracking công việc";

export type DemoAccount = {
  username: string;
  password: string;
  name: string;
  role: string;
  initials: string;
  email?: string;
  badge?: string;
  badgeType?: "blue" | "green" | "purple" | "orange" | "cyan";
  system?: "gmd" | "hrc" | "admin";
  desc?: string;
};

export type TemplateTask = {
  id: number;
  code: string;
  parentCode: string | null;
  groupCode: string;
  name: string;
  level: number;
  summary: boolean;
  defaultDuration: number;
  gmdReport?: string;
  workGroup?: WorkType;
  notes?: string;
  custom?: boolean;
};

export type TaskEdit = {
  startDate?: string;
  endDate?: string;
  duration?: number;
  pic?: string;
  status?: "Đang thực hiện" | "Đóng" | "Hoàn thành" | "Trễ hạn";
  actualProgress?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  actualNote?: string;
  note?: string;
};

export type TaskDependency = {
  predecessorCode: string;
  type: "FS" | "SS" | "FF" | "SF";
  lagDays: number;
};

export type DefaultTaskDependency = TaskDependency & { successorCode: string };

/* Vòng đời MTL theo SOP06 mục 6.1:
   lập (B3-5) → GMD kiểm soát (B6) → GMS.P thẩm định (B7) → trình E-Approval (B8-9) → duyệt chính thức. */
export type ApprovalStatus =
  | "draft"
  | "gmd_review"
  | "gmd_returned"
  | "submitted"
  | "changes_requested"
  | "appraised"
  | "approved";

export type DepartmentApprovalStatus = "pending" | "approved" | "changes_requested";

export type DepartmentApproval = {
  reviewer: string;
  status: DepartmentApprovalStatus;
  note: string;
  reviewedAt?: string;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  type: string;
  investor?: string;
  location: string;
  area?: string;
  region?: string;
  group?: string;
  startDate: string;
  targetDate: string;
  parameters: ProjectParameters;
  parameterImpacts: ParameterImpact[];
  milestoneDates: MilestoneDates;
  milestoneSources?: MilestoneSources;
  selectedGroups: string[];
  createdAt: string;
  taskEdits: Record<string, TaskEdit>;
  taskDependencies: Record<string, TaskDependency[]>;
  customTasks: TemplateTask[];
  includedTaskCodes: string[];
  departmentApprovals: Record<string, DepartmentApproval>;
  approvalStatus: ApprovalStatus;
  designTaskStatus?: "chua_lap" | "dang_lap" | "pbcm_gop_y" | "da_duyet";
  fsStatus?: "chua_lap" | "dang_tinh_toan" | "cho_doi_chieu" | "da_duyet";
  gmdSubmittedAt?: string;
  gmdReviewer?: string;
  gmdNote?: string;
  gmdReviewedAt?: string;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  reviewedAt?: string;
  approvedVersion?: string;
  reviewNote?: string;
  isOfficialApproved?: boolean;
  eApprovalCode?: string;
  eApprovalUrl?: string;
  eApprovalDate?: string;
  eApprovalSigner?: string;
  eApprovalNote?: string;
  officialVersion?: string;
  baselineLocked?: boolean;
  scheduleStatus?: "in_progress" | "completed";
};

export type ProjectForm = Pick<
  Project,
  | "name"
  | "code"
  | "type"
  | "investor"
  | "location"
  | "startDate"
  | "targetDate"
  | "area"
  | "region"
  | "group"
> & {
  version?: string;
  parameters: ProjectParameters;
  milestoneDates: MilestoneDates;
};

export type ScheduledTask = TemplateTask & {
  startDate: string;
  endDate: string;
  duration: number;
  left: number;
  width: number;
  pic: string;
  status: NonNullable<TaskEdit["status"]>;
  predecessors: TaskDependency[];
  dependencyConflict?: string;
  suggestedStartDate?: string;
  actualProgress: number;
  actualStartDate?: string;
  actualEndDate?: string;
  actualStatus: "Chưa bắt đầu" | "Đang thực hiện" | "Hoàn thành" | "Trễ hạn";
  actualNote?: string;
};

export type TaskForm = {
  groupCode: string;
  parentCode: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: NonNullable<TaskEdit["status"]>;
  predecessorCodes: string[];
  addToCurrent: boolean;
};

export interface ScheduleCacheEntry {
  date: string;
  startDate: string;
  targetDate: string;
  editCount: number;
  customTaskCount: number;
  result: ScheduledTask[];
}

export type WorkStat = {
  total: number;
  done: number;
  late: number;
  running: number;
};
