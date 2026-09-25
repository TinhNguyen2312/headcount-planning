"use client";

import { Tooltip, Switch } from "antd";
import {
  CHECK_TYPE_CONFIG,
  houseTypeFullLabel,
  houseTypeScopeLabel,
  OPERATOR_CONFIG,
} from "@/constants/domain";
import type { Rule } from "@/types";
import { RuleActionMenu, type RuleAction } from "./RuleActionMenu";

export function RuleRow({
  rule,
  onToggleActive,
  onAction,
}: {
  rule: Rule;
  onToggleActive: (next: boolean) => void;
  onAction: (action: RuleAction) => void;
}) {
  const checkType = CHECK_TYPE_CONFIG[rule.checkType];
  const operator = OPERATOR_CONFIG[rule.operator];
  const scope = houseTypeScopeLabel(rule.houseTypes);
  const isAllHouseTypes = scope === "Mọi loại nhà";

  return (
    <div
      data-inactive={!rule.isActive}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 px-3.5
                 transition-colors duration-150 hover:bg-muted/40
                 data-[inactive=true]:opacity-50"
    >
      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">Mã tiêu chí {rule.code}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Vị trí trong bộ tiêu chuẩn CHTK. Chữ số đầu quyết định nhóm: 1.x Mặt ngoài · 2.x Kích thước · 3.x Thang – Ramp · 4.x Cấu tạo · 5.x Hoàn thiện.
            </div>
          </div>
        }
      >
        <span className="numeric w-12 shrink-0 text-xs text-muted-foreground font-semibold">
          {rule.code}
        </span>
      </Tooltip>

      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">{rule.title}</div>
            {rule.note && <div className="text-[11px] text-muted-foreground mt-0.5">{rule.note}</div>}
            <div className="text-[11px] font-medium text-primary mt-1">
              {rule.isActive ? "Đang áp dụng" : "Đang tạm ngưng"}
            </div>
          </div>
        }
      >
        <span className="min-w-0 flex-1 basis-44 truncate text-xs font-medium text-foreground">
          {rule.title}
        </span>
      </Tooltip>

      <Tooltip
        title={
          <div>
            <div className="font-semibold text-xs">{operator.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{rule.value}</div>
          </div>
        }
      >
        <div className="flex min-w-0 basis-64 items-baseline gap-1.5 text-xs">
          <span className="shrink-0 rounded bg-muted/60 px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
            {operator.label}
          </span>
          <span className="min-w-0 truncate text-foreground/80 font-mono text-[11px]">{rule.value}</span>
        </div>
      </Tooltip>

      <div className="ml-auto flex items-center gap-2.5">
        <Tooltip
          placement="topRight"
          title={
            <div>
              <div className="font-semibold text-xs">Loại nhà áp dụng</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isAllHouseTypes ? "Áp dụng cho mọi loại nhà." : houseTypeFullLabel(rule.houseTypes)}
              </div>
            </div>
          }
        >
          <span className="hidden w-24 justify-center truncate whitespace-nowrap rounded border border-border px-1 py-0.5 text-center text-[10px] font-mono text-muted-foreground lg:inline-flex">
            {scope}
          </span>
        </Tooltip>

        <Tooltip
          placement="topRight"
          title={
            <div>
              <div className="font-semibold text-xs">{checkType.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{checkType.method}</div>
            </div>
          }
        >
          <span
            className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-bold ${checkType.badge}`}
          >
            {rule.checkType}
          </span>
        </Tooltip>

        <Switch
          size="small"
          checked={rule.isActive}
          onChange={onToggleActive}
          aria-label={`Áp dụng tiêu chí ${rule.code}`}
        />

        <RuleActionMenu ruleCode={rule.code} onAction={onAction} />
      </div>
    </div>
  );
}
