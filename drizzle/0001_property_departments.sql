-- Migration: Thêm bảng junction property_departments (quan hệ n-n giữa properties và departments)
-- Logic: property không có row nào trong bảng này = áp dụng chung cho tất cả phòng ban (backward-compatible)

CREATE TABLE IF NOT EXISTS "property_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_departments_property_id_department_id_key" UNIQUE("property_id","department_id")
);

ALTER TABLE "property_departments"
  ADD CONSTRAINT "property_departments_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "property_departments"
  ADD CONSTRAINT "property_departments_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- Index để tăng tốc query filter theo department
CREATE INDEX IF NOT EXISTS "idx_property_departments_department_id"
  ON "property_departments" ("department_id");

CREATE INDEX IF NOT EXISTS "idx_property_departments_property_id"
  ON "property_departments" ("property_id");
