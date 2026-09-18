import { alias } from "drizzle-orm/pg-core"
import {
  accessRoles,
  departments,
  projects,
  roles,
  userProjects,
  users,
} from "@/db"

export const repUsers = alias(users, "repUsers")

export const formatUserProjectRoleRow = (row: any) => ({
  userProject: {
    ...row.userProject,
    project: row.project,
    role: row.role,
    department: row.department,
    accessRole: row.accessRole,
    user: row.user,
    replacementUser: row.replacementUser,
  },
})

export const userProjectRoleSelection = {
  userProject: userProjects,
  project: projects,
  role: roles,
  department: departments,
  accessRole: accessRoles,
  user: users,
  replacementUser: repUsers,
}
