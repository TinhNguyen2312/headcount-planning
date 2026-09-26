import type {
  ProjectMemberResponse,
  ProjectResponse,
  ZoneResponse,
} from "@/types"

export const MOCK_ZONES_PROJECT_1: ZoneResponse[] = [
  {
    id: 1,
    projectId: 1,
    name: "Phân khu 1 - Florida",
    code: "PK1",
    startTime: "07:30",
    endTime: "17:00",
    breakStartTime: "11:30",
    breakEndTime: "13:00",
    violationWarningSeconds: 1800,
    violationEscalationSeconds: 3600,
    boundaryGeojson: {
      type: "Polygon",
      coordinates: [
        [
          [108.0645, 10.8752],
          [108.0821, 10.8752],
          [108.0821, 10.8589],
          [108.0645, 10.8589],
          [108.0645, 10.8752],
        ],
      ],
    },
    createdBy: 1,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: 2,
    projectId: 1,
    name: "Phân khu 2 - Santa Monica",
    code: "PK2",
    startTime: "07:30",
    endTime: "17:00",
    breakStartTime: "11:30",
    breakEndTime: "13:00",
    violationWarningSeconds: 1800,
    violationEscalationSeconds: 3600,
    boundaryGeojson: {
      type: "Polygon",
      coordinates: [
        [
          [108.0821, 10.8752],
          [108.095, 10.8752],
          [108.095, 10.8589],
          [108.0821, 10.8589],
          [108.0821, 10.8752],
        ],
      ],
    },
    createdBy: 1,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: 3,
    projectId: 1,
    name: "Phân khu 3 - PGA Golf Villas",
    code: "PK3",
    startTime: "07:30",
    endTime: "17:00",
    breakStartTime: "11:30",
    breakEndTime: "13:00",
    violationWarningSeconds: 1800,
    violationEscalationSeconds: 3600,
    boundaryGeojson: {
      type: "Polygon",
      coordinates: [
        [
          [108.0645, 10.8589],
          [108.0821, 10.8589],
          [108.0821, 10.845],
          [108.0645, 10.845],
          [108.0645, 10.8589],
        ],
      ],
    },
    createdBy: 1,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
]

export const MOCK_PROJECTS: ProjectResponse[] = [
  {
    id: 1,
    name: "NovaWorld Phan Thiết",
    generalInfo: "Đại đô thị Du lịch - Nghỉ dưỡng - Giải trí quy mô 1.000 ha tại Phan Thiết, Bình Thuận.",
    address: "Đường Lạc Long Quân, Xã Tiến Thành, TP. Phan Thiết, Tỉnh Bình Thuận",
    region: "VUNG_PHAN_THIET_1",
    sector: "KHU_VUC_1",
    status: "ACTIVE",
    startDate: "2023-01-01",
    endDate: "2027-12-31",
    createdAt: "2023-01-01T08:00:00Z",
    projectAdmins: [
      {
        userId: 1,
        fullName: "Trần Văn An",
        phone: "0901234567",
        email: "an.tran@novaland.com.vn",
        perNumber: "NVL-001980",
      },
      {
        userId: 2,
        fullName: "Nguyễn Văn Bình",
        phone: "0901234568",
        email: "binh.nguyen@novaland.com.vn",
        perNumber: "NVL-002104",
      },
    ],
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
    boundaryGeojson: {
      type: "Polygon",
      coordinates: [
        [
          [108.0645, 10.8752],
          [108.0821, 10.8752],
          [108.0821, 10.8589],
          [108.0645, 10.8589],
          [108.0645, 10.8752],
        ],
      ],
    },
    zones: MOCK_ZONES_PROJECT_1,
  },
  {
    id: 2,
    name: "Aqua City Đồng Nai",
    generalInfo: "Đô thị sinh thái thông minh phía Đông TP.HCM, bao bọc bởi hệ thống sông ngòi tự nhiên.",
    address: "Xã Long Hưng, TP. Biên Hòa, Tỉnh Đồng Nai",
    region: "VUNG_DONG_NAI_1",
    sector: "KHU_VUC_2",
    status: "ACTIVE",
    startDate: "2023-06-01",
    endDate: "2026-12-31",
    createdAt: "2023-06-01T08:00:00Z",
    projectAdmins: [
      {
        userId: 1,
        fullName: "Trần Văn An",
        phone: "0901234567",
        email: "an.tran@novaland.com.vn",
        perNumber: "NVL-001980",
      },
    ],
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    boundaryGeojson: {
      type: "Polygon",
      coordinates: [
        [
          [106.8452, 10.8921],
          [106.8621, 10.8921],
          [106.8621, 10.8745],
          [106.8452, 10.8745],
          [106.8452, 10.8921],
        ],
      ],
    },
    zones: [
      {
        id: 4,
        projectId: 2,
        name: "Đảo Phượng Hoàng (Phoenix)",
        code: "PK-PH",
        startTime: "08:00",
        endTime: "17:30",
        breakStartTime: "11:30",
        breakEndTime: "13:00",
        violationWarningSeconds: 1800,
        violationEscalationSeconds: 3600,
        boundaryGeojson: {
          type: "Polygon",
          coordinates: [
            [
              [106.8452, 10.8921],
              [106.8621, 10.8921],
              [106.8621, 10.8745],
              [106.8452, 10.8745],
              [106.8452, 10.8921],
            ],
          ],
        },
        createdBy: 1,
        createdAt: "2024-01-01T08:00:00Z",
        updatedAt: "2024-01-01T08:00:00Z",
      },
    ],
  },
  {
    id: 3,
    name: "EcoPark Grand Hanoi",
    generalInfo: "Tổ hợp biệt thự đảo sinh thái phân khúc hạng sang tại cửa ngõ Đông Nam Hà Nội.",
    address: "Khu đô thị Ecopark, Huyện Văn Giang, Tỉnh Hưng Yên",
    region: "VUNG_TPHCM_1",
    sector: "KHU_VUC_3",
    status: "PLANNING",
    startDate: "2025-01-01",
    endDate: "2028-12-31",
    createdAt: "2025-01-01T08:00:00Z",
    projectAdmins: [
      {
        userId: 1,
        fullName: "Trần Văn An",
        phone: "0901234567",
        email: "an.tran@novaland.com.vn",
        perNumber: "NVL-001980",
      },
    ],
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    zones: [],
  },
]

export const MOCK_PROJECT_MEMBERS: Record<number, ProjectMemberResponse[]> = {
  1: [
    {
      userId: 1,
      perNumber: "NVL-001980",
      userFullName: "Trần Văn An",
      email: "an.tran@novaland.com.vn",
      phone: "0901234567",
      departmentName: "PCD",
      status: "ACTIVE",
      roles: [
        {
          roleId: 2,
          roleName: "GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn và Môi trường",
          projectRole: "PROJECT_ADMIN",
          isPrimary: true,
          zones: [
            {
              userProjectRoleId: 1,
              zoneId: 1,
              zoneName: "Phân khu 1 - Florida",
              status: "ACTIVE",
            },
          ],
        },
      ],
    },
    {
      userId: 3,
      perNumber: "NVL-003055",
      userFullName: "Lê Văn Cường",
      email: "cuong.le@novaland.com.vn",
      phone: "0901234569",
      departmentName: "PCD",
      status: "ACTIVE",
      roles: [
        {
          roleId: 3,
          roleName: "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường",
          projectRole: "ZONE_ADMIN",
          isPrimary: true,
          zones: [
            {
              userProjectRoleId: 2,
              zoneId: 1,
              zoneName: "Phân khu 1 - Florida",
              status: "ACTIVE",
            },
          ],
        },
      ],
    },
    {
      userId: 7,
      perNumber: "NVL-005001",
      userFullName: "Nguyễn Văn Hùng",
      email: "hung.nguyen@novaland.com.vn",
      phone: "0901234573",
      departmentName: "BP Xây dựng",
      status: "ACTIVE",
      roles: [
        {
          roleId: 8,
          roleName: "Kỹ sư cao cấp Giám sát Xây dựng",
          projectRole: "TASK_EXECUTOR",
          isPrimary: true,
          zones: [
            {
              userProjectRoleId: 4,
              zoneId: 1,
              zoneName: "Phân khu 1 - Florida",
              status: "ACTIVE",
            },
          ],
        },
      ],
    },
  ],
}
