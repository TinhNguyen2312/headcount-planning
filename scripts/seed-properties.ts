import * as dotenv from "dotenv"
dotenv.config()

import { db } from "../src/db"
import { properties } from "../drizzle/schema"
import { eq } from "drizzle-orm"

async function main() {
  console.log("Seeding standard properties...")

  const seedData = [
    {
      code: "LAND_AREA",
      name: "Diện tích đất",
      dataType: "NUMBER",
      unit: "ha",
      options: null,
      projectType: "COMMON",
      description: "Tổng diện tích đất của phân khu/dự án",
      isActive: true,
    },
    {
      code: "CFA_AREA",
      name: "Diện tích sàn xây dựng (CFA)",
      dataType: "NUMBER",
      unit: "m2",
      options: null,
      projectType: "COMMON",
      description: "Tổng diện tích sàn xây dựng (Construction Floor Area)",
      isActive: true,
    },
    {
      code: "SCALE",
      name: "Quy mô số căn",
      dataType: "NUMBER",
      unit: "căn",
      options: null,
      projectType: "COMMON",
      description: "Tổng số lượng sản phẩm (căn hộ, shophouse, biệt thự...)",
      isActive: true,
    },
    {
      code: "ROBOT_COUNT",
      name: "Số lượng máy/robot ép cọc",
      dataType: "NUMBER",
      unit: "robot",
      options: null,
      projectType: "COMMON",
      description: "Số lượng thiết bị/robot ép cọc hoạt động trên công trường",
      isActive: true,
    },
    {
      code: "CALCULATE_TYPE",
      name: "Loại định biên",
      dataType: "SELECT",
      unit: null,
      options: ["Min", "Max"],
      projectType: "COMMON",
      description: "Phương án định mức tính theo cận dưới (Min) hoặc cận trên (Max)",
      isActive: true,
    },
  ]

  for (const item of seedData) {
    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.code, item.code))

    if (!existing) {
      await db.insert(properties).values(item as any)
      console.log(`+ Inserted property: ${item.code} (${item.name})`)
    } else {
      await db
        .update(properties)
        .set({ projectType: item.projectType })
        .where(eq(properties.code, item.code))
      console.log(`- Updated property: ${item.code}`)
    }
  }

  console.log("Seeding properties completed successfully!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
