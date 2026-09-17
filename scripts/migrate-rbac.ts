import * as dotenv from "dotenv"
dotenv.config()
import postgres from "postgres"

let connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || ""

if (connectionString.includes("pooler.supabase.com:5432")) {
  connectionString = connectionString.replace(":5432", ":6543")
}

if (!connectionString) {
  console.error("LỖI: DATABASE_URL hoặc SUPABASE_POSTGRES_URL chưa được cấu hình!")
  process.exit(1)
}

const sql = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 1,
})

async function runMigration() {
  console.log("🚀 Bắt đầu thực thi Migration & Seed RBAC...")

  try {
    // 1. Tạo bảng permissions
    console.log("-> 1. Tạo bảng permissions...")
    await sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id          SERIAL PRIMARY KEY,
        key         VARCHAR(100) NOT NULL UNIQUE,
        label       VARCHAR(150) NOT NULL,
        group_name  VARCHAR(50)  NOT NULL,
        scope       VARCHAR(20)  NOT NULL DEFAULT 'PROJECT',
        description TEXT,
        created_at  TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT permissions_scope_check
            CHECK (scope IN ('GLOBAL', 'PROJECT'))
      );
    `

    // 2. Tạo bảng access_roles
    console.log("-> 2. Tạo bảng access_roles...")
    await sql`
      CREATE TABLE IF NOT EXISTS access_roles (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        scope       VARCHAR(20)  NOT NULL DEFAULT 'PROJECT',
        is_system   BOOLEAN      NOT NULL DEFAULT false,
        description TEXT,
        created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT now(),
        updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT access_roles_scope_check
            CHECK (scope IN ('GLOBAL', 'PROJECT'))
      );
    `

    // 3. Tạo bảng access_role_permissions
    console.log("-> 3. Tạo bảng access_role_permissions...")
    await sql`
      CREATE TABLE IF NOT EXISTS access_role_permissions (
        access_role_id INTEGER NOT NULL REFERENCES access_roles(id) ON DELETE CASCADE,
        permission_id  INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (access_role_id, permission_id)
      );
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_arp_permission 
      ON access_role_permissions(permission_id);
    `

    // 4. Tạo bảng user_access_roles
    console.log("-> 4. Tạo bảng user_access_roles...")
    await sql`
      CREATE TABLE IF NOT EXISTS user_access_roles (
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_role_id INTEGER NOT NULL REFERENCES access_roles(id) ON DELETE CASCADE,
        granted_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
        granted_at     TIMESTAMP NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, access_role_id)
      );
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_uar_access_role 
      ON user_access_roles(access_role_id);
    `

    // 5. Cập nhật bảng user_projects
    console.log("-> 5. Cập nhật bảng user_projects...")
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_projects' AND column_name = 'access_role_id'
        ) THEN
          ALTER TABLE user_projects
            ADD COLUMN access_role_id INTEGER
            REFERENCES access_roles(id) ON DELETE RESTRICT;
        END IF;
      END $$;
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_projects_access_role 
      ON user_projects(access_role_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_projects_lookup
      ON user_projects(user_id, status, effective_from, effective_to);
    `

    // 6. Seed Permissions khởi đầu
    console.log("-> 6. Seed danh sách Permissions...")
    await sql`
      INSERT INTO permissions (key, label, group_name, scope) VALUES
        ('project.view',              'Xem dự án',                'Dự án',       'PROJECT'),
        ('project.update',            'Sửa dự án',                'Dự án',       'PROJECT'),
        ('project.delete',            'Xóa dự án',                'Dự án',       'PROJECT'),
        ('project.create',            'Tạo dự án',                'Dự án',       'GLOBAL'),
        ('project.assignment.manage', 'Phân công nhân sự dự án',  'Dự án',       'PROJECT'),
        ('plan.view',                 'Xem kế hoạch',             'Kế hoạch',    'PROJECT'),
        ('plan.create',               'Tạo kế hoạch',             'Kế hoạch',    'PROJECT'),
        ('plan.update',               'Sửa kế hoạch',             'Kế hoạch',    'PROJECT'),
        ('plan.approve',              'Duyệt kế hoạch',           'Kế hoạch',    'PROJECT'),
        ('plan.archive',              'Lưu trữ kế hoạch',         'Kế hoạch',    'PROJECT'),
        ('headcount.standard.manage', 'Quản lý định mức nhân sự', 'Định mức',    'GLOBAL'),
        ('catalog.manage',            'Quản lý danh mục',         'Danh mục',    'GLOBAL'),
        ('user.view',                 'Xem người dùng',           'Người dùng',  'GLOBAL'),
        ('user.manage',               'Quản lý người dùng',       'Người dùng',  'GLOBAL'),
        ('access.role.manage',        'Quản lý phân quyền',       'Phân quyền',  'GLOBAL')
      ON CONFLICT (key) DO NOTHING;
    `

    // 7. Seed System Access Roles
    console.log("-> 7. Seed System Access Roles...")
    await sql`
      INSERT INTO access_roles (name, scope, is_system, description) VALUES
        ('Quản trị hệ thống', 'GLOBAL',  true, 'Toàn quyền quản trị cấu hình và người dùng'),
        ('Người xem dự án',   'PROJECT', true, 'Chỉ xem thông tin và kế hoạch dự án'),
        ('Người lập kế hoạch','PROJECT', true, 'Tạo và chỉnh sửa kế hoạch'),
        ('Người duyệt kế hoạch','PROJECT', true, 'Duyệt và lưu trữ kế hoạch')
      ON CONFLICT (name) DO NOTHING;
    `

    // 8. Gán Permissions cho System Access Roles
    console.log("-> 8. Gán Permissions vào Access Roles...")
    await sql`
      INSERT INTO access_role_permissions (access_role_id, permission_id)
      SELECT r.id, p.id FROM access_roles r, permissions p
      WHERE r.name = 'Quản trị hệ thống' AND p.scope = 'GLOBAL'
      ON CONFLICT (access_role_id, permission_id) DO NOTHING;
    `

    await sql`
      INSERT INTO access_role_permissions (access_role_id, permission_id)
      SELECT r.id, p.id FROM access_roles r, permissions p
      WHERE r.name = 'Người xem dự án' AND p.key IN ('project.view', 'plan.view')
      ON CONFLICT (access_role_id, permission_id) DO NOTHING;
    `

    await sql`
      INSERT INTO access_role_permissions (access_role_id, permission_id)
      SELECT r.id, p.id FROM access_roles r, permissions p
      WHERE r.name = 'Người lập kế hoạch'
        AND p.key IN ('project.view', 'plan.view', 'plan.create', 'plan.update')
      ON CONFLICT (access_role_id, permission_id) DO NOTHING;
    `

    await sql`
      INSERT INTO access_role_permissions (access_role_id, permission_id)
      SELECT r.id, p.id FROM access_roles r, permissions p
      WHERE r.name = 'Người duyệt kế hoạch'
        AND p.key IN ('project.view', 'plan.view', 'plan.approve', 'plan.archive')
      ON CONFLICT (access_role_id, permission_id) DO NOTHING;
    `

    console.log("✅ Migration & Seed RBAC hoàn tất thành công 100%!")
  } catch (error) {
    console.error("❌ Lỗi khi chạy migration:", error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
