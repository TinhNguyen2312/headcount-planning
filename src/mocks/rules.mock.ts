import type {
  CheckType,
  ComparisonOperator,
  HouseType,
} from "@/constants/enums";
import { categoryFromRuleIndex } from "@/constants/domain";
import type { Rule } from "@/types";

type Row = [
  code: string,
  title: string,
  checkType: CheckType,
  operator: ComparisonOperator,
  value: string,
  houseTypes: HouseType[],
  note: string,
  isActive: boolean,
];

const ROWS: readonly Row[] = [
  // 1.x
  ["1.1", "Hoàn thiện mặt tiền", "B", "required", "Phải có: Sơn nước ngoại thất; sơn đá / sơn gai cho mảng nhấn", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.1.1", "Ốp đá mặt tiền", "B", "forbidden", "Không ốp đá mặt tiền", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "CHTK 4 sao không dùng ốp đá mặt tiền. Xuất hiện trên bản vẽ là sai lệch.", true],
  ["1.2", "Phào chỉ mặt tiền", "D", "lte", "≤ 3 cấp", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Đơn giản, tối đa 3 cấp, không đắp vữa. Mức \"đơn giản\" cần người đánh giá.", true],
  ["1.3", "Lan can kính — độ dày kính", "B", "eq", "= 10.76 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Kính dán cường lực 10.76mm + phụ kiện inox 304 trung cấp.", true],
  ["1.3.1", "Kính lan can mặt cắt điển hình", "B", "eq", "= 12.76 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "6mm kính CL + 0.76 PVB + 6mm kính bán CL.", true],
  ["1.4.1", "Cửa đi mở — Cao x Rộng", "A", "in-list", "2800x1100 / 2800x1650 / 2800x2400 / 2800x3200 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.4.2", "Cửa đi lùa — Cao x Rộng", "A", "in-list", "2400x1400 / 2400x1650 / 2400x2400 / 2800x2400 / 2800x3200 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.5.1", "Cửa sổ mở quay / mở bật", "A", "in-list", "1500x700 / 1500x1500 / 1900x1500 / 2800x1500 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.5.2", "Vách kính cố định", "A", "between", "1500 – 2400 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.6", "Chiều cao lan can", "A", "gte", "≥ 1.1 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.7", "Chiều cao cổng / hàng rào", "A", "between", "1.2 – 2.6 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.8.1", "Chênh cote trệt – vỉa hè (Shophouse)", "A", "gte", "≥ 150 mm", ["shophouse"], "", true],
  ["1.8.2", "Chênh cote trệt – vỉa hè (loại nhà khác)", "A", "gte", "≥ 450 mm", ["townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["1.9.1", "Cao độ tầng 1 so vỉa hè — có hầm (Townhouse)", "A", "gte", "≥ 1.2 m", ["townhouse"], "", true],
  ["1.9.2", "Cao độ tầng 1 so vỉa hè — có hầm (Shophouse)", "A", "gte", "≥ 1.5 m", ["shophouse"], "", true],
  ["1.10.1", "Lọt lòng nhà xe", "A", "gte", "≥ 2.8 × 5.6 m", ["shophouse", "townhouse", "semi-villa", "shop-villa"], "Lọt lòng tối thiểu 2.8 x 5.6m.", true],
  ["1.10.2", "Lọt lòng nhà xe — Single Villa", "A", "gte", "≥ 5.6 × 5.6 m", ["single-villa"], "", true],

  // 2.x
  ["2.1.1", "Chiều cao tầng hầm — Shophouse", "A", "gte", "≥ 3.3 m", ["shophouse"], "", true],
  ["2.1.2", "Chiều cao tầng hầm — Townhouse / Semi / Single", "A", "gte", "≥ 2.7 m", ["townhouse", "semi-villa", "single-villa"], "", true],
  ["2.1.3", "Chiều cao tầng 1 — Shophouse", "A", "gte", "≥ 4 m", ["shophouse"], "", true],
  ["2.1.4", "Chiều cao tầng 1 — Townhouse / Semi / Single", "A", "gte", "≥ 3.8 m", ["townhouse", "semi-villa", "single-villa"], "", true],
  ["2.1.5", "Chiều cao tầng 2 – 3", "A", "gte", "≥ 3.4 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.1.6", "Chiều cao tầng tum", "A", "gte", "≥ 2.7 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.1", "Bề rộng phòng khách", "A", "gte", "≥ 3.2 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.2", "Bề rộng phòng ăn", "A", "gte", "≥ 2.4 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.3", "Bề rộng phòng bếp", "A", "gte", "≥ 2.1 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.4", "Bề rộng phòng ngủ master", "A", "gte", "≥ 2.9 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.5", "Bề rộng phòng ngủ thường", "A", "gte", "≥ 2.7 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.6", "Bề rộng phòng vệ sinh", "A", "gte", "≥ 1.45 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["2.2.7", "Bề rộng ban công giặt phơi", "A", "gte", "≥ 1.2 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],

  // 3.x
  ["3.1", "Rộng thông thủy vế thang — Single / Shop Villa", "A", "gte", "≥ 1 m", ["single-villa", "shop-villa"], "", true],
  ["3.2", "Rộng thông thủy vế thang — Townhouse / Shophouse / Semi", "A", "gte", "≥ 0.9 m", ["townhouse", "shophouse", "semi-villa"], "", true],
  ["3.3", "Bề rộng bậc thang", "A", "gte", "≥ 250 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["3.3.1", "Bề rộng bậc thang — nhà TM liên kế", "A", "gte", "≥ 280 mm", ["townhouse", "shophouse"], "", true],
  ["3.4", "Chiều cao thông thủy mỗi bậc", "A", "gte", "≥ 2 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["3.5", "Chiều cao bậc thang", "A", "lte", "≤ 180 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["3.6", "Số bậc thang", "A", "in-list", "17 / 18 / 21 / 22 / 25 bậc", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["3.7", "Độ dốc ramp hầm", "A", "lte", "≤ 18 %", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["3.7.1", "Rộng lọt lòng ramp", "A", "gte", "≥ 2.3 m", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],

  // 4.x
  ["4.1", "Chèn đỉnh tường giáp dầm / sàn", "B", "required", "Phải có: Gạch đặc", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.1.1", "Kicker chân tường", "B", "eq", "= 300 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Bê tông cao 300mm tính từ sàn kết cấu.", true],
  ["4.1.2", "Trát vữa ngoài nhà", "B", "eq", "= 15 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Vữa M75, dày 15mm.", true],
  ["4.1.3", "Ron âm tường", "B", "eq", "= 10x20 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "10x20mm hoặc theo thiết kế được duyệt.", true],
  ["4.1.4", "Chỉ ngắt nước mưa", "B", "eq", "= 10x10 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Ron vuông 10x10mm.", true],
  ["4.1.5", "Lưới chống nứt", "B", "gte", "≥ 150 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Thép hàn 25x25mm, phủ tối thiểu 150mm mỗi bên.", true],
  ["4.2.1", "Bàn giao sàn BTCT tầng 1", "B", "forbidden", "Không bàn giao", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.2.2", "Kicker sàn mái", "B", "eq", "= 100 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Đỉnh kicker cao 100mm so với FFL.", true],
  ["4.2.3", "Trát mặt bậc", "B", "forbidden", "Không trát", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.2.4", "Sàn mái BTCT — lớp cấu tạo", "B", "gte", "≥ 40 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "BT đá mi M200, thép D4@250–300, dày ≥40mm, dốc ≥1.5%. Không có lớp vữa hoàn thiện.", true],
  ["4.2.5", "Chi tiết sàn mái BTCT bằng", "C", "required", "Phải có: Có mặt cắt chi tiết theo CHTK", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.2.6", "Trát trong nhà", "B", "forbidden", "Không trát", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.3.1", "Khe hở 2 nhà giáp nhau — mặt đứng", "A", "eq", "= 10 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Rộng 10mm, hoàn thiện ron âm 10mm.", true],
  ["4.3.2", "Khe hở mái — hai nhà cao bằng nhau", "A", "gte", "≥ 70 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Kicker ≥300mm, đan BTCT dày ≥70mm.", true],
  ["4.4", "Chống thấm gốc PU — cuộn lên tường", "B", "gte", "≥ 300 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.4.1", "Lớp chống thấm tại vị trí theo CHTK", "B", "forbidden", "Không thực hiện", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Một số vị trí CHTK quy định không thực hiện chống thấm — thể hiện thừa là sai lệch.", true],
  ["4.4.2", "Xử lý chống mối giai đoạn thi công", "B", "forbidden", "Không xử lý", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["4.5", "Sê nô", "B", "gte", "≥ 15 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Thành M75 dày ≥15mm, đáy ≥30mm, dốc ≥2%.", true],
  ["4.5.1", "Chân tường rào — chống thấm", "B", "forbidden", "Không chống thấm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Ưu tiên dùng sơn màu tối thay cho lớp chống thấm.", true],

  // 5.x
  ["5.1", "Trần ngoài nhà — vùng biển", "B", "in-list", "Silicate 6mm / Thạch cao chống ẩm 9mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["5.1.1", "Trần ngoài nhà — vùng đồng bằng", "B", "eq", "= 9 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Tấm thạch cao chống ẩm 9mm, có thanh shadowline.", true],
  ["5.1.2", "Ốp trần cemboard", "B", "forbidden", "Không có", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["5.2", "Hệ khung trần", "B", "pattern", "Alpha Vĩnh Tường 4000 — bước khung 406x1000mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["5.2.1", "Trần bê tông — lớp hoàn thiện", "B", "eq", "= 15 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Trát M75 dày 15mm + sơn nước.", true],
  ["5.3.1", "Mặt cắt ban công / lô gia / sân thượng điển hình", "C", "required", "Phải có: Có mặt cắt điển hình theo CHTK", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["5.3.2", "Ngạch cửa mở — gỗ / nhôm kính", "A", "gte", "≥ 20 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Chênh cao tối thiểu 20mm, dốc ≥1.5%, ốp đá dày 18±2mm.", true],
  ["5.3.3", "Ngạch cửa lùa nhôm kính", "C", "required", "Phải có: Có chi tiết ngạch cửa lùa theo CHTK", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "", true],
  ["5.4", "Chân tường ngoài nhà", "A", "eq", "= 50 mm", ["shophouse", "townhouse", "semi-villa", "single-villa", "shop-villa"], "Sơn nước, âm xuống FFL sân 5cm.", true],
];

export const MOCK_RULES: readonly Rule[] = ROWS.map(
  ([code, title, checkType, operator, value, houseTypes, note, isActive]) => ({
    id: `rule-${code.replace(/\./g, "-")}`,
    code,
    title,
    category: categoryFromRuleIndex(code),
    checkType,
    operator,
    value,
    houseTypes,
    note: note || undefined,
    isActive,
  }),
);
