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

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    short_code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    parent_role_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT,
    department_id INT REFERENCES departments(id) ON DELETE RESTRICT,
    planning_method VARCHAR(20) DEFAULT 'BY_PROJECT' CHECK (planning_method IN ('BY_SECTOR', 'BY_REGION', 'BY_PROJECT')), -- Phương thức chạy ĐB: Theo Khu vực (01), Vùng (02), hay Dự án (03)
    lead_time_months INT NOT NULL DEFAULT 0, -- Số tháng chuẩn bị tuyển dụng trước khi bắt đầu mốc/giai đoạn (ví dụ: KTS thiết kế ý tưởng cần trước 4 tháng, GĐ PCD cần trước 1 tháng)
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

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


-- Khu vực (Sector)
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Vùng dự án (Region) - 1 Khu vực có thể có nhiều Vùng
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    sector_id INT NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

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
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Khai báo danh sách Dự án tham gia chạy định biên nhân sự (tách biệt Bounded Context)
CREATE TABLE headcount_projects (
    id SERIAL PRIMARY KEY, -- Khóa chính
    project_id INT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE, -- Dự án được kích hoạt chạy định biên
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái kích hoạt chạy định biên
    note TEXT, -- Ghi chú
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm kích hoạt
    updated_at TIMESTAMP NOT NULL DEFAULT now() -- Thời điểm cập nhật
);

CREATE TABLE properties (
    id SERIAL PRIMARY KEY, -- Khóa chính
    code VARCHAR(50) NOT NULL UNIQUE, -- Mã thuộc tính
    name VARCHAR(150) NOT NULL, -- Tên thuộc tính
    data_type VARCHAR(20) NOT NULL DEFAULT 'NUMBER' CHECK (data_type IN ('NUMBER', 'STRING', 'BOOLEAN', 'SELECT')), -- Kiểu dữ liệu
    unit VARCHAR(20), -- Đơn vị tính
    options JSONB, -- Lựa chọn nếu là SELECT
    role_id INT REFERENCES roles(id) ON DELETE SET NULL, -- Chức danh áp dụng (NULL nếu là chung)
    description TEXT, -- Diễn giải
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái kích hoạt
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now() -- Thời điểm cập nhật
);

CREATE TABLE property_values (
    id SERIAL PRIMARY KEY, -- Khóa chính
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- Thuộc dự án
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT, -- Thuộc tính
    project_type VARCHAR(50), -- Loại hình dự án
    value_text TEXT, -- Giá trị chuỗi
    value_number NUMERIC(15, 4), -- Giá trị số
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (project_id, property_id, project_type)
);

CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY, -- Khóa chính
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Nhân sự
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- Dự án phụ trách
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT, -- Chức danh đảm nhiệm
    is_primary BOOLEAN NOT NULL DEFAULT true, -- Có phải dự án chính không
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày bắt đầu hiệu lực
    effective_to DATE, -- Ngày kết thúc hiệu lực
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ENDED')), -- Trạng thái gán (ACTIVE, ENDED)
    replacement_user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Nhân sự thay thế (nếu có)
    replacement_from DATE, -- Ngày bắt đầu thay thế
    replacement_to DATE, -- Ngày kết thúc thay thế
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (user_id, project_id, role_id, effective_from)
);

CREATE TABLE milestones (
    id SERIAL PRIMARY KEY, -- Khóa chính
    code VARCHAR(50) NOT NULL UNIQUE, -- Mã mốc chuẩn
    name VARCHAR(200) NOT NULL, -- Tên mốc chuẩn
    description TEXT, -- Diễn giải
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái kích hoạt
    created_at TIMESTAMP NOT NULL DEFAULT now() -- Thời điểm tạo
);

CREATE TABLE milestone_dependencies (
    id SERIAL PRIMARY KEY, -- Khóa chính
    from_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE, -- Mốc điều kiện (phải hoàn thành trước)
    to_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE, -- Mốc kế tiếp (chỉ thực hiện sau)
    dependency_type VARCHAR(20) NOT NULL DEFAULT 'FINISH_TO_START', -- Loại phụ thuộc
    description TEXT, -- Diễn giải lý do phụ thuộc
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    UNIQUE (from_milestone_id, to_milestone_id)
);

CREATE TABLE plans (
    id SERIAL PRIMARY KEY, -- Khóa chính
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, -- Thuộc dự án nào
    version_name VARCHAR(50) NOT NULL, -- Tên/Mã phiên bản kế hoạch (01, 02...)
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')), -- Trạng thái phiên bản
    valid_from DATE NOT NULL, -- Ngày bắt đầu hiệu lực áp dụng
    note TEXT, -- Ghi chú lý do lập/điều chỉnh kế hoạch
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (project_id, version_name)
);

CREATE TABLE phases (
    id SERIAL PRIMARY KEY, -- Khóa chính
    plan_id INT NOT NULL REFERENCES plans(id) ON DELETE CASCADE, -- Thuộc phiên bản kế hoạch nào
    order_index INT NOT NULL DEFAULT 0, -- Thứ tự bước thực hiện (1, 2, 3...)
    milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT, -- Mốc chuẩn đạt được khi kết thúc giai đoạn
    start_month INT NOT NULL DEFAULT 1, -- Tháng bắt đầu của giai đoạn (tính từ tháng khởi đầu dự án, hỗ trợ gối đầu/chạy song song)
    duration_months INT NOT NULL DEFAULT 1, -- Thời lượng số tháng (chuẩn hóa tròn tháng theo quy định tập đoàn)
    is_anchor BOOLEAN NOT NULL DEFAULT false, -- Đánh dấu mốc cam kết quan trọng (cần cảnh báo nếu bị trễ)
    description TEXT, -- Diễn giải chi tiết
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (plan_id, milestone_id)
);

CREATE TABLE headcount_standards (
    id SERIAL PRIMARY KEY, -- Khóa chính
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- Chức danh chạy định biên
    from_milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE, -- Mốc bắt đầu
    to_milestone_id INT REFERENCES milestones(id) ON DELETE SET NULL, -- Mốc kết thúc (nếu là giai đoạn từ mốc A đến mốc B)
    headcount NUMERIC(10, 4) NOT NULL DEFAULT 1.0, -- Định biên chuẩn gợi ý ban đầu (baseline mặc định)
    headcount_min NUMERIC(10, 4), -- Ngưỡng sàn ràng buộc khi điều chỉnh nhân sự theo tháng
    headcount_max NUMERIC(10, 4), -- Ngưỡng trần ràng buộc khi điều chỉnh nhân sự theo tháng
    note TEXT, -- Ghi chú nghiệp vụ
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now() -- Thời điểm cập nhật
);

CREATE TABLE headcount_criteria (
    id SERIAL PRIMARY KEY, -- Khóa chính
    standard_id INT NOT NULL REFERENCES headcount_standards(id) ON DELETE CASCADE, -- Thuộc khung định biên nào
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT, -- Thuộc tính quy mô đo lường (số học)
    condition_operator VARCHAR(20) NOT NULL DEFAULT 'BETWEEN' CHECK (condition_operator IN ('=', '<', '<=', '>', '>=', 'BETWEEN')), -- Toán tử so sánh điều kiện
    min_value NUMERIC(15, 4), -- Cận dưới giá trị quy mô
    max_value NUMERIC(15, 4), -- Cận trên giá trị quy mô
    note TEXT, -- Ghi chú điều kiện
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (standard_id, property_id, min_value, max_value)
);

CREATE TABLE headcount_monthly_factors (
    id SERIAL PRIMARY KEY, -- Khóa chính
    standard_id INT NOT NULL REFERENCES headcount_standards(id) ON DELETE CASCADE, -- Thuộc khung định biên nào
    duration_months INT NOT NULL, -- Số tháng thực hiện của giai đoạn (ví dụ: 6 tháng, 7 tháng...)
    month_no INT NOT NULL, -- Tháng thứ mấy trong giai đoạn (1, 2, ... duration_months)
    factor NUMERIC(10, 2) NOT NULL DEFAULT 1.0, -- Hệ số tối ưu T (ví dụ: 0.5, 1.0...)
    created_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm tạo
    updated_at TIMESTAMP NOT NULL DEFAULT now(), -- Thời điểm cập nhật
    UNIQUE (standard_id, duration_months, month_no)
);