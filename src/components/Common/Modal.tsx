"use client";

import { Modal as AntModal } from "antd";
import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
  widthClassName = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}) {
  return (
    <AntModal
      title={<span className="text-base font-semibold">{title}</span>}
      open={true}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      className={widthClassName}
    >
      <div className="py-2">{children}</div>
    </AntModal>
  );
}
