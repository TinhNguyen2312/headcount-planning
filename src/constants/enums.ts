/** Kết luận của một tiêu chí trên bản vẽ. */
export type FindingStatus =
  | "pass" // Đạt
  | "fail" // Không đạt
  | "warning" // Cảnh báo
  | "pending" // Chờ người thẩm định
  | "approved" // Đã duyệt — người đã xác nhận kết luận của máy
  | "unknown"; // Không xác định

/** Mức độ ảnh hưởng của vi phạm. */
export type FindingSeverity = "low" | "medium" | "high" | "critical";

/**
 * Loại kiểm tra — cách máy đối chiếu tiêu chí.
 * Quyết định khoảng độ tin cậy kỳ vọng, không phải mức độ nghiêm trọng.
 * A. Đối chiếu số đo · B. Đối chiếu vật liệu / thông số
 * C. Phân tích hình học · D. Phán đoán chủ quan
 */
export type CheckType = "A" | "B" | "C" | "D";

/** @deprecated Dùng CheckType. Giữ tên cũ để code findings không gãy. */
export type ReasoningGroup = CheckType;

/** Nhóm tiêu chuẩn CHTK — suy ra từ chữ số đầu của mã tiêu chí. */
export type ChtkCategory =
  | "facade" // 1.x — Mặt ngoài
  | "dimension" // 2.x — Kích thước
  | "stair-ramp" // 3.x — Thang – Ramp
  | "structure" // 4.x — Cấu tạo
  | "finishing"; // 5.x — Hoàn thiện

/** Loại nhà mà một quy tắc áp dụng. */
export type HouseType =
  | "shophouse"
  | "townhouse"
  | "semi-villa"
  | "single-villa"
  | "shop-villa";

/** Phép so sánh của một quy tắc. */
export type ComparisonOperator =
  | "gte" // Tối thiểu (≥)
  | "lte" // Tối đa (≤)
  | "eq" // Bằng đúng (=)
  | "between" // Trong khoảng
  | "in-list" // Thuộc danh sách
  | "pattern" // Khớp mẫu
  | "required" // Phải có
  | "forbidden"; // Không được có
