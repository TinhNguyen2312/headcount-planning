import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  FindingSeverity,
  FindingStatus,
  HouseType,
  ReasoningGroup,
} from "@/constants/enums";

export * from "@/constants/enums";

/* -------------------------------------------------------------------------- */
/* StatusCounts                                                               */
/* -------------------------------------------------------------------------- */
export type StatusCounts = Readonly<Record<FindingStatus, number>>;

export const EMPTY_STATUS_COUNTS: StatusCounts = {
  fail: 0,
  warning: 0,
  pending: 0,
  pass: 0,
  approved: 0,
  unknown: 0,
};

/* -------------------------------------------------------------------------- */
/* Review Types                                                               */
/* -------------------------------------------------------------------------- */
export type ReviewStatus = "draft" | "processing" | "completed";
export type ProcessingState = "idle" | "running" | "failed";

export type Review = {
  id: string;
  code: string;
  name: string;
  status: ReviewStatus;
  processingState: ProcessingState;
  progressPercent?: number;
  pageCount: number;
  zoneName: string;
  houseType: HouseType;
  statusCounts: StatusCounts;
  updatedAt: string;
  assignee: { name: string; initials: string };
};

export type ChtkStandardSet = {
  id: string;
  name: string;
  fileName: string;
  ruleCount: number;
  uploadedAt: string;
};

export type ZoneOption = {
  id: string;
  name: string;
};

export type CreateReviewInput = {
  name: string;
  zoneId: string;
  standardSetId: string;
  houseType: HouseType;
  categories: readonly ChtkCategory[];
  file: { name: string; sizeBytes: number };
};

export type ReviewCheckTypeBreakdown = {
  checkType: CheckType;
  count: number;
};

export type ProcessingStepDef = {
  key: string;
  label: string;
};

/* -------------------------------------------------------------------------- */
/* Finding Types                                                              */
/* -------------------------------------------------------------------------- */
export type ReviewDossier = {
  id: string;
  code: string;
  name: string;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Finding = {
  id: string;
  reviewId: string;
  status: FindingStatus;
  severity: FindingSeverity;
  ruleIndex: string;
  detailLabel: string;
  extractedValue: string;
  standardValue: string;
  confidence: number;
  group: ReasoningGroup;
  category: ChtkCategory;
  pageNumber: number;
  boundingBox: BoundingBox;
  note?: string;
};

/* -------------------------------------------------------------------------- */
/* Rule Types                                                                 */
/* -------------------------------------------------------------------------- */
export type Rule = {
  id: string;
  code: string;
  title: string;
  category: ChtkCategory;
  checkType: CheckType;
  operator: ComparisonOperator;
  value: string;
  houseTypes: readonly HouseType[];
  note?: string;
  isActive: boolean;
};

export type RuleFilterState = {
  category: readonly ChtkCategory[];
  checkType: readonly CheckType[];
  houseType: readonly HouseType[];
  operator: readonly ComparisonOperator[];
};

export const EMPTY_RULE_FILTER: RuleFilterState = {
  category: [],
  checkType: [],
  houseType: [],
  operator: [],
};

export type CreateRuleInput = Omit<Rule, "id" | "category">;

/* -------------------------------------------------------------------------- */
/* Dashboard Types                                                            */
/* -------------------------------------------------------------------------- */
export type GroupPassRate = {
  category: ChtkCategory;
  concluded: number;
  passed: number;
  missing: number;
  percent: number;
};

export type CheckTypeBreakdown = {
  checkType: CheckType;
  total: number;
  counts: StatusCounts;
};

export type DashboardSummary = {
  actionRequired: number;
  averagePassRate: number;
  passRateNumerator: number;
  passRateDenominator: number;
  testedCriteria: number;
  completedReviewCount: number;
  standardLevel: string;
  activeRuleCount: number;
  totalRuleCount: number;
  groupPassRates: readonly GroupPassRate[];
  checkTypeBreakdowns: readonly CheckTypeBreakdown[];
  statusTotals: StatusCounts;
};
