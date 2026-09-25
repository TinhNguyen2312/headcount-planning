import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  QuestionIcon,
  ShieldCheckIcon,
  XIcon,
} from "@/components/Common/icons";
import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  FindingSeverity,
  FindingStatus,
  HouseType,
} from "./enums";

type IconComponent = (props: { className?: string }) => React.ReactElement;

/* -------------------------------------------------------------------------- */
/* Nhóm CHTK                                                                   */
/* -------------------------------------------------------------------------- */

export const CATEGORY_CONFIG: Record<
  ChtkCategory,
  { section: string; label: string; short: string; dot: string }
> = {
  facade: {
    section: "1",
    label: "Mặt ngoài công trình",
    short: "Mặt ngoài",
    dot: "bg-cat-facade",
  },
  dimension: {
    section: "2",
    label: "Kích thước công trình",
    short: "Kích thước",
    dot: "bg-cat-dimension",
  },
  "stair-ramp": {
    section: "3",
    label: "Thang bộ – Ramp hầm",
    short: "Thang – Ramp",
    dot: "bg-cat-stair-ramp",
  },
  structure: {
    section: "4",
    label: "Chi tiết cấu tạo điển hình",
    short: "Cấu tạo",
    dot: "bg-cat-structure",
  },
  finishing: {
    section: "5",
    label: "Chi tiết hoàn thiện điển hình",
    short: "Hoàn thiện",
    dot: "bg-cat-finishing",
  },
};

export const CATEGORY_ORDER: readonly ChtkCategory[] = [
  "facade",
  "dimension",
  "stair-ramp",
  "structure",
  "finishing",
];

/** Chữ số đầu của mã tiêu chí quyết định nhóm CHTK: 1.x → Mặt ngoài... */
export function categoryFromRuleIndex(ruleIndex: string): ChtkCategory {
  const section = ruleIndex.split(".")[0];
  const map: Record<string, ChtkCategory> = {
    "1": "facade",
    "2": "dimension",
    "3": "stair-ramp",
    "4": "structure",
    "5": "finishing",
  };
  return map[section] ?? "structure";
}

/* -------------------------------------------------------------------------- */
/* Loại kiểm tra                                                               */
/* -------------------------------------------------------------------------- */

export const CHECK_TYPE_CONFIG: Record<
  CheckType,
  {
    label: string;
    title: string;
    method: string;
    expectedConfidence: string;
    dot: string;
    badge: string;
  }
> = {
  A: {
    label: "Đối chiếu số đo",
    title: "A. Đối chiếu số đo",
    method:
      "OCR chuỗi kích thước / cote trên bản vẽ, chuẩn hóa đơn vị rồi so với ngưỡng trong bảng tiêu chuẩn.",
    expectedConfidence: "85–95%",
    dot: "bg-group-a",
    badge: "bg-group-a/15 text-group-a",
  },
  B: {
    label: "Đối chiếu vật liệu / thông số",
    title: "B. Đối chiếu vật liệu / thông số",
    method:
      "Regex trên ghi chú bản vẽ kèm ngữ cảnh, so với cột tiêu chuẩn áp dụng.",
    expectedConfidence: "70–85%",
    dot: "bg-group-b",
    badge: "bg-group-b/15 text-group-b",
  },
  C: {
    label: "Phân tích hình học",
    title: "C. Phân tích hình học",
    method:
      "VLM đọc mặt cắt và hình học chi tiết để xác định chi tiết có được thể hiện đúng cấu tạo hay không.",
    expectedConfidence: "55–70%",
    dot: "bg-group-c",
    badge: "bg-group-c/15 text-group-c",
  },
  D: {
    label: "Phán đoán chủ quan",
    title: "D. Phán đoán chủ quan",
    method:
      "Tiêu chí mang tính định tính, máy chỉ gợi ý — kết luận cuối cùng luôn cần người thẩm định.",
    expectedConfidence: "dưới 55%",
    dot: "bg-group-d",
    badge: "bg-group-d/15 text-group-d",
  },
};

export const CHECK_TYPE_ORDER: readonly CheckType[] = ["A", "B", "C", "D"];

/* -------------------------------------------------------------------------- */
/* Loại nhà                                                                    */
/* -------------------------------------------------------------------------- */

export const HOUSE_TYPE_CONFIG: Record<
  HouseType,
  { label: string; short: string }
> = {
  shophouse: { label: "Shophouse", short: "SH" },
  townhouse: { label: "Townhouse / Nhà phố liên kế", short: "TH" },
  "semi-villa": { label: "Semi Villa", short: "SV" },
  "single-villa": { label: "Single Villa", short: "SGV" },
  "shop-villa": { label: "Shop Villa", short: "SHV" },
};

export const HOUSE_TYPE_ORDER: readonly HouseType[] = [
  "shophouse",
  "townhouse",
  "semi-villa",
  "single-villa",
  "shop-villa",
];

/**
 * Nhãn gọn cho phạm vi áp dụng, dùng viết tắt để cột không bị lõm:
 * đủ 5 loại thì gọi là "Mọi loại nhà", còn lại là "TH, SV, SGV".
 */
export function houseTypeScopeLabel(houseTypes: readonly HouseType[]): string {
  if (houseTypes.length >= HOUSE_TYPE_ORDER.length) return "Mọi loại nhà";
  return HOUSE_TYPE_ORDER.filter((h) => houseTypes.includes(h))
    .map((h) => HOUSE_TYPE_CONFIG[h].short)
    .join(", ");
}

/** Tên đầy đủ, dùng trong khung chú thích. */
export function houseTypeFullLabel(houseTypes: readonly HouseType[]): string {
  return HOUSE_TYPE_ORDER.filter((h) => houseTypes.includes(h))
    .map((h) => HOUSE_TYPE_CONFIG[h].label)
    .join(" · ");
}

/* -------------------------------------------------------------------------- */
/* Phép so sánh                                                                */
/* -------------------------------------------------------------------------- */

export const OPERATOR_CONFIG: Record<
  ComparisonOperator,
  { label: string; symbol: string }
> = {
  gte: { label: "Tối thiểu (≥)", symbol: "≥" },
  lte: { label: "Tối đa (≤)", symbol: "≤" },
  eq: { label: "Bằng đúng (=)", symbol: "=" },
  between: { label: "Trong khoảng", symbol: "↔" },
  "in-list": { label: "Thuộc danh sách", symbol: "∈" },
  pattern: { label: "Khớp mẫu", symbol: "≈" },
  required: { label: "Phải có", symbol: "✓" },
  forbidden: { label: "Không được có", symbol: "✕" },
};

export const OPERATOR_ORDER: readonly ComparisonOperator[] = [
  "gte",
  "lte",
  "eq",
  "between",
  "in-list",
  "pattern",
  "required",
  "forbidden",
];

/* -------------------------------------------------------------------------- */
/* Trạng thái tiêu chí                                                         */
/* -------------------------------------------------------------------------- */

export const STATUS_CONFIG: Record<
  FindingStatus,
  {
    label: string;
    Icon: IconComponent;
    badge: string;
    bar: string;
    border: string;
    description: string;
  }
> = {
  pass: {
    label: "Đạt",
    Icon: CheckIcon,
    badge: "bg-pass-subtle text-pass-text",
    bar: "bg-pass",
    border: "border-l-pass",
    description:
      "Máy đối chiếu thấy giá trị trên bản vẽ nằm trong tiêu chuẩn áp dụng.",
  },
  fail: {
    label: "Không đạt",
    Icon: XIcon,
    badge: "bg-fail-subtle text-fail-text",
    bar: "bg-fail",
    border: "border-l-fail",
    description:
      "Giá trị trên bản vẽ lệch khỏi tiêu chuẩn áp dụng. Cần chỉnh bản vẽ.",
  },
  warning: {
    label: "Cảnh báo",
    Icon: AlertTriangleIcon,
    badge: "bg-warning-subtle text-warning-text",
    bar: "bg-warning",
    border: "border-l-warning",
    description:
      "Có dấu hiệu lệch nhưng chưa đủ chắc chắn — thường do độ tin cậy trích xuất thấp hoặc ghi chú mơ hồ.",
  },
  pending: {
    label: "Chờ người thẩm định",
    Icon: ClockIcon,
    badge: "bg-pending-subtle text-pending-text",
    bar: "bg-pending",
    border: "border-l-pending",
    description: "Đã có kết luận sơ bộ, đang chờ người thẩm định xác nhận.",
  },
  approved: {
    label: "Đã duyệt",
    Icon: ShieldCheckIcon,
    badge: "bg-approved-subtle text-approved-text",
    bar: "bg-approved",
    border: "border-l-approved",
    description: "Người thẩm định đã xem và xác nhận kết luận của máy.",
  },
  unknown: {
    label: "Không xác định",
    Icon: QuestionIcon,
    badge: "bg-unknown-subtle text-unknown-text",
    bar: "bg-unknown",
    border: "border-l-unknown",
    description:
      "Không trích xuất được dữ liệu để đối chiếu — bản vẽ thiếu thông tin hoặc ảnh không đọc được.",
  },
};

/** Thứ tự hiển thị: nặng trước, đã xong sau. */
export const STATUS_ORDER: readonly FindingStatus[] = [
  "fail",
  "warning",
  "pending",
  "pass",
  "approved",
  "unknown",
];

/** Trạng thái coi là "đã kết luận đạt" khi tính tỷ lệ. */
export const PASSED_STATUSES: readonly FindingStatus[] = ["pass", "approved"];

/** Trạng thái cần người can thiệp tay. */
export const ACTION_REQUIRED_STATUSES: readonly FindingStatus[] = [
  "fail",
  "warning",
  "pending",
];

/* -------------------------------------------------------------------------- */
/* Mức độ                                                                      */
/* -------------------------------------------------------------------------- */

export const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; badge: string; bar: string; description: string }
> = {
  low: {
    label: "Thấp",
    badge: "bg-sev-low-subtle text-sev-low-text",
    bar: "bg-sev-low",
    description: "Sai lệch nhỏ, không ảnh hưởng an toàn hay công năng.",
  },
  medium: {
    label: "Trung bình",
    badge: "bg-sev-medium-subtle text-sev-medium-text",
    bar: "bg-sev-medium",
    description:
      "Ảnh hưởng công năng hoặc thẩm mỹ, cần chỉnh trước khi triển khai.",
  },
  high: {
    label: "Cao",
    badge: "bg-sev-high-subtle text-sev-high-text",
    bar: "bg-sev-high",
    description: "Ảnh hưởng đáng kể tới công năng hoặc chi phí thi công.",
  },
  critical: {
    label: "Nghiêm trọng",
    badge: "bg-sev-critical-subtle text-sev-critical-text",
    bar: "bg-sev-critical",
    description:
      "Liên quan an toàn hoặc quy chuẩn bắt buộc — phải xử lý trước tiên.",
  },
};

export const SEVERITY_ORDER: readonly FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

/** Dưới ngưỡng này thì kết luận của máy phải được người xác nhận. */
export const CONFIDENCE_THRESHOLD = 0.8;

/** Trạng thái thu gọn sẵn khi mở trang — ưu tiên đọc phần cần xử lý trước. */
export const COLLAPSED_BY_DEFAULT: readonly FindingStatus[] = [
  "pass",
  "approved",
  "unknown",
];

