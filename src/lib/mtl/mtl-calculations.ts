import type {
  ApprovalStatus,
  DefaultTaskDependency,
  DepartmentApproval,
  MilestoneDates,
  Project,
  ScheduledTask,
  TaskDependency,
  TaskEdit,
  TemplateTask,
  WorkStat,
} from "@/types/mtl";
import {
  GROUPS,
  GROUP_BY_CODE,
  GROUP_ORDER,
  PBCM_CODES,
  PBCM_GROUPS,
  SORTED_TEMPLATE,
  TEMPLATE,
  DEFAULT_DEPENDENCIES,
} from "@/constants/mtl";
import { DEFAULT_PROJECT_PARAMETERS } from "@/lib/mtl/mtl-parameter-engine";

export function isPbcmGroup(code: string): boolean {
  return PBCM_CODES.has(code);
}

export function pbcmGroupsOf(project: Project): string[] {
  return project.selectedGroups.filter(isPbcmGroup);
}

export function normalizeRegion(region?: string, location?: string, name?: string): string {
  const text = `${region ?? ""} ${location ?? ""} ${name ?? ""}`.toLowerCase();
  if (text.includes("đồng nai") || text.includes("dong nai") || text.includes("aqua") || text.includes("vùng 2")) return "Vùng Đồng Nai 1";
  if (text.includes("phan thiết") || text.includes("phan thiet") || text.includes("bình thuận") || text.includes("binh thuan") || text.includes("vùng 3")) return "Vùng Phan Thiết 1";
  if (text.includes("hồ tràm") || text.includes("ho tram") || text.includes("vũng tàu") || text.includes("vung tau") || text.includes("xuyên mộc") || text.includes("vùng 4")) return "Vùng Hồ Tràm 1";
  if (text.includes("hồ chí minh") || text.includes("ho chi minh") || text.includes("tp.hcm") || text.includes("tphcm") || text.includes("hcm") || text.includes("quận") || text.includes("vùng 1")) return "Vùng Hồ Chí Minh 1";
  return region || "Vùng Hồ Chí Minh 1";
}

export function isScheduleCompleted(project?: Partial<Project> | null): boolean {
  if (!project) return false;
  if (project.scheduleStatus === "completed") return true;
  if (project.scheduleStatus === "in_progress") return false;
  return Boolean(project.isOfficialApproved || project.approvalStatus === "approved");
}

export function normalizeDepartmentApprovals(
  selectedGroups: string[],
  approvals?: Record<string, DepartmentApproval>,
  legacyApproved = false
): Record<string, DepartmentApproval> {
  return Object.fromEntries(
    PBCM_GROUPS.filter((group) => selectedGroups.includes(group.code)).map((group) => {
      const current = approvals?.[group.code];
      return [
        group.code,
        {
          reviewer: current?.reviewer ?? (legacyApproved ? "Đã duyệt trước quy trình mới" : ""),
          status: current?.status ?? (legacyApproved ? "approved" : "pending"),
          note: current?.note ?? "",
          reviewedAt: current?.reviewedAt,
        } satisfies DepartmentApproval,
      ];
    })
  );
}

export function dateAtOffset(date: string, offset: number): string {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

export function dateAtWorkingOffset(date: string, offset: number): string {
  let value = date;
  let remaining = Math.abs(offset);
  const direction = offset < 0 ? -1 : 1;
  while (remaining > 0) {
    value = dateAtOffset(value, direction);
    const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return value;
}

export function workingDaysBetween(start: string, end: string): number {
  if (!start || !end || end < start) return 0;
  let count = 0;
  for (let value = start; value <= end; value = dateAtOffset(value, 1)) {
    const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

export function rawDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const [startYear, startMonth, startDay] = start.slice(0, 10).split("-").map(Number);
  const [endYear, endMonth, endDay] = end.slice(0, 10).split("-").map(Number);
  if (isNaN(startYear) || isNaN(endYear)) return 0;
  return Math.round((Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay)) / 86400000);
}

export function daysBetween(start: string, end: string): number {
  return Math.max(30, rawDaysBetween(start, end) + 1);
}

export function formatDate(date?: string): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T00:00:00`));
}

export function formatDateTime(date?: string): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

export function interpolateDate(start: string, end: string, fraction: number): string {
  if (!start || !end) return start || end || "";
  const startMs = Date.parse(`${start.slice(0, 10)}T00:00:00Z`);
  const endMs = Date.parse(`${end.slice(0, 10)}T00:00:00Z`);
  if (isNaN(startMs) || isNaN(endMs)) return start;
  const targetMs = startMs + (endMs - startMs) * Math.max(0, Math.min(1, fraction));
  return new Date(targetMs).toISOString().slice(0, 10);
}

export function getProjectLifecycleWindows(startDate: string, targetDate: string, milestoneDates?: MilestoneDates) {
  const today = new Date().toISOString().slice(0, 10);
  const pStart = startDate || today;
  const pEnd = targetDate && targetDate > pStart ? targetDate : dateAtOffset(pStart, 365);

  const mGroundbreaking = (milestoneDates?.["MILE_PCD_01"] && milestoneDates["MILE_PCD_01"] > pStart && milestoneDates["MILE_PCD_01"] < pEnd)
    ? milestoneDates["MILE_PCD_01"]
    : interpolateDate(pStart, pEnd, 0.28);

  const mSales = (milestoneDates?.["MILE_COM_02"] && milestoneDates["MILE_COM_02"] > pStart && milestoneDates["MILE_COM_02"] < pEnd)
    ? milestoneDates["MILE_COM_02"]
    : interpolateDate(pStart, pEnd, 0.42);

  const mFinish = interpolateDate(mGroundbreaking, pEnd, 0.82);

  const mHandover = (milestoneDates?.["MILE_OM_02"] && milestoneDates["MILE_OM_02"] > mFinish && milestoneDates["MILE_OM_02"] < pEnd)
    ? milestoneDates["MILE_OM_02"]
    : interpolateDate(mFinish, pEnd, 0.65);

  const windows: Record<string, [string, string]> = {
    "4.0": [pStart, pEnd],
    "4.1": [pStart, mHandover],
    "4.2": [pStart, mGroundbreaking],
    "4.3": [mGroundbreaking, mFinish],
    "4.4": [mFinish, pEnd],
  };

  return { pStart, pEnd, windows, mGroundbreaking, mSales, mFinish, mHandover };
}

export function allProjectTasks(project: Project): TemplateTask[] {
  if (!project.customTasks || project.customTasks.length === 0) {
    return SORTED_TEMPLATE;
  }
  const customCodes = new Set(project.customTasks.map((task) => task.code));
  return [...SORTED_TEMPLATE.filter((task) => !customCodes.has(task.code)), ...project.customTasks].sort(
    (a, b) => (GROUP_ORDER[a.groupCode] ?? 99) - (GROUP_ORDER[b.groupCode] ?? 99) || a.code.localeCompare(b.code, undefined, { numeric: true })
  );
}

export function taskStatusClass(status: NonNullable<TaskEdit["status"]>): string {
  if (status === "Hoàn thành") return "confirmed";
  if (status === "Đang thực hiện") return "working";
  return "closed";
}

interface ScheduleCacheEntry {
  date: string;
  startDate: string;
  targetDate: string;
  editCount: number;
  customTaskCount: number;
  result: ScheduledTask[];
}
const scheduleCache = new WeakMap<Project, ScheduleCacheEntry>();

export function scheduleTasks(project: Project): ScheduledTask[] {
  const today = new Date().toISOString().slice(0, 10);
  const editCount = Object.keys(project.taskEdits || {}).length;
  const customTaskCount = project.customTasks?.length || 0;
  const cached = scheduleCache.get(project);
  if (
    cached &&
    cached.date === today &&
    cached.startDate === project.startDate &&
    cached.targetDate === project.targetDate &&
    cached.editCount === editCount &&
    cached.customTaskCount === customTaskCount
  ) {
    return cached.result;
  }

  const source = allProjectTasks(project);
  const totalDays = daysBetween(project.startDate, project.targetDate);
  const { pStart, pEnd, windows } = getProjectLifecycleWindows(project.startDate, project.targetDate, project.milestoneDates);
  const totalProjectWorkingDays = Math.max(10, workingDaysBetween(pStart, pEnd));
  const timeScale = Math.min(1.2, Math.max(0.15, totalProjectWorkingDays / 600));

  const sourceParentCodes = new Set<string>();
  const nonSummaryByGroup = new Map<string, number>();
  const indexInGroupByCode = new Map<string, number>();

  for (const item of source) {
    if (item.summary) {
      sourceParentCodes.add(item.code);
    }
    let dot = item.code.lastIndexOf(".");
    let prefix = item.code;
    while (dot > 0) {
      prefix = prefix.slice(0, dot);
      sourceParentCodes.add(prefix);
      dot = prefix.lastIndexOf(".");
    }

    if (!item.summary) {
      const currentCount = nonSummaryByGroup.get(item.groupCode) ?? 0;
      indexInGroupByCode.set(item.code, currentCount);
      nonSummaryByGroup.set(item.groupCode, currentCount + 1);
    }
  }

  const includedCodes = new Set(project.includedTaskCodes);
  const tasks = source.filter((task) => includedCodes.has(task.code)).map((task) => {
    const isParent = task.summary || sourceParentCodes.has(task.code);
    const isBaoCao = task.workGroup === "Báo cáo định kỳ";
    const edit = project.taskEdits[task.code] ?? {};
    const isKeyMilestone = /\.MILE_(?:PLP|PCD|COM|OM)_\d+$/.test(task.code);

    let startDate = "";
    let endDate = "";
    let duration = 0;

    if (isParent) {
      startDate = "";
      endDate = "";
      duration = 0;
    } else if (isBaoCao) {
      if (edit.startDate && edit.endDate) {
        startDate = edit.startDate;
        endDate = edit.endDate;
        duration = edit.duration ?? (edit.startDate && edit.endDate ? Math.max(1, workingDaysBetween(edit.startDate, edit.endDate)) : 0);
      } else {
        startDate = "";
        endDate = "";
        duration = 0;
      }
    } else {
      if (edit.startDate && edit.endDate) {
        startDate = edit.startDate;
        endDate = edit.endDate;
        duration = isKeyMilestone ? 0 : (edit.duration ?? Math.max(1, workingDaysBetween(startDate, endDate)));
      } else {
        const [wStart, wEnd] = windows[task.groupCode] ?? [pStart, pEnd];
        const groupCount = nonSummaryByGroup.get(task.groupCode) ?? 1;
        const indexInGroup = indexInGroupByCode.get(task.code) ?? 0;
        const wWorkingDays = Math.max(5, workingDaysBetween(wStart, wEnd));
        const offsetWorkingDays = Math.floor((indexInGroup / Math.max(1, groupCount)) * Math.max(0, wWorkingDays - 4) * 0.85);

        startDate = dateAtWorkingOffset(wStart, offsetWorkingDays);
        if (startDate < pStart) startDate = pStart;
        if (startDate >= pEnd) startDate = dateAtOffset(pEnd, -3);

        if (isKeyMilestone) {
          duration = 0;
          endDate = startDate;
        } else {
          const rawDur = task.defaultDuration > 0 ? task.defaultDuration : 10;
          const scaledDur = Math.max(1, Math.round(rawDur * timeScale));
          const tentativeEnd = dateAtWorkingOffset(startDate, scaledDur - 1);
          endDate = tentativeEnd <= wEnd ? tentativeEnd : wEnd;
          if (endDate > pEnd) endDate = pEnd;
          if (endDate < startDate) endDate = startDate;
          duration = Math.max(1, workingDaysBetween(startDate, endDate));
        }
      }

      if (startDate < project.startDate) startDate = project.startDate;
      if (endDate > project.targetDate) {
        endDate = project.targetDate;
        if (!isKeyMilestone) {
          duration = Math.max(1, workingDaysBetween(startDate, endDate));
        }
      }
      if (endDate < startDate) endDate = startDate;
    }

    const hasDates = Boolean(startDate && endDate && (duration > 0 || isKeyMilestone));
    const startOffset = hasDates ? Math.max(0, rawDaysBetween(project.startDate, startDate)) : 0;

    const actualProgress = edit.actualProgress !== undefined ? edit.actualProgress : (edit.status === "Hoàn thành" ? 100 : (edit.status === "Đang thực hiện" ? 30 : 0));
    const actualStartDate = edit.actualStartDate ?? (actualProgress > 0 && startDate ? startDate : undefined);
    const actualEndDate = edit.actualEndDate ?? (actualProgress === 100 && endDate ? endDate : undefined);

    let actualStatus: "Chưa bắt đầu" | "Đang thực hiện" | "Hoàn thành" | "Trễ hạn" = "Chưa bắt đầu";
    if (actualProgress === 100 || edit.status === "Hoàn thành") {
      actualStatus = "Hoàn thành";
    } else if (hasDates && endDate < today && actualProgress < 100) {
      actualStatus = "Trễ hạn";
    } else if (actualProgress > 0 || (hasDates && startDate <= today && endDate >= today)) {
      actualStatus = "Đang thực hiện";
    }

    const leftPercent = hasDates ? Math.min(98, (startOffset / totalDays) * 100) : 0;
    const maxAllowedWidth = Math.max(0, 100 - leftPercent);
    const rawWidth = hasDates ? (duration / totalDays) * 100 : 0;
    const widthPercent = hasDates ? Math.max(0.7, Math.min(maxAllowedWidth, rawWidth)) : 0;

    return {
      ...task,
      startDate,
      endDate,
      duration,
      left: leftPercent,
      width: widthPercent,
      pic: edit.pic ?? "",
      status: actualStatus === "Hoàn thành" ? "Hoàn thành" : (actualStatus === "Trễ hạn" ? "Trễ hạn" : (edit.status ?? "Đang thực hiện")),
      actualProgress,
      actualStartDate,
      actualEndDate,
      actualStatus,
      actualNote: edit.actualNote,
      predecessors: project.taskDependencies[task.code] ?? [],
    };
  });

  const descendantsByParent = new Map<string, typeof tasks>();
  for (const candidate of tasks) {
    let dot = candidate.code.lastIndexOf(".");
    let prefix = candidate.code;
    while (dot > 0) {
      prefix = prefix.slice(0, dot);
      let list = descendantsByParent.get(prefix);
      if (!list) {
        list = [];
        descendantsByParent.set(prefix, list);
      }
      list.push(candidate);
      dot = prefix.lastIndexOf(".");
    }
  }

  const rolledUp = tasks.map((task) => {
    const descendants = descendantsByParent.get(task.code);
    const isParent = task.summary || Boolean(descendants && descendants.length > 0);
    if (!isParent || !descendants || !descendants.length) return task;

    const datedDescendants = descendants.filter((c) => Boolean(c.startDate && c.endDate));
    const nonSummaryDated = datedDescendants.filter((c) => !c.summary);

    if (datedDescendants.length > 0) {
      const startDate = datedDescendants.reduce(
        (earliest, candidate) => (!earliest || candidate.startDate < earliest ? candidate.startDate : earliest),
        datedDescendants[0].startDate
      );
      const endDate = datedDescendants.reduce(
        (latest, candidate) => (!latest || candidate.endDate > latest ? candidate.endDate : latest),
        datedDescendants[0].endDate
      );
      const duration = Math.max(1, workingDaysBetween(startDate, endDate));
      const actualProgress = nonSummaryDated.length
        ? Math.round(nonSummaryDated.reduce((sum, c) => sum + c.actualProgress, 0) / nonSummaryDated.length)
        : task.actualProgress;
      let actualStatus: "Chưa bắt đầu" | "Đang thực hiện" | "Hoàn thành" | "Trễ hạn" = task.actualStatus;
      if (actualProgress === 100) actualStatus = "Hoàn thành";
      else if (endDate < today && actualProgress < 100) actualStatus = "Trễ hạn";
      else if (actualProgress > 0) actualStatus = "Đang thực hiện";

      return {
        ...task,
        summary: true,
        startDate,
        endDate,
        duration,
        actualProgress,
        actualStatus,
      };
    }

    return {
      ...task,
      summary: true,
      startDate: "",
      endDate: "",
      duration: 0,
      actualProgress: 0,
      actualStatus: "Chưa bắt đầu" as const,
    };
  });

  const byCode = new Map(rolledUp.map((task) => [task.code, task]));

  const finalTasks: ScheduledTask[] = rolledUp.map((task): ScheduledTask => {
    const missingCodes: string[] = [];
    type RequirementItem = {
      code: string;
      type: "FS" | "SS" | "FF" | "SF";
      suggestedStart: string;
      violated: boolean;
    };
    const requirements: RequirementItem[] = task.predecessors.flatMap((dependency): RequirementItem[] => {
      const predecessor = byCode.get(dependency.predecessorCode);
      if (!predecessor) {
        missingCodes.push(dependency.predecessorCode);
        return [];
      }
      if (!predecessor.startDate || !predecessor.endDate || !task.startDate) {
        return [];
      }
      if (dependency.type === "SS") {
        const suggestedStart = dateAtWorkingOffset(predecessor.startDate, dependency.lagDays);
        return [{ code: dependency.predecessorCode, type: dependency.type, suggestedStart, violated: task.startDate < suggestedStart }];
      }
      if (dependency.type === "FF" || dependency.type === "SF") {
        const baseDate = dependency.type === "FF" ? predecessor.endDate : predecessor.startDate;
        const requiredFinish = dateAtWorkingOffset(baseDate, dependency.lagDays);
        const suggestedStart = dateAtWorkingOffset(requiredFinish, -(task.duration - 1));
        return [{ code: dependency.predecessorCode, type: dependency.type, suggestedStart, violated: task.endDate < requiredFinish }];
      }
      const suggestedStart = dateAtWorkingOffset(predecessor.endDate, 1 + dependency.lagDays);
      return [{ code: dependency.predecessorCode, type: dependency.type, suggestedStart, violated: task.startDate < suggestedStart }];
    });
    const suggestedStartDate: string = requirements.reduce(
      (latest: string, requirement: RequirementItem) => (requirement.suggestedStart > latest ? requirement.suggestedStart : latest),
      ""
    );
    const blockingCodes = requirements.filter((requirement) => requirement.violated).map((requirement) => `${requirement.type} · ${requirement.code}`);
    const conflict = missingCodes.length
      ? `Không tìm thấy công việc cần hoàn thành trước ${missingCodes.join(", ")}.`
      : blockingCodes.length ? `Các liên kết ${blockingCodes.join(", ")} yêu cầu bắt đầu không sớm hơn ${formatDate(suggestedStartDate)}.` : "";
    const hasDates = Boolean(task.startDate && task.endDate && (task.duration > 0 || /\.MILE_/.test(task.code)));
    const startOffset = hasDates ? Math.max(0, rawDaysBetween(project.startDate, task.startDate)) : 0;
    return {
      ...task,
      actualStatus: task.actualStatus as ScheduledTask["actualStatus"],
      left: hasDates ? Math.min(98, (startOffset / totalDays) * 100) : 0,
      width: hasDates ? Math.max(0.7, Math.min(100, (Math.max(1, rawDaysBetween(task.startDate, task.endDate) + 1) / totalDays) * 100)) : 0,
      dependencyConflict: conflict || undefined,
      suggestedStartDate: suggestedStartDate || undefined,
    };
  });

  scheduleCache.set(project, {
    date: today,
    startDate: project.startDate,
    targetDate: project.targetDate,
    editCount,
    customTaskCount,
    result: finalTasks,
  });

  return finalTasks;
}

export function emptyWorkStat(): WorkStat {
  return { total: 0, done: 0, late: 0, running: 0 };
}

export function countWork(stat: WorkStat, task: ScheduledTask, today: string) {
  stat.total += 1;
  if (task.status === "Hoàn thành") stat.done += 1;
  else if (task.endDate < today) stat.late += 1;
  else stat.running += 1;
}

export function latePercent(stat: WorkStat): number {
  return stat.total ? (stat.late / stat.total) * 100 : 0;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function normalizeTaskStatus(status: unknown): NonNullable<TaskEdit["status"]> {
  if (status === "Hoàn thành" || status === "Đã xác nhận") return "Hoàn thành";
  if (status === "Trễ hạn") return "Trễ hạn";
  if (status === "Đóng") return "Đóng";
  return "Đang thực hiện";
}

export function dependenciesToRecord(dependencies: DefaultTaskDependency[]) {
  return dependencies.reduce<Record<string, TaskDependency[]>>((result, dependency) => {
    const { successorCode, ...link } = dependency;
    result[successorCode] = [...(result[successorCode] ?? []), link];
    return result;
  }, {});
}

export function defaultDependenciesForCodes(codes: string[]) {
  const included = new Set(codes);
  return dependenciesToRecord(
    DEFAULT_DEPENDENCIES.filter(
      (dependency) =>
        included.has(dependency.successorCode) && included.has(dependency.predecessorCode)
    )
  );
}

export function migrateApprovalStatus(project: Partial<Project>): ApprovalStatus {
  const status = project.approvalStatus ?? "draft";
  if (status === "approved" && !project.isOfficialApproved && !project.eApprovalCode) return "appraised";
  return status;
}

export function normalizeProject(project: Partial<Project>): Project {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  const selectedGroups = project.selectedGroups ?? GROUPS.map((group) => group.code);
  const projectTasks = [...TEMPLATE, ...(project.customTasks ?? [])];
  const taskEdits = Object.fromEntries(
    Object.entries(project.taskEdits ?? {}).map(([code, edit]) => [
      code,
      {
        ...edit,
        ...(edit.status ? { status: normalizeTaskStatus(edit.status) } : {}),
      },
    ])
  ) as Record<string, TaskEdit>;
  const includedTaskCodes =
    project.includedTaskCodes ??
    projectTasks.filter((task) => selectedGroups.includes(task.groupCode)).map((task) => task.code);
  const isOfficial = Boolean(
    project.isOfficialApproved || (project.approvalStatus === "approved" && project.eApprovalCode)
  );
  return {
    id: project.id ?? crypto.randomUUID(),
    name: project.name ?? "Dự án chưa đặt tên",
    code: project.code ?? "MTL",
    type: project.type ?? "Công trình cao tầng",
    investor: project.investor ?? "Tập đoàn Novaland",
    location: project.location ?? "",
    area: project.area ?? "Khu vực 1",
    region: normalizeRegion(project.region, project.location, project.name),
    group: project.group ?? "Nhóm 1 (Đang nghiên cứu)",
    startDate: project.startDate ?? today,
    targetDate: project.targetDate ?? nextYear,
    parameters: {
      ...DEFAULT_PROJECT_PARAMETERS,
      ...(project.parameters ?? {}),
      loaiHinhDuAn: project.parameters?.loaiHinhDuAn ?? DEFAULT_PROJECT_PARAMETERS.loaiHinhDuAn,
    },
    parameterImpacts: project.parameterImpacts ?? [],
    milestoneDates: project.milestoneDates ?? {},
    selectedGroups,
    createdAt: project.createdAt ?? new Date().toISOString(),
    taskEdits,
    taskDependencies:
      project.taskDependencies && Object.keys(project.taskDependencies).length > 50
        ? project.taskDependencies
        : defaultDependenciesForCodes(includedTaskCodes),
    customTasks: project.customTasks ?? [],
    includedTaskCodes,
    departmentApprovals: normalizeDepartmentApprovals(
      selectedGroups,
      project.departmentApprovals,
      Boolean(!project.departmentApprovals && project.approvalStatus && project.approvalStatus !== "draft")
    ),
    approvalStatus: migrateApprovalStatus(project),
    designTaskStatus:
      project.designTaskStatus ??
      (isOfficial ? "da_duyet" : project.approvalStatus === "draft" ? "dang_lap" : "pbcm_gop_y"),
    fsStatus: project.fsStatus ?? (isOfficial ? "da_duyet" : "dang_tinh_toan"),
    gmdSubmittedAt: project.gmdSubmittedAt,
    gmdReviewer: project.gmdReviewer,
    gmdNote: project.gmdNote,
    gmdReviewedAt: project.gmdReviewedAt,
    submittedAt: project.submittedAt,
    submittedBy: project.submittedBy,
    approvedAt: project.approvedAt,
    reviewedAt: project.reviewedAt,
    approvedVersion: project.approvedVersion,
    reviewNote: project.reviewNote,
    isOfficialApproved: isOfficial,
    eApprovalCode: project.eApprovalCode,
    eApprovalUrl: project.eApprovalUrl,
    eApprovalDate: project.eApprovalDate,
    eApprovalSigner: project.eApprovalSigner,
    eApprovalNote: project.eApprovalNote,
    officialVersion: project.officialVersion ?? (isOfficial ? "v1.0" : undefined),
    baselineLocked: Boolean(project.baselineLocked ?? isOfficial),
    scheduleStatus:
      project.scheduleStatus ??
      (isOfficial || project.approvalStatus === "approved" ? "completed" : "in_progress"),
  };
}
