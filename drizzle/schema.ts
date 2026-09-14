import { pgTable, foreignKey, unique, check, serial, varchar, jsonb, integer, text, boolean, timestamp, date, numeric, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const properties = pgTable("properties", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	dataType: varchar("data_type", { length: 20 }).default('NUMBER').notNull(),
	unit: varchar({ length: 20 }),
	options: jsonb(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("properties_code_key").on(table.code),
	check("properties_data_type_check", sql`(data_type)::text = ANY ((ARRAY['NUMBER'::character varying, 'STRING'::character varying, 'BOOLEAN'::character varying, 'SELECT'::character varying])::text[])`),
]);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }),
	name: varchar({ length: 200 }).notNull(),
	address: text(),
	generalInfo: text("general_info"),
	regionId: integer("region_id"),
	status: varchar({ length: 20 }).default('ACTIVE').notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	thumbnail: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.regionId],
			foreignColumns: [regions.id],
			name: "projects_region_id_fkey"
		}).onDelete("restrict"),
	unique("projects_code_key").on(table.code),
	check("projects_status_check", sql`(status)::text = ANY ((ARRAY['PLANNING'::character varying, 'ACTIVE'::character varying, 'PAUSED'::character varying, 'COMPLETED'::character varying])::text[])`),
]);

export const headcountProjects = pgTable("headcount_projects", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "headcount_projects_project_id_fkey"
		}).onDelete("cascade"),
	unique("headcount_projects_project_id_key").on(table.projectId),
]);

export const propertyValues = pgTable("property_values", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	propertyId: integer("property_id").notNull(),
	projectType: varchar("project_type", { length: 50 }),
	valueText: text("value_text"),
	valueNumber: numeric("value_number", { precision: 15, scale:  4 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "property_values_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_values_property_id_fkey"
		}).onDelete("restrict"),
	unique("property_values_project_id_property_id_project_type_key").on(table.projectId, table.propertyId, table.projectType),
]);

export const userProjects = pgTable("user_projects", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	projectId: integer("project_id").notNull(),
	roleId: integer("role_id").notNull(),
	isPrimary: boolean("is_primary").default(true).notNull(),
	effectiveFrom: date("effective_from").default(sql`CURRENT_DATE`).notNull(),
	effectiveTo: date("effective_to"),
	status: varchar({ length: 20 }).default('ACTIVE').notNull(),
	replacementUserId: integer("replacement_user_id"),
	replacementFrom: date("replacement_from"),
	replacementTo: date("replacement_to"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "user_projects_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.replacementUserId],
			foreignColumns: [users.id],
			name: "user_projects_replacement_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_projects_role_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_projects_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_projects_user_id_project_id_role_id_effective_from_key").on(table.userId, table.projectId, table.roleId, table.effectiveFrom),
	check("user_projects_status_check", sql`(status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'ENDED'::character varying])::text[])`),
]);

export const milestoneDependencies = pgTable("milestone_dependencies", {
	id: serial().primaryKey().notNull(),
	fromMilestoneId: integer("from_milestone_id").notNull(),
	toMilestoneId: integer("to_milestone_id").notNull(),
	dependencyType: varchar("dependency_type", { length: 20 }).default('FINISH_TO_START').notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fromMilestoneId],
			foreignColumns: [milestones.id],
			name: "milestone_dependencies_from_milestone_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.toMilestoneId],
			foreignColumns: [milestones.id],
			name: "milestone_dependencies_to_milestone_id_fkey"
		}).onDelete("cascade"),
	unique("milestone_dependencies_from_milestone_id_to_milestone_id_key").on(table.fromMilestoneId, table.toMilestoneId),
]);

export const plans = pgTable("plans", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	versionName: varchar("version_name", { length: 50 }).notNull(),
	status: varchar({ length: 20 }).default('DRAFT').notNull(),
	validFrom: date("valid_from").notNull(),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "plans_project_id_fkey"
		}).onDelete("cascade"),
	unique("plans_project_id_version_name_key").on(table.projectId, table.versionName),
	check("plans_status_check", sql`(status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'ARCHIVED'::character varying])::text[])`),
]);

export const headcountStandards = pgTable("headcount_standards", {
	id: serial().primaryKey().notNull(),
	roleId: integer("role_id").notNull(),
	fromMilestoneId: integer("from_milestone_id").notNull(),
	toMilestoneId: integer("to_milestone_id"),
	headcount: numeric({ precision: 10, scale:  4 }).default('1.0').notNull(),
	headcountMin: numeric("headcount_min", { precision: 10, scale:  4 }),
	headcountMax: numeric("headcount_max", { precision: 10, scale:  4 }),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fromMilestoneId],
			foreignColumns: [milestones.id],
			name: "headcount_standards_from_milestone_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "headcount_standards_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.toMilestoneId],
			foreignColumns: [milestones.id],
			name: "headcount_standards_to_milestone_id_fkey"
		}).onDelete("set null"),
]);

export const phases = pgTable("phases", {
	id: serial().primaryKey().notNull(),
	planId: integer("plan_id").notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
	milestoneId: integer("milestone_id").notNull(),
	startMonth: integer("start_month").default(1).notNull(),
	durationMonths: integer("duration_months").default(1).notNull(),
	isAnchor: boolean("is_anchor").default(false).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: "phases_milestone_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "phases_plan_id_fkey"
		}).onDelete("cascade"),
	unique("phases_plan_id_milestone_id_key").on(table.planId, table.milestoneId),
]);

export const headcountCriteria = pgTable("headcount_criteria", {
	id: serial().primaryKey().notNull(),
	standardId: integer("standard_id").notNull(),
	propertyId: integer("property_id").notNull(),
	conditionOperator: varchar("condition_operator", { length: 20 }).default('BETWEEN').notNull(),
	minValue: numeric("min_value", { precision: 15, scale:  4 }),
	maxValue: numeric("max_value", { precision: 15, scale:  4 }),
	valueText: text("value_text"),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "headcount_criteria_property_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.standardId],
			foreignColumns: [headcountStandards.id],
			name: "headcount_criteria_standard_id_fkey"
		}).onDelete("cascade"),
	unique("headcount_criteria_standard_id_property_id_min_value_max_va_key").on(table.standardId, table.propertyId, table.minValue, table.maxValue),
	check("headcount_criteria_condition_operator_check", sql`(condition_operator)::text = ANY ((ARRAY['='::character varying, '<'::character varying, '<='::character varying, '>'::character varying, '>='::character varying, 'BETWEEN'::character varying])::text[])`),
]);

export const headcountMonthlyFactors = pgTable("headcount_monthly_factors", {
	id: serial().primaryKey().notNull(),
	standardId: integer("standard_id").notNull(),
	durationMonths: integer("duration_months").notNull(),
	monthNo: integer("month_no").notNull(),
	factor: numeric({ precision: 10, scale:  2 }).default('1.0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.standardId],
			foreignColumns: [headcountStandards.id],
			name: "headcount_monthly_factors_standard_id_fkey"
		}).onDelete("cascade"),
	unique("headcount_monthly_factors_standard_id_duration_months_month_key").on(table.standardId, table.durationMonths, table.monthNo),
]);

export const departments = pgTable("departments", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).default('Department').notNull(),
	level: integer().default(1).notNull(),
	parentId: integer("parent_id"),
	status: varchar({ length: 20 }).default('ACTIVE').notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	path: text(),
	description: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "departments_parent_id_fkey"
		}).onDelete("restrict"),
	unique("departments_code_key").on(table.code),
	check("departments_status_check", sql`(status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])`),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 150 }).notNull(),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 150 }),
	passwordHash: varchar("password_hash", { length: 255 }),
	status: varchar({ length: 20 }).default('ACTIVE').notNull(),
	roleId: integer("role_id"),
	systemRole: varchar("system_role", { length: 20 }).default('USER').notNull(),
	perNumber: varchar("per_number", { length: 50 }),
	novatorStatus: integer("novator_status").default(0),
	departmentCode: varchar("department_code", { length: 50 }),
	divisionCode: varchar("division_code", { length: 50 }),
	managerPerNumber: varchar("manager_per_number", { length: 50 }),
	provider: varchar({ length: 20 }).default('LOCAL').notNull(),
	azureOid: varchar("azure_oid", { length: 100 }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_fkey"
		}).onDelete("set null"),
	unique("users_phone_key").on(table.phone),
	unique("users_email_key").on(table.email),
	unique("users_per_number_key").on(table.perNumber),
	unique("users_azure_oid_key").on(table.azureOid),
	check("users_status_check", sql`(status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'LOCKED'::character varying])::text[])`),
	check("users_system_role_check", sql`(system_role)::text = ANY ((ARRAY['USER'::character varying, 'SUPER_ADMIN'::character varying])::text[])`),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }),
	shortCode: varchar("short_code", { length: 50 }),
	name: varchar({ length: 100 }).notNull(),
	level: integer().default(1).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentRoleId: bigint("parent_role_id", { mode: "number" }),
	departmentId: integer("department_id"),
	planningMethod: varchar("planning_method", { length: 20 }).default('BY_PROJECT'),
	leadTimeMonths: integer("lead_time_months").default(0).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "roles_department_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.parentRoleId],
			foreignColumns: [table.id],
			name: "roles_parent_role_id_fkey"
		}).onDelete("restrict"),
	unique("roles_code_key").on(table.code),
	check("roles_planning_method_check", sql`(planning_method)::text = ANY ((ARRAY['BY_SECTOR'::character varying, 'BY_REGION'::character varying, 'BY_PROJECT'::character varying])::text[])`),
]);

export const sectors = pgTable("sectors", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("sectors_code_key").on(table.code),
]);

export const regions = pgTable("regions", {
	id: serial().primaryKey().notNull(),
	sectorId: integer("sector_id").notNull(),
	code: varchar({ length: 50 }),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sectorId],
			foreignColumns: [sectors.id],
			name: "regions_sector_id_fkey"
		}).onDelete("restrict"),
	unique("regions_code_key").on(table.code),
]);

export const milestones = pgTable("milestones", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("milestones_code_key").on(table.code),
]);

export const sessions = pgTable("sessions", {
	id: varchar({ length: 64 }).primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
]);
