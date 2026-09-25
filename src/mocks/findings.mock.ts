import type {
  FindingSeverity,
  FindingStatus,
  ReasoningGroup,
} from "@/constants/enums";
import { categoryFromRuleIndex } from "@/constants/domain";
import type { Finding, ReviewDossier } from "@/types";

export const MOCK_DOSSIERS: readonly ReviewDossier[] = [
  {
    id: "rv-2026-018",
    code: "PN2-DN-01",
    name: "Bản vẽ mẫu PN2 Đà Nẵng — Shophouse điển hình",
  },
];

type Row = [
  ruleIndex: string,
  detailLabel: string,
  extractedValue: string,
  standardValue: string,
  status: FindingStatus,
  severity: FindingSeverity,
  group: ReasoningGroup,
  confidence: number,
  pageNumber: number,
  note?: string,
];

const ROWS: readonly Row[] = [
  // 1.x — Mặt ngoài
  ["1.1", "Hoàn thiện mặt tiền", "Sơn ngoại thất 2 lớp, không nêu lớp lót", "Lót chống kiềm + 2 lớp phủ", "warning", "low", "B", 0.72, 4],
  ["1.1.1", "Ốp đá mặt tiền", "Đá granite dày 18 mm", "≥ 20 mm", "fail", "high", "B", 0.79, 5, "Đã trao đổi với đơn vị thiết kế, chờ bản vẽ cập nhật độ dày đá."],
  ["1.2", "Phào chỉ mặt tiền", "Phào EPS phủ vữa", "Phào EPS phủ vữa hoặc BT đúc sẵn", "pass", "low", "D", 0.88, 4],
  ["1.3", "Lan can kính — độ dày kính", "Kính dán 8.38 mm, phụ kiện inox 201", "≥ 10.76 mm, phụ kiện inox 304", "fail", "critical", "B", 0.82, 3],
  ["1.3.1", "Kính lan can mặt cắt điển hình", "Không thể hiện mặt cắt điển hình", "Bắt buộc có mặt cắt điển hình", "fail", "high", "B", 0.61, 12, "Yêu cầu bổ sung mặt cắt điển hình ở lần nộp tiếp theo."],
  ["1.4.1", "Cửa đi mở — Cao x Rộng", "2200 x 900 mm", "2200 x 900 mm", "pass", "low", "A", 0.96, 7],
  ["1.4.2", "Cửa đi lùa — Cao x Rộng", "2200 x 1500 mm", "≥ 2200 x 1600 mm", "fail", "medium", "A", 0.91, 7],
  ["1.5.1", "Cửa sổ mở quay / mở bật", "1400 x 800 mm", "1400 x 800 mm", "pass", "low", "A", 0.93, 8],
  ["1.5.2", "Vách kính cố định", "Kính cường lực 8 mm", "≥ 10 mm", "warning", "medium", "A", 0.68, 7],
  ["1.6", "Chiều cao lan can", "1050 mm", "≥ 1100 mm", "fail", "critical", "A", 0.94, 3],
  ["1.7", "Chiều cao cổng / hàng rào", "2400 mm", "≤ 2500 mm", "approved", "low", "A", 0.9, 2],
  ["1.8.1", "Chênh cote trệt – vỉa hè (Shophouse)", "300 mm", "250 – 350 mm", "pass", "low", "A", 0.87, 2],
  ["1.8.2", "Chênh cote trệt – vỉa hè (loại nhà khác)", "200 mm", "150 – 250 mm", "pass", "low", "A", 0.88, 2],
  ["1.9.2", "Cao độ tầng 1 so vỉa hè — có hầm (Shophouse)", "1350 mm", "≤ 1200 mm", "fail", "high", "A", 0.9, 9],
  ["1.10.1", "Lọt lòng nhà xe", "2400 mm", "≥ 2500 mm", "fail", "medium", "A", 0.89, 6],
  ["1.10.2", "Lọt lòng nhà xe — Single Villa", "Không thể hiện trên mặt bằng", "≥ 2700 mm", "unknown", "medium", "A", 0.34, 6],

  // 2.x — Kích thước
  ["2.1.1", "Chiều cao tầng hầm — Shophouse", "2700 mm", "≥ 2700 mm", "pass", "low", "A", 0.95, 9],
  ["2.1.2", "Chiều cao tầng hầm — Townhouse / Semi / Single", "2700 mm", "≥ 2700 mm", "pass", "low", "A", 0.92, 9],
  ["2.1.3", "Chiều cao tầng 1 — Shophouse", "3600 mm", "3600 mm", "pass", "low", "A", 0.94, 10],
  ["2.1.4", "Chiều cao tầng 1 — Townhouse / Semi / Single", "3500 mm", "≥ 3600 mm", "warning", "medium", "A", 0.76, 10],
  ["2.1.5", "Chiều cao tầng 2 – 3", "3300 mm", "3300 mm", "pass", "low", "A", 0.93, 10],
  ["2.1.6", "Chiều cao tầng tum", "2800 mm", "≥ 3000 mm", "fail", "high", "A", 0.92, 11],
  ["2.2.1", "Bề rộng phòng khách", "3800 mm", "≥ 3600 mm", "pass", "low", "A", 0.91, 13],
  ["2.2.2", "Bề rộng phòng ăn", "Không đọc được chuỗi kích thước", "≥ 3000 mm", "unknown", "medium", "A", 0.31, 13],
  ["2.2.3", "Bề rộng phòng bếp", "2900 mm", "≥ 3000 mm", "warning", "medium", "A", 0.74, 13, "Chênh lệch nhỏ, cần đo lại thực tế trước khi kết luận."],
  ["2.2.4", "Bề rộng phòng ngủ master", "3300 mm", "≥ 3400 mm", "fail", "medium", "A", 0.9, 14],
  ["2.2.5", "Bề rộng phòng ngủ thường", "3000 mm", "≥ 3000 mm", "approved", "low", "A", 0.89, 14],
  ["2.2.6", "Bề rộng phòng vệ sinh", "1500 mm", "≥ 1500 mm", "approved", "low", "A", 0.88, 15],
  ["2.2.7", "Bề rộng ban công giặt phơi", "1200 mm", "≥ 1400 mm", "fail", "medium", "A", 0.86, 16],

  // 3.x — Thang - Ramp
  ["3.1", "Rộng thông thủy vế thang — Single / Shop Villa", "1000 mm", "≥ 1000 mm", "pass", "low", "A", 0.91, 17],
  ["3.2", "Rộng thông thủy vế thang — Townhouse / Shophouse / Semi", "900 mm", "≥ 900 mm", "pending", "medium", "A", 0.77, 17],
  ["3.3", "Bề rộng bậc thang", "270 mm", "≥ 280 mm", "fail", "high", "A", 0.93, 17, "Lặp lại ở nhiều mặt cắt — nên rà soát toàn bộ cầu thang, không chỉ mặt cắt này."],
  ["3.3.1", "Bề rộng bậc thang — nhà TM liên kế", "260 mm", "≥ 270 mm", "fail", "medium", "A", 0.88, 17],
  ["3.4", "Chiều cao thông thủy mỗi bậc", "2050 mm", "≥ 2000 mm", "pass", "low", "A", 0.89, 18],
  ["3.5", "Chiều cao bậc thang", "175 mm", "≤ 180 mm", "pass", "low", "A", 0.92, 17],
  ["3.6", "Số bậc thang", "21 bậc", "Số lẻ, ≤ 21 bậc", "pass", "low", "A", 0.85, 17],
  ["3.7", "Độ dốc ramp hầm", "22 %", "≤ 20 %", "fail", "critical", "A", 0.9, 19],
  ["3.7.1", "Rộng lọt lòng ramp", "3000 mm", "≥ 3000 mm", "approved", "low", "A", 0.86, 19],

  // 4.x — Cấu tạo
  ["4.1", "Chèn đỉnh tường giáp dầm / sàn", "Xây nghiêng gạch đinh", "Xây nghiêng 60° + vữa chèn đầy", "pass", "low", "B", 0.72, 20],
  ["4.1.1", "Kicker chân tường", "Không thể hiện", "BTCT H = 100 mm, đổ cùng sàn", "warning", "medium", "B", 0.6, 20],
  ["4.1.2", "Trát vữa ngoài nhà", "Trát 2 lớp, tổng dày 15 mm", "2 lớp, tổng ≥ 15 mm", "pass", "low", "B", 0.85, 20],
  ["4.1.3", "Ron âm tường", "Ron 10 x 10 mm", "Ron 10 x 10 mm", "pass", "low", "B", 0.87, 20],
  ["4.1.4", "Chỉ ngắt nước mưa", "Không thể hiện trên mặt cắt", "Bắt buộc tại mép ban công / sê nô", "warning", "medium", "B", 0.63, 21],
  ["4.1.5", "Lưới chống nứt", "Lưới thủy tinh phủ mạch vữa", "Lưới thủy tinh tại vị trí giáp vật liệu", "pass", "low", "B", 0.81, 21],
  ["4.2.1", "Bàn giao sàn BTCT tầng 1", "Ghi chú không rõ cao độ bàn giao", "Cote hoàn thiện -50 mm", "pending", "medium", "B", 0.55, 23],
  ["4.2.2", "Kicker sàn mái", "Không thể hiện", "BTCT H = 200 mm quanh sàn mái", "fail", "high", "B", 0.64, 24],
  ["4.2.3", "Trát mặt bậc", "Trát vữa M75 dày 20 mm", "Vữa M75, dày 15 – 20 mm", "approved", "low", "B", 0.83, 18],
  ["4.2.4", "Sàn mái BTCT — lớp cấu tạo", "4 lớp, thiếu lớp tạo dốc", "5 lớp theo CHTK", "fail", "high", "B", 0.66, 24],
  ["4.2.5", "Chi tiết sàn mái BTCT bằng", "Thiếu chi tiết điển hình sàn mái bằng", "Bắt buộc có chi tiết điển hình", "warning", "high", "C", 0.67, 24],
  ["4.2.6", "Trát trong nhà", "Trát 1 lớp dày 12 mm", "1 lớp, 10 – 15 mm", "pass", "low", "B", 0.86, 21],
  ["4.3.1", "Khe hở 2 nhà giáp nhau — mặt đứng", "30 mm", "≥ 50 mm", "fail", "critical", "A", 0.83, 22],
  ["4.3.2", "Khe hở mái — hai nhà cao bằng nhau", "Ghi chú mờ, không đọc được trị số", "≥ 50 mm", "unknown", "high", "A", 0.29, 22],
  ["4.4", "Chống thấm gốc PU — cuộn lên tường", "250 mm", "≥ 300 mm", "fail", "high", "B", 0.8, 25],
  ["4.4.1", "Lớp chống thấm tại vị trí theo CHTK", "Đủ vị trí theo danh mục", "Theo CHTK mục 4.4.1", "approved", "low", "B", 0.7, 25],
  ["4.4.2", "Xử lý chống mối giai đoạn thi công", "Không thể hiện trên bản vẽ", "Bắt buộc xử lý 2 giai đoạn", "fail", "medium", "B", 0.58, 27, "Nhắc đơn vị thi công bổ sung biên bản xử lý mối giai đoạn 2."],
  ["4.5", "Sê nô", "Rộng 300 mm, dốc 1 %", "Rộng ≥ 300 mm, dốc ≥ 1 %", "pass", "low", "B", 0.9, 26],
  ["4.5.1", "Chân tường rào — chống thấm", "Chống thấm gốc xi măng, cuộn lên 200 mm", "Cuộn lên ≥ 300 mm", "fail", "medium", "B", 0.81, 26],

  // 5.x — Hoàn thiện
  ["5.1", "Trần ngoài nhà — vùng biển", "Không thể hiện cấu tạo cho vùng biển", "Cemboard ≥ 8 mm, vít inox 316", "pending", "low", "B", 0.52, 29],
  ["5.1.1", "Trần ngoài nhà — vùng đồng bằng", "Tấm cemboard 4.5 mm", "Cemboard ≥ 6 mm", "fail", "medium", "B", 0.84, 29],
  ["5.1.2", "Ốp trần cemboard", "Ghi chú mờ, không đọc được quy cách", "Cemboard ≥ 6 mm, vít inox", "unknown", "low", "B", 0.28, 31],
  ["5.2", "Hệ khung trần", "Khung xương nhôm 600 x 600", "Khung xương ≤ 600 x 600", "pass", "low", "B", 0.86, 30],
  ["5.2.1", "Trần bê tông — lớp hoàn thiện", "Bả + sơn 2 lớp", "Bả + sơn 2 lớp", "pass", "low", "B", 0.9, 29],
  ["5.3.1", "Mặt cắt ban công / lô gia / sân thượng điển hình", "Có mặt cắt điển hình", "Bắt buộc có mặt cắt điển hình", "approved", "low", "C", 0.73, 30],
  ["5.3.2", "Ngạch cửa mở — gỗ / nhôm kính", "Không thể hiện ngạch", "Cao 20 mm, vát mép", "warning", "low", "A", 0.59, 30],
  ["5.3.3", "Ngạch cửa lùa nhôm kính", "Ngạch cao 15 mm", "Cao 20 mm, vát mép", "warning", "medium", "C", 0.69, 30],
  ["5.4", "Chân tường ngoài nhà", "Không có kicker", "Kicker BTCT H = 100 mm", "fail", "medium", "A", 0.62, 31, "Kiểm tra lại toàn bộ chu vi nhà, không chỉ mặt cắt điển hình."],
];

function pseudoRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function mockBoundingBox(index: number) {
  const rng = pseudoRandom(index * 37 + 11);
  const width = 8 + rng() * 10;
  const height = 6 + rng() * 8;
  const x = 5 + rng() * (95 - width - 5);
  const y = 8 + rng() * (92 - height - 8);
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
  };
}

export const MOCK_FINDINGS: readonly Finding[] = ROWS.map(
  (
    [
      ruleIndex,
      detailLabel,
      extractedValue,
      standardValue,
      status,
      severity,
      group,
      confidence,
      pageNumber,
      note,
    ],
    i,
  ) => ({
    id: `fd-${String(i + 1).padStart(3, "0")}`,
    reviewId: MOCK_DOSSIERS[0].id,
    status,
    severity,
    ruleIndex,
    detailLabel,
    extractedValue,
    standardValue,
    confidence,
    group,
    category: categoryFromRuleIndex(ruleIndex),
    pageNumber,
    boundingBox: mockBoundingBox(i),
    note,
  }),
);
