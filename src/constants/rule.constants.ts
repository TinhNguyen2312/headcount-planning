import type { FilterGroup } from "@/components/Common/CascadingFilterMenu";
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  CHECK_TYPE_CONFIG,
  CHECK_TYPE_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
  OPERATOR_CONFIG,
  OPERATOR_ORDER,
} from "@/constants/domain";

export const FILTER_GROUP_KEYS = [
  "category",
  "checkType",
  "houseType",
  "operator",
] as const;

export type RuleFilterGroupKey = (typeof FILTER_GROUP_KEYS)[number];

export const RULE_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: "category",
    label: "Nhóm CHTK",
    options: CATEGORY_ORDER.map((value) => ({
      value,
      prefix: `${CATEGORY_CONFIG[value].section}.`,
      label: CATEGORY_CONFIG[value].label,
      dot: CATEGORY_CONFIG[value].dot,
    })),
  },
  {
    key: "checkType",
    label: "Loại kiểm tra",
    options: CHECK_TYPE_ORDER.map((value) => ({
      value,
      prefix: `${value}.`,
      label: CHECK_TYPE_CONFIG[value].label,
      dot: CHECK_TYPE_CONFIG[value].dot,
    })),
  },
  {
    key: "houseType",
    label: "Loại nhà",
    options: HOUSE_TYPE_ORDER.map((value) => ({
      value,
      label: HOUSE_TYPE_CONFIG[value].label,
    })),
  },
  {
    key: "operator",
    label: "Phép so sánh",
    options: OPERATOR_ORDER.map((value) => ({
      value,
      label: OPERATOR_CONFIG[value].label,
    })),
  },
];

export const FILTER_GROUP_LABEL: Record<RuleFilterGroupKey, string> = {
  category: "Nhóm CHTK",
  checkType: "Loại kiểm tra",
  houseType: "Loại nhà",
  operator: "Phép so sánh",
};

export function filterValueLabel(
  groupKey: RuleFilterGroupKey,
  value: string,
): string {
  switch (groupKey) {
    case "category":
      return CATEGORY_CONFIG[value as keyof typeof CATEGORY_CONFIG]?.label ?? value;
    case "checkType":
      return CHECK_TYPE_CONFIG[value as keyof typeof CHECK_TYPE_CONFIG]?.title ?? value;
    case "houseType":
      return HOUSE_TYPE_CONFIG[value as keyof typeof HOUSE_TYPE_CONFIG]?.label ?? value;
    case "operator":
      return OPERATOR_CONFIG[value as keyof typeof OPERATOR_CONFIG]?.label ?? value;
  }
}
