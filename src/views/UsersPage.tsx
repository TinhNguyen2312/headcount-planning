"use client"

import { Button, Input, Tabs } from "antd"
import { GitFork, Plus, Search, UserCheck, Users, UserX } from "lucide-react"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/Common/DataTable"
import { KpiGrid, type KpiItem } from "@/components/Common/KpiCard"
import PageContainer from "@/components/Common/PageContainer"
import { type UserTableData, useUserColumns } from "@/components/Users/columns"
import UserModal from "@/components/Users/UserModal"
import UserTree from "@/components/Users/UserTree"
import { userQueries } from "@/hooks/server/users"
import useAuth from "@/hooks/useAuth"
import { useListPageState } from "@/hooks/useListPageState"
import type { UserWithProjectsResponse } from "@/types"

interface UsersPageProps {
  activeTab: "list" | "hierarchy"
  onTabChange: (tab: "list" | "hierarchy") => void
}

export default function UsersPage({ activeTab, onTabChange }: UsersPageProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const { user: currentUser } = useAuth()

  const {
    keyword,
    setKeyword,
    debouncedKeyword,
    page,
    setPage,
    limit,
    setLimit,
    queryParams,
  } = useListPageState({
    persistKey: "users-page",
    initialLimit: 10,
    initialSort: { sort: { sortBy: "id", order: "ASC" } },
  })

  const effectiveKeyword = (debouncedKeyword || "").trim()

  const {
    data: userList = [],
    meta,
    isLoading,
    isFetching,
  } = userQueries.useList(
    {
      ...queryParams,
      keyword: effectiveKeyword || undefined,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  )

  const total = meta?.totalElements ?? userList.length

  const tableData: UserTableData[] = useMemo(
    () =>
      userList.map((user: UserWithProjectsResponse) => ({
        ...user,
        isCurrentUser: currentUser?.id === user.id,
      })),
    [userList, currentUser],
  )

  const userColumns = useUserColumns(tableData)

  const kpiItems: KpiItem[] = useMemo(() => {
    const totalCount = total
    const active = tableData.filter((u) => u.status === "ACTIVE").length
    const unassigned = tableData.filter(
      (u) => !u.projects || u.projects.length === 0,
    ).length
    return [
      {
        title: "Tổng nhân sự",
        value: totalCount,
        icon: Users,
        tone: "primary",
      },
      {
        title: "Đang hoạt động (Trang này)",
        value: active,
        icon: UserCheck,
        tone: "primary",
      },
      {
        title: "Chưa gán dự án",
        value: unassigned,
        icon: UserX,
        tone: unassigned > 0 ? "destructive" : "muted",
      },
    ]
  }, [tableData, total])

  const tabItems = [
    {
      key: "list",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="size-4" />
          Danh sách nhân sự
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder="Tìm kiếm theo tên, email, chức danh..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              prefix={<Search className="size-4 text-muted-foreground" />}
              className="max-w-md"
              allowClear
            />
          </div>
          <DataTable<UserTableData>
            columns={userColumns}
            dataSource={tableData}
            loading={isLoading || isFetching}
            totalItemLabel="nhân sự"
            scroll={{ y: "calc(100vh - 425px)" }}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              onChange: (newPage, newPageSize) => {
                setPage(newPage)
                setLimit(newPageSize)
              },
            }}
          />
        </div>
      ),
    },
    {
      key: "hierarchy",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <GitFork className="size-4" />
          Sơ đồ phân cấp
        </span>
      ),
      children: (
        <div className="pt-2">
          <UserTree disableZoneSelect />
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Quản lý nhân sự"
      containerClassName="flex flex-col gap-4 overflow-hidden"
      rightSlot={
        <>
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setIsAddUserOpen(true)}
          >
            Thêm nhân sự
          </Button>
          <UserModal
            open={isAddUserOpen}
            onCancel={() => setIsAddUserOpen(false)}
          />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <KpiGrid items={kpiItems} />
        <Tabs
          activeKey={activeTab}
          onChange={(key) => onTabChange(key as "list" | "hierarchy")}
          items={tabItems}
          className="w-full"
        />
      </div>
    </PageContainer>
  )
}
