import * as dotenv from "dotenv"
dotenv.config()

import { db } from "../src/db"
import { properties } from "../drizzle/schema"
import { eq } from "drizzle-orm"

const propertiesList = [
  {
    code: "PROJECT_TYPE",
    name: "Phân loại hình dự án",
    dataType: "SELECT",
    unit: null,
    options: ["Thấp tầng", "Cao tầng", "Tiện ích & Cảnh quan", "Hỗn hợp"],
    description: "Phân loại hình công trình chính của dự án (Thấp tầng, Cao tầng, Tiện ích, Hỗn hợp)",
    isActive: true,
  },
  {
    code: "LAND_AREA",
    name: "Diện tích đất",
    dataType: "NUMBER",
    unit: "ha",
    options: null,
    description: "Tổng diện tích đất của phân khu/dự án phục vụ san lấp, HTKT, pháp lý",
    isActive: true,
  },
  {
    code: "CFA_AREA",
    name: "Diện tích sàn xây dựng (CFA)",
    dataType: "NUMBER",
    unit: "m2",
    options: null,
    description: "Tổng diện tích sàn xây dựng (Construction Floor Area) cho công trình cao tầng, hầm hoặc modul thô",
    isActive: true,
  },
  {
    code: "SCALE_LOW_RISE",
    name: "Quy mô số căn (Thấp tầng)",
    dataType: "NUMBER",
    unit: "căn",
    options: null,
    description: "Số lượng căn biệt thự, liền kề, shophouse thấp tầng",
    isActive: true,
  },
  {
    code: "SCALE_HIGH_RISE",
    name: "Quy mô số căn hộ (Cao tầng)",
    dataType: "NUMBER",
    unit: "căn hộ",
    options: null,
    description: "Số lượng căn hộ chung cư cao tầng",
    isActive: true,
  },
  {
    code: "ROBOT_COUNT",
    name: "Số lượng máy/robot ép cọc",
    dataType: "NUMBER",
    unit: "robot",
    options: null,
    description: "Số lượng thiết bị/robot ép cọc hoạt động trên công trường (chuẩn 12-15 tim/ngày/robot)",
    isActive: true,
  },
  {
    code: "HOTEL_KEYS",
    name: "Số Keys Resort / Khách sạn",
    dataType: "NUMBER",
    unit: "keys",
    options: null,
    description: "Số lượng phòng/keys đối với dự án nghỉ dưỡng, khách sạn có đơn vị vận hành quốc tế",
    isActive: true,
  },
  {
    code: "REVETMENT_DIRECTIONS",
    name: "Số hướng thi công bờ kè",
    dataType: "NUMBER",
    unit: "hướng",
    options: null,
    description: "Số lượng hướng/mũi triển khai thi công kè bảo vệ bờ sông/biển",
    isActive: true,
  },
  {
    code: "PROJECT_COUNT_IN_CLUSTER",
    name: "Số lượng dự án trong cụm",
    dataType: "NUMBER",
    unit: "dự án",
    options: null,
    description: "Số lượng dự án thành phần độc lập trong cùng một cụm dự án phụ trách",
    isActive: true,
  },
  {
    code: "LEGAL_COMPLEXITY",
    name: "Độ phức tạp hồ sơ pháp lý",
    dataType: "SELECT",
    unit: null,
    options: ["Bình thường", "Phức tạp / Đa chức năng"],
    description: "Mức độ phức tạp của hồ sơ thủ tục pháp lý dự án (bình thường hoặc đa chức năng/phức tạp)",
    isActive: true,
  },
  {
    code: "HANDOVER_AOP_COUNT",
    name: "Số sản phẩm bàn giao theo AOP năm",
    dataType: "NUMBER",
    unit: "sản phẩm",
    options: null,
    description: "Khối lượng sản phẩm cần bàn giao cho khách hàng theo kế hoạch AOP năm",
    isActive: true,
  },
  {
    code: "UNSOLD_UNHANDOVER_COUNT",
    name: "Số sản phẩm chưa bán / chưa bàn giao",
    dataType: "NUMBER",
    unit: "sản phẩm",
    options: null,
    description: "Số lượng bất động sản thuộc sở hữu CĐT chưa bán hoặc chưa bàn giao cần theo dõi quản lý",
    isActive: true,
  },
  {
    code: "RENTAL_POOL_COUNT",
    name: "Số sản phẩm tham gia Rental Pool",
    dataType: "NUMBER",
    unit: "sản phẩm",
    options: null,
    description: "Số lượng sản phẩm bất động sản nghỉ dưỡng tham gia chương trình ủy thác cho thuê (Rental Pool)",
    isActive: true,
  },
  {
    code: "BUS_COUNT",
    name: "Số lượng xe Bus vận hành",
    dataType: "NUMBER",
    unit: "xe",
    options: null,
    description: "Số lượng phương tiện/xe bus phục vụ vận chuyển cư dân và khách tham quan",
    isActive: true,
  },
  {
    code: "CALCULATE_TYPE",
    name: "Loại định biên",
    dataType: "SELECT",
    unit: null,
    options: ["Min", "Max"],
    description: "Phương án định mức tính theo cận dưới (Min) hoặc cận trên (Max) trong khung định biên",
    isActive: true,
  },
]

async function main() {
  console.log("Seeding all 15 properties...")

  for (const item of propertiesList) {
    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.code, item.code))

    if (!existing) {
      await db.insert(properties).values(item as any)
      console.log(`+ Inserted: ${item.code}`)
    } else {
      await db
        .update(properties)
        .set({
          name: item.name,
          dataType: item.dataType as any,
          unit: item.unit,
          options: item.options as any,
          description: item.description,
          isActive: item.isActive,
        })
        .where(eq(properties.code, item.code))
      console.log(`* Updated: ${item.code}`)
    }
  }

  console.log("Seeding properties completed successfully!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
