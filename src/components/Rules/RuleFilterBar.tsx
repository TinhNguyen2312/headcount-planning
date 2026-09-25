"use client";

import { Button, Tag } from "antd";
import { X } from "lucide-react";
import { CascadingFilterMenu } from "@/components/Common/CascadingFilterMenu";
import {
  FILTER_GROUP_KEYS,
  FILTER_GROUP_LABEL,
  filterValueLabel,
  RULE_FILTER_GROUPS,
  type RuleFilterGroupKey,
} from "@/constants/rule.constants";
import { EMPTY_RULE_FILTER, type RuleFilterState } from "@/types";

export function RuleFilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: {
  filters: RuleFilterState;
  onChange: (next: RuleFilterState) => void;
  resultCount: number;
  totalCount: number;
}) {
  const selected: Record<string, readonly string[]> = {
    category: filters.category,
    checkType: filters.checkType,
    houseType: filters.houseType,
    operator: filters.operator,
  };

  const handleMenuChange = (next: Record<string, readonly string[]>) => {
    onChange({
      category: next.category as RuleFilterState["category"],
      checkType: next.checkType as RuleFilterState["checkType"],
      houseType: next.houseType as RuleFilterState["houseType"],
      operator: next.operator as RuleFilterState["operator"],
    });
  };

  const removeValue = (groupKey: RuleFilterGroupKey, value: string) => {
    handleMenuChange({
      ...selected,
      [groupKey]: (selected[groupKey] ?? []).filter((v) => v !== value),
    });
  };

  const activeChips = FILTER_GROUP_KEYS.flatMap((groupKey) =>
    (selected[groupKey] ?? []).map((value) => ({ groupKey, value })),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <CascadingFilterMenu
          groups={RULE_FILTER_GROUPS}
          selected={selected}
          onChange={handleMenuChange}
          onClear={() => onChange(EMPTY_RULE_FILTER)}
        />

        <span className="text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{resultCount}</span>
          {resultCount !== totalCount && (
            <>
              {" / "}
              <span className="font-mono">{totalCount}</span>
            </>
          )}{" "}
          tiêu chí
        </span>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map(({ groupKey, value }) => (
            <Tag
              key={`${groupKey}:${value}`}
              closable
              onClose={() => removeValue(groupKey, value)}
              closeIcon={<X className="size-3" />}
              className="px-2 py-0.5 text-xs inline-flex items-center gap-1"
            >
              <span className="text-muted-foreground">{FILTER_GROUP_LABEL[groupKey]}:</span>
              <span className="font-medium">{filterValueLabel(groupKey, value)}</span>
            </Tag>
          ))}

          <Button
            type="link"
            size="small"
            className="text-xs p-0 h-auto text-muted-foreground hover:text-foreground"
            onClick={() => onChange(EMPTY_RULE_FILTER)}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
