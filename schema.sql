-- =========================================================================
-- SCHEMA DATABASE: HỆ THỐNG ĐỊNH BIÊN NHÂN SỰ (HEADCOUNT PLANNING)
-- Khớp đồng bộ 100% với Drizzle ORM Schema (drizzle/schema.ts)
-- =========================================================================

-- 1. Phòng ban / Cơ cấu tổ chức
CREATE TABLE departments (
    id SERIAL PRIMARY KEY, -- Khóa chính
    code VARCHAR(50) NOT NULL UNIQUE, -- Mã đơn vị (sync từ Nova Hub)
    name VARCHAR(255) NOT NULL, -- Tên đơn vị
    type VARCHAR(50) NOT NULL DEFAULT 'Department', -- Loại đơn vị (Division, Department, Team...)
    level INT NOT NULL DEFAULT 1, -- Cấp bậc phân tầng
    parent_id INT REFERENCES departments(id) ON DELETE RESTRICT, -- ID đơn vị cha
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')), -- Trạng thái hoạt động
    start_date DATE, -- Ngày bắt đầu hiệu lực
    end_date DATE, -- Ngày hết hiệu lực
    path TEXT, -- Đường dẫn cây (vd: /1/4/12/)
    description TEXT, -- Mô tả chi tiết
    metadata JSONB, -- Dữ liệu mở rộng JSON
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now() -- Thời điểm cập nhật
);

-- 2. Khu vực (Sector)
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. Vùng dự án (Region) - 1 Khu vực có thể có nhiều Vùng
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    sector_id INT NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. Chức danh định biên (Roles)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    short_code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    parent_role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT,
    department_id INT REFERENCES departments(id) ON DELETE RESTRICT,
    planning_method VARCHAR(20) DEFAULT 'BY_PROJECT' CHECK (planning_method IN ('BY_SECTOR', 'BY_REGION', 'BY_PROJECT')), -- Phương thức chạy ĐB: Theo Khu vực, Vùng, hay Dự án
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. Người dùng / Nhân sự (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    system_role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (system_role IN ('USER', 'SUPER_ADMIN')),
    per_number VARCHAR(50) UNIQUE,
    novator_status INT DEFAULT 0,
    department_code VARCHAR(50),
    division_code VARCHAR(50),
    manager_per_number VARCHAR(50),
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    azure_oid VARCHAR(100) UNIQUE,
    last_login_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 6. Phiên đăng nhập (Sessions)
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 7. Dự án (Projects)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    general_info TEXT,
    region_id INT REFERENCES regions(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    start_date DATE,
    end_date DATE,
    thumbnail TEXT,
    project_types JSONB NOT NULL DEFAULT '["HIGH_RISE"]'::jsonb, -- Loại hình phát triển: LOW_RISE, HIGH_RISE, MIXED
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 8. Khai báo danh sách Dự án tham gia chạy định biên nhân sự
CREATE TABLE headcount_projects (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 9. Cơ sở định biên / Thuộc tính quy mô (Properties)
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- Mã thuộc tính
    name VARCHAR(150) NOT NULL, -- Tên thuộc tính
    data_type VARCHAR(20) NOT NULL DEFAULT 'NUMBER' CHECK (data_type IN ('NUMBER', 'STRING', 'BOOLEAN', 'SELECT')), -- Kiểu dữ liệu
    unit VARCHAR(20), -- Đơn vị tính
    options JSONB, -- Lựa chọn nếu là SELECT
    description TEXT, -- Diễn giải
    scope VARCHAR(20) NOT NULL DEFAULT 'COMMON' CHECK (scope IN ('COMMON', 'PER_TYPE', 'LOW_RISE_ONLY', 'HIGH_RISE_ONLY')), -- Phạm vi áp dụng theo loại hình
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái kích hoạt
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 10. Bảng liên kết nhiều-nhiều giữa Thuộc tính định biên và Phòng ban (Property Departments)
CREATE TABLE property_departments (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (property_id, department_id)
);

-- 11. Giá trị thuộc tính quy mô theo từng Dự án (Property Values)
CREATE TABLE property_values (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    project_type VARCHAR(50), -- Loại hình dự án (LOW_RISE, HIGH_RISE, null nếu COMMON)
    value_text TEXT, -- Giá trị chuỗi
    value_number NUMERIC(15, 4), -- Giá trị số
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (project_id, property_id, project_type)
);

-- 12. Phân bổ nhân sự vào dự án (User Projects)
CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ENDED')),
    replacement_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    replacement_from DATE,
    replacement_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, project_id, role_id, effective_from)
);

-- 13. Mốc chuẩn dự án (Milestones)
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 14. Quan hệ phụ thuộc giữa các Mốc chuẩn (Milestone Dependencies)
CREATE TABLE milestone_dependencies (
    id SERIAL PRIMARY KEY,
    from_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    to_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) NOT NULL DEFAULT 'FINISH_TO_START',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (from_milestone_id, to_milestone_id)
);

-- 15. Phiên bản Kế hoạch tiến độ Dự án (Plans)
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    valid_from DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (project_id, version_name)
);

-- 16. Các giai đoạn / mốc trong Kế hoạch tiến độ (Phases)
CREATE TABLE phases (
    id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_months INT NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (plan_id, milestone_id)
);

-- 17. Khung định biên chuẩn (Headcount Standards)
CREATE TABLE headcount_standards (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    from_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    to_milestone_id INT REFERENCES milestones(id) ON DELETE SET NULL,
    headcount NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
    headcount_min NUMERIC(10, 4),
    headcount_max NUMERIC(10, 4),
    note TEXT,
    from_lead_time_months INT NOT NULL DEFAULT 0, -- Số tháng lead time trước mốc bắt đầu
    to_lead_time_months INT NOT NULL DEFAULT 0, -- Số tháng lead time trước mốc kết thúc
    duration_months INT NOT NULL DEFAULT 12, -- Thời lượng áp dụng tiêu chuẩn
    monthly_factors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Mảng hệ số phân bổ từng tháng
    project_type VARCHAR(30) NOT NULL DEFAULT 'ALL' CHECK (project_type IN ('ALL', 'LOW_RISE', 'HIGH_RISE', 'MIXED')), -- Áp dụng theo loại hình dự án
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 18. Tiêu chí ràng buộc quy mô theo Khung định biên (Headcount Criteria)
CREATE TABLE headcount_criteria (
    id SERIAL PRIMARY KEY,
    standard_id INT NOT NULL REFERENCES headcount_standards(id) ON DELETE CASCADE,
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    condition_operator VARCHAR(20) NOT NULL DEFAULT 'BETWEEN' CHECK (condition_operator IN ('=', '<', '<=', '>', '>=', 'BETWEEN')),
    min_value NUMERIC(15, 4),
    max_value NUMERIC(15, 4),
    value_text TEXT,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (standard_id, property_id, min_value, max_value)
);

-- 19. Hệ số phân bổ định biên theo tháng trong giai đoạn (Headcount Monthly Factors)
CREATE TABLE headcount_monthly_factors (
    id SERIAL PRIMARY KEY,
    standard_id INT NOT NULL REFERENCES headcount_standards(id) ON DELETE CASCADE,
    duration_months INT NOT NULL,
    month_no INT NOT NULL,
    factor NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (standard_id, duration_months, month_no)
);