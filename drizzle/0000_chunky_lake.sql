-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"data_type" varchar(20) DEFAULT 'NUMBER' NOT NULL,
	"unit" varchar(20),
	"options" jsonb,
	"role_id" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_code_key" UNIQUE("code"),
	CONSTRAINT "properties_data_type_check" CHECK ((data_type)::text = ANY ((ARRAY['NUMBER'::character varying, 'STRING'::character varying, 'BOOLEAN'::character varying, 'SELECT'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"name" varchar(200) NOT NULL,
	"address" text,
	"general_info" text,
	"region_id" integer,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"start_date" date,
	"end_date" date,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_key" UNIQUE("code"),
	CONSTRAINT "projects_status_check" CHECK ((status)::text = ANY ((ARRAY['PLANNING'::character varying, 'ACTIVE'::character varying, 'PAUSED'::character varying, 'COMPLETED'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "headcount_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "headcount_projects_project_id_key" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "headcount_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "property_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"project_type" varchar(50),
	"value_text" text,
	"value_number" numeric(15, 4),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_values_project_id_property_id_project_type_key" UNIQUE("project_id","property_id","project_type")
);
--> statement-breakpoint
ALTER TABLE "property_values" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"effective_from" date DEFAULT CURRENT_DATE NOT NULL,
	"effective_to" date,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"replacement_user_id" integer,
	"replacement_from" date,
	"replacement_to" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_projects_user_id_project_id_role_id_effective_from_key" UNIQUE("user_id","project_id","role_id","effective_from"),
	CONSTRAINT "user_projects_status_check" CHECK ((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'ENDED'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "user_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "milestone_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_milestone_id" integer NOT NULL,
	"to_milestone_id" integer NOT NULL,
	"dependency_type" varchar(20) DEFAULT 'FINISH_TO_START' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "milestone_dependencies_from_milestone_id_to_milestone_id_key" UNIQUE("from_milestone_id","to_milestone_id")
);
--> statement-breakpoint
ALTER TABLE "milestone_dependencies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"version_name" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"valid_from" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_project_id_version_name_key" UNIQUE("project_id","version_name"),
	CONSTRAINT "plans_status_check" CHECK ((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'ARCHIVED'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "headcount_standards" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"from_milestone_id" integer NOT NULL,
	"to_milestone_id" integer,
	"headcount" numeric(10, 4) DEFAULT '1.0' NOT NULL,
	"headcount_min" numeric(10, 4),
	"headcount_max" numeric(10, 4),
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "headcount_standards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"milestone_id" integer NOT NULL,
	"start_month" integer DEFAULT 1 NOT NULL,
	"duration_months" integer DEFAULT 1 NOT NULL,
	"is_anchor" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phases_plan_id_milestone_id_key" UNIQUE("plan_id","milestone_id")
);
--> statement-breakpoint
ALTER TABLE "phases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "headcount_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"standard_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"condition_operator" varchar(20) DEFAULT 'BETWEEN' NOT NULL,
	"min_value" numeric(15, 4),
	"max_value" numeric(15, 4),
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "headcount_criteria_standard_id_property_id_min_value_max_va_key" UNIQUE("standard_id","property_id","min_value","max_value"),
	CONSTRAINT "headcount_criteria_condition_operator_check" CHECK ((condition_operator)::text = ANY ((ARRAY['='::character varying, '<'::character varying, '<='::character varying, '>'::character varying, '>='::character varying, 'BETWEEN'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "headcount_criteria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "headcount_monthly_factors" (
	"id" serial PRIMARY KEY NOT NULL,
	"standard_id" integer NOT NULL,
	"duration_months" integer NOT NULL,
	"month_no" integer NOT NULL,
	"factor" numeric(10, 2) DEFAULT '1.0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "headcount_monthly_factors_standard_id_duration_months_month_key" UNIQUE("standard_id","duration_months","month_no")
);
--> statement-breakpoint
ALTER TABLE "headcount_monthly_factors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'Department' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"parent_id" integer,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"start_date" date,
	"end_date" date,
	"path" text,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_key" UNIQUE("code"),
	CONSTRAINT "departments_status_check" CHECK ((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(20),
	"email" varchar(150),
	"password_hash" varchar(255),
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"role_id" integer,
	"system_role" varchar(20) DEFAULT 'USER' NOT NULL,
	"per_number" varchar(50),
	"novator_status" integer DEFAULT 0,
	"department_code" varchar(50),
	"division_code" varchar(50),
	"manager_per_number" varchar(50),
	"provider" varchar(20) DEFAULT 'LOCAL' NOT NULL,
	"azure_oid" varchar(100),
	"last_login_at" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_key" UNIQUE("phone"),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_per_number_key" UNIQUE("per_number"),
	CONSTRAINT "users_azure_oid_key" UNIQUE("azure_oid"),
	CONSTRAINT "users_status_check" CHECK ((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'LOCKED'::character varying])::text[])),
	CONSTRAINT "users_system_role_check" CHECK ((system_role)::text = ANY ((ARRAY['USER'::character varying, 'SUPER_ADMIN'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"short_code" varchar(50),
	"name" varchar(100) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"parent_role_id" bigint,
	"department_id" integer,
	"planning_method" varchar(20) DEFAULT 'BY_PROJECT',
	"lead_time_months" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_key" UNIQUE("code"),
	CONSTRAINT "roles_planning_method_check" CHECK ((planning_method)::text = ANY ((ARRAY['BY_SECTOR'::character varying, 'BY_REGION'::character varying, 'BY_PROJECT'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "sectors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sector_id" integer NOT NULL,
	"code" varchar(50),
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "regions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "milestones_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_projects" ADD CONSTRAINT "headcount_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_values" ADD CONSTRAINT "property_values_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_values" ADD CONSTRAINT "property_values_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_replacement_user_id_fkey" FOREIGN KEY ("replacement_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_dependencies" ADD CONSTRAINT "milestone_dependencies_from_milestone_id_fkey" FOREIGN KEY ("from_milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_dependencies" ADD CONSTRAINT "milestone_dependencies_to_milestone_id_fkey" FOREIGN KEY ("to_milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_standards" ADD CONSTRAINT "headcount_standards_from_milestone_id_fkey" FOREIGN KEY ("from_milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_standards" ADD CONSTRAINT "headcount_standards_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_standards" ADD CONSTRAINT "headcount_standards_to_milestone_id_fkey" FOREIGN KEY ("to_milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_criteria" ADD CONSTRAINT "headcount_criteria_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_criteria" ADD CONSTRAINT "headcount_criteria_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "public"."headcount_standards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_monthly_factors" ADD CONSTRAINT "headcount_monthly_factors_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "public"."headcount_standards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
*/