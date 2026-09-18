import { sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { users } from "@/db"

export const managers = alias(users, "managers")
export const repUsers = alias(users, "repUsers")

export const buildProjectsSubquery = () => sql<any[]>`COALESCE(
  (
    SELECT json_agg(
      json_build_object(
        'id', up.id,
        'userId', up.user_id,
        'projectId', up.project_id,
        'roleId', up.role_id,
        'accessRoleId', up.access_role_id,
        'status', up.status,
        'project', row_to_json(p.*),
        'role', row_to_json(pr.*),
        'department', row_to_json(pd.*),
        'accessRole', row_to_json(par.*)
      )
    )
    FROM user_projects up
    INNER JOIN projects p ON up.project_id = p.id
    INNER JOIN roles pr ON up.role_id = pr.id
    LEFT JOIN departments pd ON pr.department_id = pd.id
    LEFT JOIN access_roles par ON up.access_role_id = par.id
    WHERE up.user_id = ${users.id} AND up.status = 'ACTIVE'
  ),
  '[]'::json
)`

export const formatUserRow = (row: any) => {
  const { passwordHash: _, ...rest } = row.user

  return {
    user: {
      ...rest,
      role: row.role,
      manager: row.manager,
      projects: row.projects,
    },
  }
}
