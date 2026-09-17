import { relations } from "drizzle-orm/relations";
import { roles, properties, propertyDepartments, regions, projects, headcountProjects, propertyValues, userProjects, users, milestones, milestoneDependencies, plans, headcountStandards, phases, headcountCriteria, headcountMonthlyFactors, departments, sectors, sessions, permissions, accessRoles, accessRolePermissions, userAccessRoles } from "./schema";

export const propertiesRelations = relations(properties, ({many}) => ({
	propertyValues: many(propertyValues),
	headcountCriteria: many(headcountCriteria),
	propertyDepartments: many(propertyDepartments),
}));

export const rolesRelations = relations(roles, ({one, many}) => ({
	userProjects: many(userProjects),
	headcountStandards: many(headcountStandards),
	users: many(users),
	department: one(departments, {
		fields: [roles.departmentId],
		references: [departments.id]
	}),
	role: one(roles, {
		fields: [roles.parentRoleId],
		references: [roles.id],
		relationName: "roles_parentRoleId_roles_id"
	}),
	roles: many(roles, {
		relationName: "roles_parentRoleId_roles_id"
	}),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	region: one(regions, {
		fields: [projects.regionId],
		references: [regions.id]
	}),
	headcountProjects: many(headcountProjects),
	propertyValues: many(propertyValues),
	userProjects: many(userProjects),
	plans: many(plans),
}));

export const regionsRelations = relations(regions, ({one, many}) => ({
	projects: many(projects),
	sector: one(sectors, {
		fields: [regions.sectorId],
		references: [sectors.id]
	}),
}));

export const headcountProjectsRelations = relations(headcountProjects, ({one}) => ({
	project: one(projects, {
		fields: [headcountProjects.projectId],
		references: [projects.id]
	}),
}));

export const propertyValuesRelations = relations(propertyValues, ({one}) => ({
	project: one(projects, {
		fields: [propertyValues.projectId],
		references: [projects.id]
	}),
	property: one(properties, {
		fields: [propertyValues.propertyId],
		references: [properties.id]
	}),
}));

export const userProjectsRelations = relations(userProjects, ({one}) => ({
	project: one(projects, {
		fields: [userProjects.projectId],
		references: [projects.id]
	}),
	user_replacementUserId: one(users, {
		fields: [userProjects.replacementUserId],
		references: [users.id],
		relationName: "userProjects_replacementUserId_users_id"
	}),
	role: one(roles, {
		fields: [userProjects.roleId],
		references: [roles.id]
	}),
	user_userId: one(users, {
		fields: [userProjects.userId],
		references: [users.id],
		relationName: "userProjects_userId_users_id"
	}),
	accessRole: one(accessRoles, {
		fields: [userProjects.accessRoleId],
		references: [accessRoles.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	userProjects_replacementUserId: many(userProjects, {
		relationName: "userProjects_replacementUserId_users_id"
	}),
	userProjects_userId: many(userProjects, {
		relationName: "userProjects_userId_users_id"
	}),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	sessions: many(sessions),
}));

export const milestoneDependenciesRelations = relations(milestoneDependencies, ({one}) => ({
	milestone_fromMilestoneId: one(milestones, {
		fields: [milestoneDependencies.fromMilestoneId],
		references: [milestones.id],
		relationName: "milestoneDependencies_fromMilestoneId_milestones_id"
	}),
	milestone_toMilestoneId: one(milestones, {
		fields: [milestoneDependencies.toMilestoneId],
		references: [milestones.id],
		relationName: "milestoneDependencies_toMilestoneId_milestones_id"
	}),
}));

export const milestonesRelations = relations(milestones, ({many}) => ({
	milestoneDependencies_fromMilestoneId: many(milestoneDependencies, {
		relationName: "milestoneDependencies_fromMilestoneId_milestones_id"
	}),
	milestoneDependencies_toMilestoneId: many(milestoneDependencies, {
		relationName: "milestoneDependencies_toMilestoneId_milestones_id"
	}),
	headcountStandards_fromMilestoneId: many(headcountStandards, {
		relationName: "headcountStandards_fromMilestoneId_milestones_id"
	}),
	headcountStandards_toMilestoneId: many(headcountStandards, {
		relationName: "headcountStandards_toMilestoneId_milestones_id"
	}),
	phases: many(phases),
}));

export const plansRelations = relations(plans, ({one, many}) => ({
	project: one(projects, {
		fields: [plans.projectId],
		references: [projects.id]
	}),
	phases: many(phases),
}));

export const headcountStandardsRelations = relations(headcountStandards, ({one, many}) => ({
	fromMilestone: one(milestones, {
		fields: [headcountStandards.fromMilestoneId],
		references: [milestones.id],
		relationName: "headcountStandards_fromMilestoneId_milestones_id"
	}),
	toMilestone: one(milestones, {
		fields: [headcountStandards.toMilestoneId],
		references: [milestones.id],
		relationName: "headcountStandards_toMilestoneId_milestones_id"
	}),
	role: one(roles, {
		fields: [headcountStandards.roleId],
		references: [roles.id]
	}),
	headcountCriteria: many(headcountCriteria),
	headcountMonthlyFactors: many(headcountMonthlyFactors),
}));

export const phasesRelations = relations(phases, ({one}) => ({
	milestone: one(milestones, {
		fields: [phases.milestoneId],
		references: [milestones.id]
	}),
	plan: one(plans, {
		fields: [phases.planId],
		references: [plans.id]
	}),
}));

export const headcountCriteriaRelations = relations(headcountCriteria, ({one}) => ({
	property: one(properties, {
		fields: [headcountCriteria.propertyId],
		references: [properties.id]
	}),
	headcountStandard: one(headcountStandards, {
		fields: [headcountCriteria.standardId],
		references: [headcountStandards.id]
	}),
}));

export const headcountMonthlyFactorsRelations = relations(headcountMonthlyFactors, ({one}) => ({
	headcountStandard: one(headcountStandards, {
		fields: [headcountMonthlyFactors.standardId],
		references: [headcountStandards.id]
	}),
}));

export const departmentsRelations = relations(departments, ({one, many}) => ({
	department: one(departments, {
		fields: [departments.parentId],
		references: [departments.id],
		relationName: "departments_parentId_departments_id"
	}),
	departments: many(departments, {
		relationName: "departments_parentId_departments_id"
	}),
	roles: many(roles),
	propertyDepartments: many(propertyDepartments),
}));

export const propertyDepartmentsRelations = relations(propertyDepartments, ({one}) => ({
	property: one(properties, {
		fields: [propertyDepartments.propertyId],
		references: [properties.id],
	}),
	department: one(departments, {
		fields: [propertyDepartments.departmentId],
		references: [departments.id],
	}),
}));

export const sectorsRelations = relations(sectors, ({many}) => ({
	regions: many(regions),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	accessRolePermissions: many(accessRolePermissions),
}));

export const accessRolesRelations = relations(accessRoles, ({one, many}) => ({
	creator: one(users, {
		fields: [accessRoles.createdBy],
		references: [users.id]
	}),
	accessRolePermissions: many(accessRolePermissions),
	userAccessRoles: many(userAccessRoles),
	userProjects: many(userProjects),
}));

export const accessRolePermissionsRelations = relations(accessRolePermissions, ({one}) => ({
	accessRole: one(accessRoles, {
		fields: [accessRolePermissions.accessRoleId],
		references: [accessRoles.id]
	}),
	permission: one(permissions, {
		fields: [accessRolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const userAccessRolesRelations = relations(userAccessRoles, ({one}) => ({
	user: one(users, {
		fields: [userAccessRoles.userId],
		references: [users.id],
		relationName: "userAccessRoles_userId_users_id"
	}),
	accessRole: one(accessRoles, {
		fields: [userAccessRoles.accessRoleId],
		references: [accessRoles.id]
	}),
	grantor: one(users, {
		fields: [userAccessRoles.grantedBy],
		references: [users.id],
		relationName: "userAccessRoles_grantedBy_users_id"
	}),
}));