"use client";

import { Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { MoreHorizontal, Eye, Edit3, Copy, Trash2 } from "lucide-react";

export type RuleAction = "view" | "edit" | "duplicate" | "delete";

export function RuleActionMenu({
  ruleCode,
  onAction,
}: {
  ruleCode: string;
  onAction: (action: RuleAction) => void;
}) {
  const items: MenuProps["items"] = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <Eye className="size-4" />,
      onClick: () => onAction("view"),
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <Edit3 className="size-4" />,
      onClick: () => onAction("edit"),
    },
    {
      key: "duplicate",
      label: "Nhân bản",
      icon: <Copy className="size-4" />,
      onClick: () => onAction("duplicate"),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Xóa tiêu chí",
      danger: true,
      icon: <Trash2 className="size-4" />,
      onClick: () => onAction("delete"),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        size="small"
        aria-label={`Thao tác với tiêu chí ${ruleCode}`}
        icon={<MoreHorizontal className="size-4 text-muted-foreground" />}
      />
    </Dropdown>
  );
}
