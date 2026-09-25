export interface DmdCompetency {
  code: string
  group: string
  name: string
}

export interface WorkflowStep {
  stt: string
  step_name: string
  info_provider: string
  performer: string
  duration: string
  notes_and_forms: string
}

export interface DmdTickedItem {
  code: string
  group: string
  name: string
  mark: string
}

export interface DmdMatrixStep {
  section: string
  stt: string
  name: string
  weight: number | null
  ticked_nv: DmdTickedItem[]
  // Client state properties
  startDatePlan?: string
  endDatePlan?: string
  startDateActual?: string
  endDateActual?: string
  status?: "TODO" | "IN_PROGRESS" | "DONE"
}

export interface GateChecklistItem {
  id: string
  label: string
  requiredDoc: string
  department: string
  isCompleted: boolean
  completedAt?: string
}

export interface StageDefinition {
  stage_code: string
  sop_stt: string
  stage_name: string
  official_form: string
  docx_section: string
  description: string
  total_workflow_steps: number
  total_dmd_matrix_steps: number
  workflow_steps: WorkflowStep[]
  dmd_matrix_steps: DmdMatrixStep[]
  // Gate specific metadata
  gateStatus?: "LOCKED" | "IN_PROGRESS" | "REVIEW_PENDING" | "APPROVED"
  gateChecklist?: GateChecklistItem[]
}

export interface StageGateDataset {
  dmd_competencies_count: number
  dmd_competencies: DmdCompetency[]
  stages: StageDefinition[]
}

export type DesignProcessMode = "2_STEP" | "3_STEP"
