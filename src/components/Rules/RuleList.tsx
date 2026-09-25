"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "antd";
import { Plus, Upload } from "lucide-react";
import { EmptyState } from "@/components/Common/EmptyState";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/constants/domain";
import type { Rule, RuleFilterState } from "@/types";
import { EMPTY_RULE_FILTER } from "@/types";
import { AddRuleModal } from "./AddRuleModal";
import { RuleFilterBar } from "./RuleFilterBar";
import { RuleRow } from "./RuleRow";
import type { RuleAction } from "./RuleActionMenu";

function matches(rule: Rule, filters: RuleFilterState): boolean {
  if (filters.category.length > 0 && !filters.category.includes(rule.category)) {
    return false;
  }
  if (filters.checkType.length > 0 && !filters.checkType.includes(rule.checkType)) {
    return false;
  }
  if (filters.operator.length > 0 && !filters.operator.includes(rule.operator)) {
    return false;
  }
  if (
    filters.houseType.length > 0 &&
    !filters.houseType.some((h) => rule.houseTypes.includes(h))
  ) {
    return false;
  }
  return true;
}

export function RuleList({ rules: initialRules }: { rules: readonly Rule[] }) {
  const [rules, setRules] = useState<readonly Rule[]>(initialRules);
  const [filters, setFilters] = useState<RuleFilterState>(EMPTY_RULE_FILTER);
  const [overrides, setOverrides] = useState<Readonly<Record<string, boolean>>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const visible = useMemo(
    () => rules.filter((rule) => matches(rule, filters)),
    [rules, filters],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: visible.filter((rule) => rule.category === category),
      })).filter((group) => group.items.length > 0),
    [visible],
  );

  const handleAction = (rule: Rule, action: RuleAction) => {
    console.log(`[rules] ${action}`, rule.code);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex justify-end gap-2">
        <Tooltip title="Nhập tiêu chí hàng loạt từ file Excel sẽ có trong giai đoạn tới.">
          <button
            type="button"
            disabled
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground/60 opacity-60 cursor-not-allowed"
          >
            <Upload className="size-3.5" />
            Nhập Excel
          </button>
        </Tooltip>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Thêm tiêu chí mới
        </button>
      </div>

      <RuleFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={visible.length}
        totalCount={rules.length}
      />

      {grouped.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState message="Không có tiêu chí nào khớp bộ lọc." />
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ category, items }) => (
            <div
              key={category}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <h2 className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 bg-muted/20">
                <span
                  className={`size-2 shrink-0 rounded-full ${CATEGORY_CONFIG[category].dot}`}
                  aria-hidden
                />
                <span className="numeric text-xs font-semibold text-foreground">
                  {CATEGORY_CONFIG[category].section}.
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {CATEGORY_CONFIG[category].label}
                </span>
                <span className="numeric text-[11px] text-muted-foreground ml-auto">
                  {items.length} tiêu chí
                </span>
              </h2>

              <ul className="divide-y divide-border/60">
                {items.map((rule) => {
                  const isActive = overrides[rule.id] ?? rule.isActive;
                  return (
                    <li key={rule.id}>
                      <RuleRow
                        rule={{ ...rule, isActive }}
                        onToggleActive={(next) =>
                          setOverrides((prev) => ({ ...prev, [rule.id]: next }))
                        }
                        onAction={(action) => handleAction(rule, action)}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AddRuleModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={(rule) => {
          setRules((prev) => [rule, ...prev]);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
