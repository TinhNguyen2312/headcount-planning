"use client";

import { Switch as AntSwitch } from "antd";

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <AntSwitch
      checked={checked}
      onChange={onChange}
      aria-label={label}
      size="small"
    />
  );
}
