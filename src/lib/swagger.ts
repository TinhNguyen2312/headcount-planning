import { createSwaggerSpec } from "next-swagger-doc"

const TAG_DEFINITIONS = [
  {
    name: "Auth",
    description: "Xác thực, đăng nhập, đổi mật khẩu và phiên làm việc",
  },
  {
    name: "Projects",
    description: "Quản lý thông tin dự án bất động sản / công trình",
  },
  {
    name: "Sectors & Regions",
    description: "Quản lý khu vực (Sector) và vùng trực thuộc (Region)",
  },
  {
    name: "Departments",
    description: "Quản lý danh mục phòng ban và cây sơ đồ tổ chức",
  },
  {
    name: "Roles",
    description:
      "Quản lý danh mục chức vụ và cây phân cấp vai trò (React Flow)",
  },
  {
    name: "Users",
    description: "Quản lý hồ sơ nhân sự, tài khoản và phân quyền người dùng",
  },
  {
    name: "User Project Roles",
    description: "Phân bổ nhân sự vào dự án, bàn giao và quản lý thay thế",
  },
  { name: "Uploads", description: "Tải lên hình ảnh, tài liệu và minh chứng" },
]

const getTagForPath = (path: string): string => {
  if (path.startsWith("/api/auth")) return "Auth"
  if (path.startsWith("/api/projects")) return "Projects"
  if (path.startsWith("/api/sectors") || path.startsWith("/api/regions"))
    return "Sectors & Regions"
  if (path.startsWith("/api/departments")) return "Departments"
  if (path.startsWith("/api/roles")) return "Roles"
  if (path.startsWith("/api/user-project-roles")) return "User Project Roles"
  if (path.startsWith("/api/users")) return "Users"
  if (path.startsWith("/api/upload")) return "Uploads"
  return "General"
}

const ROUTE_METADATA: Record<
  string,
  Record<string, { summary: string; description?: string }>
> = {
  "/api/auth/login/local": {
    post: {
      summary: "Đăng nhập tài khoản nội bộ (Email / Password)",
      description:
        "Xác thực thông tin đăng nhập và cấp session cookie JSESSIONID",
    },
  },
  "/api/auth/me": {
    get: {
      summary: "Lấy thông tin người dùng đang đăng nhập",
      description:
        "Trả về thông tin hồ sơ và danh sách dự án / vai trò của session hiện tại",
    },
  },
  "/api/auth/logout": {
    post: {
      summary: "Đăng xuất khỏi hệ thống",
      description: "Huỷ session hiện tại và xoá cookie JSESSIONID",
    },
  },
  "/api/auth/change-password": {
    post: {
      summary: "Đổi mật khẩu tài khoản hiện tại",
      description: "Yêu cầu mật khẩu cũ và mật khẩu mới",
    },
  },
  "/api/projects": {
    get: {
      summary: "Danh sách dự án",
      description:
        "Lấy danh sách dự án có phân trang, lọc theo vùng, khu vực, trạng thái",
    },
    post: {
      summary: "Tạo dự án mới",
      description: "Khởi tạo một dự án mới trong hệ thống",
    },
  },
  "/api/projects/{id}": {
    get: {
      summary: "Chi tiết dự án",
      description: "Lấy thông tin chi tiết một dự án theo ID",
    },
    put: {
      summary: "Cập nhật dự án",
      description: "Cập nhật thông tin chi tiết của một dự án",
    },
    patch: {
      summary: "Cập nhật thông tin dự án",
      description: "Cập nhật thông tin chi tiết của một dự án",
    },
    delete: { summary: "Xoá dự án", description: "Xoá dự án khỏi hệ thống" },
  },
  "/api/sectors": {
    get: {
      summary: "Danh sách khu vực (Sectors)",
      description: "Lấy danh sách các khu vực hoạt động",
    },
    post: {
      summary: "Tạo mới khu vực (Sector)",
      description: "Thêm một khu vực mới",
    },
  },
  "/api/sectors/{id}": {
    get: {
      summary: "Chi tiết khu vực",
      description: "Lấy thông tin khu vực theo ID",
    },
    put: {
      summary: "Cập nhật khu vực",
      description: "Cập nhật mã và tên khu vực",
    },
    patch: {
      summary: "Cập nhật khu vực",
      description: "Cập nhật mã và tên khu vực",
    },
    delete: {
      summary: "Xoá khu vực",
      description: "Xoá khu vực khỏi hệ thống",
    },
  },
  "/api/regions": {
    get: {
      summary: "Danh sách vùng (Regions)",
      description: "Lấy danh sách các vùng trực thuộc khu vực",
    },
    post: {
      summary: "Tạo mới vùng (Region)",
      description: "Thêm một vùng mới gắn với Sector",
    },
  },
  "/api/regions/{id}": {
    get: {
      summary: "Chi tiết vùng",
      description: "Lấy thông tin chi tiết vùng theo ID",
    },
    put: {
      summary: "Cập nhật vùng",
      description: "Cập nhật tên, mã, mô tả của vùng",
    },
    patch: {
      summary: "Cập nhật vùng",
      description: "Cập nhật tên, mã, mô tả của vùng",
    },
    delete: { summary: "Xoá vùng", description: "Xoá vùng khỏi hệ thống" },
  },
  "/api/departments": {
    get: {
      summary: "Danh sách phòng ban",
      description: "Lấy danh sách phòng ban có phân trang",
    },
    post: {
      summary: "Tạo mới phòng ban",
      description: "Thêm một phòng ban mới",
    },
  },
  "/api/departments/tree": {
    get: {
      summary: "Cây sơ đồ tổ chức phòng ban",
      description: "Lấy cấu trúc phân cấp cây phòng ban",
    },
  },
  "/api/departments/{id}": {
    get: {
      summary: "Chi tiết phòng ban",
      description: "Lấy thông tin phòng ban theo ID",
    },
    put: {
      summary: "Cập nhật phòng ban",
      description: "Cập nhật thông tin phòng ban",
    },
    patch: {
      summary: "Cập nhật phòng ban",
      description: "Cập nhật thông tin phòng ban",
    },
    delete: {
      summary: "Xoá phòng ban",
      description: "Xoá phòng ban khỏi hệ thống",
    },
  },
  "/api/roles": {
    get: {
      summary: "Danh sách chức danh / chức vụ",
      description: "Lấy danh sách các vai trò chức danh",
    },
    post: {
      summary: "Tạo mới chức danh / chức vụ",
      description: "Thêm chức danh mới",
    },
  },
  "/api/roles/tree": {
    get: {
      summary: "Cây phân cấp chức danh",
      description: "Lấy cấu trúc cây chức danh phục vụ vẽ sơ đồ React Flow",
    },
  },
  "/api/roles/{id}": {
    get: {
      summary: "Chi tiết chức vụ",
      description: "Lấy thông tin chức vụ theo ID",
    },
    put: {
      summary: "Cập nhật chức vụ",
      description: "Cập nhật thông tin chức vụ",
    },
    patch: {
      summary: "Cập nhật chức vụ",
      description: "Cập nhật thông tin chức vụ",
    },
    delete: {
      summary: "Xoá chức vụ",
      description: "Xoá chức vụ khỏi hệ thống",
    },
  },
  "/api/users": {
    get: {
      summary: "Danh sách người dùng / nhân sự",
      description: "Lấy danh sách người dùng có phân trang và bộ lọc",
    },
    post: {
      summary: "Tạo người dùng mới",
      description: "Tạo tài khoản người dùng mới",
    },
  },
  "/api/users/local": {
    post: {
      summary: "Tạo tài khoản người dùng nội bộ",
      description: "Khởi tạo nhanh tài khoản với mật khẩu",
    },
  },
  "/api/users/tree": {
    get: {
      summary: "Cây nhân sự theo quản lý",
      description: "Lấy cấu trúc phân cấp nhân viên theo quản lý trực tiếp",
    },
  },
  "/api/users/{id}": {
    get: {
      summary: "Chi tiết người dùng",
      description: "Lấy thông tin chi tiết của người dùng theo ID",
    },
    put: {
      summary: "Cập nhật người dùng",
      description: "Cập nhật thông tin hồ sơ người dùng",
    },
    patch: {
      summary: "Cập nhật người dùng",
      description: "Cập nhật thông tin hồ sơ người dùng",
    },
    delete: {
      summary: "Xoá người dùng",
      description: "Xoá người dùng khỏi hệ thống",
    },
  },
  "/api/users/{id}/role": {
    put: {
      summary: "Cập nhật vai trò hệ thống",
      description: "Thay đổi systemRole (SUPER_ADMIN, ADMIN, USER,...)",
    },
    patch: {
      summary: "Cập nhật vai trò hệ thống",
      description: "Thay đổi systemRole (SUPER_ADMIN, ADMIN, USER,...)",
    },
  },
  "/api/users/{id}/block": {
    post: {
      summary: "Khoá / Mở khoá tài khoản",
      description: "Chuyển trạng thái ACTIVE / BLOCKED của tài khoản",
    },
    patch: {
      summary: "Khoá / Mở khoá tài khoản",
      description: "Chuyển trạng thái ACTIVE / BLOCKED của tài khoản",
    },
  },
  "/api/users/{id}/reset-password": {
    post: {
      summary: "Đặt lại mật khẩu người dùng",
      description: "Quản trị viên đặt lại mật khẩu cho tài khoản",
    },
  },
  "/api/users/{id}/project-roles": {
    get: {
      summary: "Danh sách dự án của người dùng",
      description: "Lấy các dự án và vai trò mà người dùng đang đảm nhiệm",
    },
    post: {
      summary: "Gán dự án cho người dùng",
      description: "Gán người dùng vào dự án với vai trò cụ thể",
    },
  },
  "/api/user-project-roles": {
    get: {
      summary: "Danh sách gán nhân sự vào dự án",
      description: "Lấy danh sách các phân bổ nhân sự vào dự án",
    },
    post: {
      summary: "Gán nhân sự vào dự án",
      description: "Thêm phân bổ nhân sự với vai trò cụ thể trong dự án",
    },
  },
  "/api/user-project-roles/{id}": {
    get: {
      summary: "Chi tiết phân bổ nhân sự",
      description: "Lấy chi tiết bản ghi phân bổ dự án theo ID",
    },
    put: {
      summary: "Cập nhật phân bổ nhân sự",
      description: "Cập nhật vai trò hoặc thời hạn tham gia dự án",
    },
    patch: {
      summary: "Cập nhật phân bổ nhân sự",
      description: "Cập nhật vai trò hoặc thời hạn tham gia dự án",
    },
    delete: {
      summary: "Xoá phân bổ nhân sự",
      description: "Xoá nhân sự khỏi dự án",
    },
  },
  "/api/user-project-roles/{id}/assign-replacement": {
    post: {
      summary: "Bàn giao / Chỉ định người thay thế",
      description: "Chỉ định nhân sự thay thế cho một vị trí trong dự án",
    },
  },
  "/api/user-project-roles/{id}/cancel-replacement": {
    post: {
      summary: "Huỷ chỉ định người thay thế",
      description: "Huỷ bỏ quyết định thay thế nhân sự trong dự án",
    },
  },
  "/api/upload": {
    post: {
      summary: "Tải tệp tin lên hệ thống",
      description: "Upload hình ảnh hoặc tài liệu và nhận URL tệp tin",
    },
  },
}

export const getApiDocs = async () => {
  const spec: any = createSwaggerSpec({
    apiFolder: "src/app/api",
    autoDoc: true,
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Headcount Planning API",
        version: "1.0.0",
        description:
          "Tài liệu API hệ thống Quản lý Kế hoạch Nhân sự (Next.js Fullstack + Supabase)",
      },
      tags: TAG_DEFINITIONS,
      servers: [
        {
          url: "",
          description: "Current Server",
        },
      ],
      components: {
        securitySchemes: {
          CookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "JSESSIONID",
            description: "Session Cookie xác thực người dùng",
          },
        },
      },
      security: [
        {
          CookieAuth: [],
        },
      ],
    },
  })

  // Remove internal doc endpoint from swagger paths
  if (spec.paths && spec.paths["/api/doc"]) {
    delete spec.paths["/api/doc"]
  }

  // Enrich each operation with tags, summaries, and descriptions
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    const defaultTag = getTagForPath(path)
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      if (typeof op === "object" && op !== null) {
        // Group by tag
        if (!op.tags || op.tags.length === 0) {
          op.tags = [defaultTag]
        }

        // Apply human-friendly summary & description if available
        const meta = ROUTE_METADATA[path]?.[method.toLowerCase()]
        if (meta) {
          if (meta.summary) op.summary = meta.summary
          if (meta.description) op.description = meta.description
        }
      }
    }
  }

  return spec
}
