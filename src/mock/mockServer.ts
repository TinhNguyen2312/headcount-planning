/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ItemResponse, ListResponse } from "@/types"
import { MOCK_SYNC_LOGS } from "./acc"
import { MOCK_CHECKLIST_ITEMS, MOCK_CHECKLISTS } from "./checklists"
import {
  MOCK_INSTANCES,
  MOCK_TASK_HISTORIES,
  MOCK_TASK_INSTANCES,
} from "./instances"
import { MOCK_PROJECT_MEMBERS, MOCK_PROJECTS } from "./projects"
import {
  MOCK_OVERDUE_REPORT,
  MOCK_PROGRESS_REPORT,
  MOCK_ROLE_PERFORMANCE,
} from "./reports"
import { MOCK_DEPARTMENTS, MOCK_ROLE_TREE, MOCK_ROLES } from "./roles"
import { MOCK_SCHEDULE_MATRIX, MOCK_SCHEDULES } from "./schedules"
import { MOCK_BUSINESS_MATRIX, MOCK_TASK_ITEMS } from "./taskItems"
import { MOCK_TRACKING_POINTS, MOCK_TRACKING_SESSIONS } from "./tracking"
import {
  MOCK_CURRENT_USER,
  MOCK_USER_STATISTICS,
  MOCK_USER_TREE,
  MOCK_USERS,
} from "./users"

// In-Memory state for mutations
let projects = [...MOCK_PROJECTS]
let users = [...MOCK_USERS]
let taskInstances = [...MOCK_TASK_INSTANCES]
let checklists = [...MOCK_CHECKLISTS]
let schedules = [...MOCK_SCHEDULES]
let syncLogs = [...MOCK_SYNC_LOGS]

export function wrapItem<T>(result: T): ItemResponse<T> {
  return {
    code: 200,
    message: "Success",
    result,
  }
}

export function wrapList<T>(
  result: T[],
  page = 0,
  limit = 20,
  total?: number,
): ListResponse<T> {
  const totalCount = total ?? result.length
  return {
    code: 200,
    message: "Success",
    result,
    meta: {
      page,
      size: limit,
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      hasNext: (page + 1) * limit < totalCount,
      hasPrevious: page > 0,
    },
  }
}

// Simulated network delay
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

export async function handleMockRequest<T>(
  method: string,
  url: string,
  data?: any,
  config?: any,
): Promise<T> {
  await delay(120)

  const cleanUrl = url.split("?")[0]
  const params = config?.params || {}
  const uMethod = method.toUpperCase()

  // 1. AUTH
  if (cleanUrl.endsWith("/auth/me")) {
    return wrapItem(MOCK_CURRENT_USER) as any
  }
  if (cleanUrl.endsWith("/auth/login/local") || cleanUrl.endsWith("/auth/local")) {
    return wrapItem({
      accessToken: "mock-jwt-token-xyz",
      user: MOCK_CURRENT_USER,
    }) as any
  }
  if (cleanUrl.endsWith("/auth/logout")) {
    return wrapItem({ message: "Logged out successfully" }) as any
  }

  // 2. USERS & ORG TREE
  if (cleanUrl.endsWith("/users/tree")) {
    return wrapList(MOCK_USER_TREE) as any
  }
  if (cleanUrl.endsWith("/users/statistics")) {
    return wrapItem(MOCK_USER_STATISTICS) as any
  }
  if (cleanUrl.match(/\/users\/\d+\/project-roles$/)) {
    return wrapList([]) as any
  }
  if (cleanUrl.match(/\/users\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = users.find((u) => u.id === id) || users[0]
    if (uMethod === "PATCH") {
      const updated = { ...found, ...data }
      users = users.map((u) => (u.id === id ? updated : u))
      return wrapItem(updated) as any
    }
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/users") || cleanUrl.endsWith("/users/")) {
    let filtered = [...users]
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase()
      filtered = filtered.filter(
        (u) =>
          (u.email && u.email.toLowerCase().includes(kw)) ||
          u.perNumber?.toLowerCase().includes(kw) ||
          u.roleName?.toLowerCase().includes(kw) ||
          u.fullName.toLowerCase().includes(kw),
      )
    }
    return wrapList(filtered, params.page || 0, params.limit || 10) as any
  }

  // 3. PROJECTS & ZONES
  if (cleanUrl.match(/\/projects\/\d+\/members$/)) {
    const pId = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const members = MOCK_PROJECT_MEMBERS[pId] || MOCK_PROJECT_MEMBERS[1] || []
    return wrapList(members) as any
  }
  if (cleanUrl.match(/\/projects\/\d+\/boundary$/)) {
    const pId = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const proj = projects.find((p) => p.id === pId) || projects[0]
    if (uMethod === "PATCH" && data) {
      proj.boundaryGeojson = data.boundaryGeojson
      return wrapItem(proj) as any
    }
    return wrapItem(proj) as any
  }
  if (cleanUrl.match(/\/projects\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const proj = projects.find((p) => p.id === id) || projects[0]
    if (uMethod === "PATCH") {
      const updated = { ...proj, ...data }
      projects = projects.map((p) => (p.id === id ? updated : p))
      return wrapItem(updated) as any
    }
    if (uMethod === "DELETE") {
      projects = projects.filter((p) => p.id !== id)
      return wrapItem({ message: "Deleted successfully" }) as any
    }
    return wrapItem(proj) as any
  }
  if (cleanUrl.endsWith("/projects") || cleanUrl.endsWith("/projects/")) {
    if (uMethod === "POST") {
      const newProj = {
        id: Date.now(),
        zones: [],
        ...data,
      }
      projects.unshift(newProj)
      return wrapItem(newProj) as any
    }
    return wrapList(projects) as any
  }

  // Zones
  if (cleanUrl.match(/\/zones\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const allZones = projects.flatMap((p) => p.zones || [])
    const found = allZones.find((z) => z.id === id) || allZones[0]
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/zones") || cleanUrl.endsWith("/zones/")) {
    const allZones = projects.flatMap((p) => p.zones || [])
    return wrapList(allZones) as any
  }

  // 4. ROLES & DEPARTMENTS
  if (cleanUrl.endsWith("/roles/tree")) {
    return wrapList(MOCK_ROLE_TREE) as any
  }
  if (cleanUrl.match(/\/roles\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = MOCK_ROLES.find((r) => r.id === id) || MOCK_ROLES[0]
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/roles") || cleanUrl.endsWith("/roles/")) {
    return wrapList(MOCK_ROLES) as any
  }
  if (cleanUrl.endsWith("/departments")) {
    return wrapList(MOCK_DEPARTMENTS) as any
  }

  // 5. MASTER DATA & BUSINESS MATRIX
  if (cleanUrl.endsWith("/task-items/business-matrix")) {
    return wrapList(MOCK_BUSINESS_MATRIX) as any
  }
  if (cleanUrl.match(/\/task-items\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = MOCK_TASK_ITEMS.find((t) => t.id === id) || MOCK_TASK_ITEMS[0]
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/task-items") || cleanUrl.endsWith("/task-items/")) {
    return wrapList(MOCK_TASK_ITEMS) as any
  }

  // 6. CHECKLISTS
  if (cleanUrl.match(/\/checklists\/\d+\/items$/)) {
    const id = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const items = MOCK_CHECKLIST_ITEMS[id] || MOCK_CHECKLIST_ITEMS[1] || []
    return wrapList(items) as any
  }
  if (cleanUrl.match(/\/checklists\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = checklists.find((c) => c.id === id) || checklists[0]
    if (uMethod === "PATCH") {
      const updated = { ...found, ...data }
      checklists = checklists.map((c) => (c.id === id ? updated : c))
      return wrapItem(updated) as any
    }
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/checklists") || cleanUrl.endsWith("/checklists/")) {
    return wrapList(checklists) as any
  }

  // 7. SCHEDULES & MATRIX
  if (cleanUrl.endsWith("/schedules/matrix")) {
    return wrapItem(MOCK_SCHEDULE_MATRIX) as any
  }
  if (cleanUrl.match(/\/schedules\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = schedules.find((s) => s.id === id) || schedules[0]
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/schedules") || cleanUrl.endsWith("/schedules/")) {
    return wrapList(schedules) as any
  }
  if (cleanUrl.endsWith("/user-schedules")) {
    return wrapList([]) as any
  }

  // 8. INSTANCES & TASK INSTANCES
  if (cleanUrl.endsWith("/task-instances/my-tasks")) {
    return wrapList(taskInstances) as any
  }
  if (cleanUrl.endsWith("/task-instances/subordinates")) {
    return wrapList(taskInstances) as any
  }
  if (cleanUrl.endsWith("/task-instances/pending-approvals")) {
    return wrapList(taskInstances.filter((t) => t.stageStatus === "COMPLETED")) as any
  }
  if (cleanUrl.match(/\/task-instances\/\d+\/histories$/)) {
    const id = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const histories = MOCK_TASK_HISTORIES[id] || MOCK_TASK_HISTORIES[101] || []
    return wrapList(histories) as any
  }
  if (cleanUrl.match(/\/task-instances\/\d+\/status$/)) {
    const id = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const found = taskInstances.find((t) => t.id === id)
    if (found) {
      found.stageStatus = data?.stageStatus || "COMPLETED"
      if (found.stageStatus === "COMPLETED") {
        found.isDone = true
        found.completedAt = new Date().toISOString()
      }
    }
    return wrapItem(found || taskInstances[0]) as any
  }
  if (cleanUrl.match(/\/task-instances\/\d+\/evaluate$/)) {
    const id = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const found = taskInstances.find((t) => t.id === id)
    if (found) {
      found.evaluate = data?.evaluate
      if (data?.evaluate === "FAIL") {
        found.stageStatus = "REJECTED"
        found.evaluateReason = data?.evaluateReason
      } else {
        found.stageStatus = "COMPLETED"
      }
    }
    return wrapItem(found || taskInstances[0]) as any
  }
  if (cleanUrl.match(/\/task-instances\/\d+\/approve$/)) {
    const id = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const found = taskInstances.find((t) => t.id === id)
    if (found) {
      found.stageStatus = "APPROVED"
      found.evaluate = "PASS"
    }
    return wrapItem(found || taskInstances[0]) as any
  }
  if (cleanUrl.match(/\/task-instances\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const found = taskInstances.find((t) => t.id === id) || taskInstances[0]
    return wrapItem(found) as any
  }
  if (cleanUrl.endsWith("/task-instances/adhoc")) {
    const newAdhoc: any = {
      id: Date.now(),
      instance: MOCK_INSTANCES[0],
      taskItemId: data.taskItemId || 111,
      taskItemTitle: data.title || "Công việc phát sinh đột xuất",
      parentTaskInstanceId: null,
      title: data.title || "Công việc phát sinh đột xuất",
      description: data.description || "Mô tả việc phát sinh",
      category: "ADHOC",
      orderIndex: taskInstances.length + 1,
      approvalLevel: 1,
      stageStatus: "TODO",
      approvalStep: 0,
      requirements: [],
      attachments: [],
      isDone: false,
      metadata: { acc: {}, source: "ADHOC" },
      startTime: "07:30",
      endTime: "17:00",
      completedAt: null,
      slaDeadline: null,
      issueNote: null,
      reviewerUserId: 3,
      evaluate: null,
      evaluateReason: null,
      evaluatedAt: null,
      originTaskInstanceId: null,
      createdBy: 1,
      createdAt: new Date().toISOString(),
      histories: [],
      ...data,
    }
    taskInstances.unshift(newAdhoc)
    return wrapItem(newAdhoc) as any
  }
  if (cleanUrl.endsWith("/task-instances") || cleanUrl.endsWith("/task-instances/")) {
    return wrapList(taskInstances) as any
  }
  if (cleanUrl.endsWith("/instances") || cleanUrl.endsWith("/instances/")) {
    return wrapList(MOCK_INSTANCES) as any
  }

  // 9. TRACKING
  if (cleanUrl.match(/\/tracking\/sessions\/\d+\/points$/)) {
    const sId = Number(cleanUrl.split("/")[cleanUrl.split("/").length - 2])
    const pts = MOCK_TRACKING_POINTS[sId] || MOCK_TRACKING_POINTS[1] || []
    return wrapList(pts) as any
  }
  if (cleanUrl.match(/\/tracking\/sessions\/\d+$/)) {
    const id = Number(cleanUrl.split("/").pop())
    const s = MOCK_TRACKING_SESSIONS.find((sess) => sess.id === id) || MOCK_TRACKING_SESSIONS[0]
    return wrapItem(s) as any
  }
  if (cleanUrl.endsWith("/tracking/sessions")) {
    return wrapList(MOCK_TRACKING_SESSIONS) as any
  }

  // 10. ACC SYNC
  if (cleanUrl.endsWith("/acc/sync-logs")) {
    return wrapList(syncLogs) as any
  }
  if (cleanUrl.includes("/acc/sync/")) {
    const newLog = {
      id: Date.now(),
      sourceSystem: cleanUrl.split("/").pop()?.toUpperCase() || "ACC_ALL",
      triggerType: "MANUAL",
      status: "SUCCESS",
      startedAt: new Date().toISOString(),
      finishedAt: new Date(Date.now() + 60000).toISOString(),
      durationSeconds: 60,
      recordsCreated: 2,
      recordsUpdated: 5,
      createdAt: new Date().toISOString(),
    }
    syncLogs.unshift(newLog as any)
    return wrapItem(newLog) as any
  }

  // 11. REPORTS
  if (cleanUrl.endsWith("/reports/progress")) {
    return wrapItem(MOCK_PROGRESS_REPORT) as any
  }
  if (cleanUrl.endsWith("/reports/overdue")) {
    return wrapList(MOCK_OVERDUE_REPORT) as any
  }
  if (cleanUrl.endsWith("/reports/by-role")) {
    return wrapList(MOCK_ROLE_PERFORMANCE) as any
  }

  // 12. UPLOAD
  if (cleanUrl.endsWith("/upload")) {
    return wrapItem({
      fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800",
      fileName: "uploaded_image.jpg",
    }) as any
  }

  // Default fallback empty list / item
  return wrapList([]) as any
}
