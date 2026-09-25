import type { ChtkCategory } from "@/constants/enums";
import type { ProcessingStepDef } from "@/types";

export const UPLOAD_ACCEPT = "application/pdf";
export const MAX_FILE_SIZE_MB = 100;

export const CATEGORY_CHECK_DESCRIPTIONS: Record<ChtkCategory, string> = {
  facade:
    "Hoàn thiện mặt tiền, phào chỉ, lan can, cửa đi, cửa sổ, cổng hàng rào, cote.",
  dimension:
    "Chiều cao tầng và bề rộng lọt lòng các phòng chức năng. Toàn số đo.",
  "stair-ramp":
    "Bề rộng vế thang, kích thước bậc, số bậc, độ dốc ramp hầm. Toàn số đo.",
  structure:
    "Kicker, ron âm, trát vữa, chống thấm, sàn mái, sê nô, khe hở giữa hai nhà.",
  finishing:
    "Trần thạch cao/silicate, hệ khung, chân tường, ngạch cửa, ốp đá.",
};

export const PROCESSING_STEPS: readonly ProcessingStepDef[] = [
  { key: "extract", label: "Trích xuất trang bản vẽ từ file PDF" },
  { key: "ocr", label: "OCR nhận diện kích thước, cote và ghi chú" },
  { key: "material", label: "Đối chiếu vật liệu / thông số theo ngữ cảnh" },
  { key: "geometry", label: "Phân tích hình học bằng VLM" },
  { key: "aggregate", label: "Tổng hợp kết luận theo từng tiêu chí CHTK" },
];

export const DRAFT_ASSIGNEE = { name: "Bạn", initials: "B" };
export const MOCK_PDF_URL = "/mock/PN2-DN-01.pdf";

export const VIEWER_MIN_ZOOM_RATIO = 0.1;
export const VIEWER_MAX_ZOOM_RATIO = 20;
