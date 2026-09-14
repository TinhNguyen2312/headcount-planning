import dayjs from "dayjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { axios } from "@/lib/axios"
import { API_V1 } from "@/lib/config"
import { buildTaskTree, InstancesAPI } from "@/services/instances"
import type { TaskInstanceResponse } from "@/types"

vi.mock("@/lib/axios", () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("InstancesAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls GET /instances with today date and limit 100 when getToday has no args", async () => {
    const todayStr = dayjs().format("YYYY-MM-DD")
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await InstancesAPI.getToday()
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/instances`, {
      params: {
        workDate: todayStr,
        limit: 100,
      },
    })
  })

  it("calls GET /instances with specified workDate and filters in getToday", async () => {
    const params = {
      workDate: "2026-08-25",
      projectId: 2,
      assignedUserId: 15,
      limit: 50,
    }
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await InstancesAPI.getToday(params)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/instances`, {
      params: {
        workDate: "2026-08-25",
        limit: 50,
        projectId: 2,
        assignedUserId: 15,
      },
    })
  })

  it("calls GET /instances with query params in getAll", async () => {
    const params = { projectId: 5, status: "PENDING" as const }
    ;(axios.get as any).mockResolvedValue({ result: [] })

    await InstancesAPI.getAll(params)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/instances`, {
      params: {
        limit: 100,
        ...params,
      },
    })
  })

  it("calls GET /instances/{id} in getOne", async () => {
    ;(axios.get as any).mockResolvedValue({ result: { id: 42 } })

    await InstancesAPI.getOne(42)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/instances/42`)
  })

  it("calls PATCH /instances/{id}/status in updateStatus", async () => {
    const payload = { status: "COMPLETED" as const }
    ;(axios.patch as any).mockResolvedValue({ result: { id: 100 } })

    await InstancesAPI.updateStatus(100, payload)
    expect(axios.patch).toHaveBeenCalledWith(
      `${API_V1}/instances/100/status`,
      payload,
    )
  })

  it("builds a hierarchical task tree from flat task instances", () => {
    const flatTasks: TaskInstanceResponse[] = [
      {
        id: 1,
        instanceId: 10,
        taskItemId: 101,
        taskItemTitle: "Kiểm tra tủ điện",
        parentTaskInstanceId: null,
        title: "Root Task 1",
        description: null,
        category: "DAILY",
        orderIndex: 0,
        approvalLevel: 0,
        stageStatus: "TODO",
        approvalStep: 0,
        requirements: null,
        isDone: false,
        startTime: null,
        endTime: null,
        completedAt: null,
        slaDeadline: null,
        reviewerUserId: null,
        evaluate: null,
        evaluateReason: null,
        evaluatedAt: null,
        originTaskInstanceId: null,
        issueNote: null,
        createdBy: 1,
        createdAt: "2026-08-24T00:00:00Z",
      },
      {
        id: 2,
        instanceId: 10,
        taskItemId: 102,
        taskItemTitle: "Vệ sinh hành lang",
        parentTaskInstanceId: 1,
        title: "Child Task 1.1",
        description: null,
        category: "DAILY",
        orderIndex: 0,
        approvalLevel: 1,
        stageStatus: "TODO",
        approvalStep: 0,
        requirements: null,
        isDone: false,
        startTime: null,
        endTime: null,
        completedAt: null,
        slaDeadline: null,
        reviewerUserId: null,
        evaluate: null,
        evaluateReason: null,
        evaluatedAt: null,
        originTaskInstanceId: null,
        issueNote: null,
        createdBy: 1,
        createdAt: "2026-08-24T00:00:00Z",
      },
    ]

    const tree = buildTaskTree(flatTasks)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children[0].id).toBe(2)
  })

  it("fetches instance detail and returns tree structure in getTaskTree", async () => {
    const mockDetail = {
      id: 10,
      projectId: 1,
      roleId: 2,
      workDate: "2026-08-24",
      status: "PENDING",
      createdAt: "2026-08-24T00:00:00Z",
      taskInstances: [
        {
          id: 1,
          instanceId: 10,
          taskItemId: 101,
          parentTaskInstanceId: null,
          title: "Root Task",
          description: null,
          category: "DAILY",
          orderIndex: 0,
          approvalLevel: 0,
          stageStatus: "TODO",
          approvalStep: 0,
          requirements: null,
          isDone: false,
          startTime: null,
          endTime: null,
          completedAt: null,
          slaDeadline: null,
          reviewerUserId: null,
          evaluate: null,
          evaluateReason: null,
          evaluatedAt: null,
          issueNote: null,
          createdBy: 1,
          createdAt: "2026-08-24T00:00:00Z",
        },
      ],
    }
    ;(axios.get as any).mockResolvedValue({ result: mockDetail })

    const res = await InstancesAPI.getTaskTree(10)
    expect(axios.get).toHaveBeenCalledWith(`${API_V1}/instances/10`)
    expect(res.result).toHaveLength(1)
    expect(res.result[0].id).toBe(1)
    expect(res.result[0].children).toEqual([])
  })
})
