"use client";

import { ArrowLeft, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Input } from "antd";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/Common/PageHeader";

export interface ManagementPageLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  headerActions?: ReactNode;
  actions?: ReactNode;
  searchBar?: ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  fullScreen?: boolean;
  children: ReactNode;
  modals?: ReactNode;
  containerClassName?: string;
}

export function ManagementPageLayout({
  title,
  subtitle,
  showBack = false,
  onBack,
  backLabel = "Quay lại",
  headerActions,
  actions,
  searchBar,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  fullScreen = false,
  children,
  modals,
  containerClassName = "",
}: ManagementPageLayoutProps) {
  const router = useRouter();

  const handleBack = onBack ?? (showBack ? () => router.back() : undefined);
  const effectiveActions = actions ?? headerActions;

  const effectiveSearchBar =
    searchBar ??
    (onSearchChange !== undefined ? (
      <Input
        prefix={<Search className="size-4 text-muted-foreground mr-1" />}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        className="max-w-md"
      />
    ) : null);

  return (
    <div
      className={`flex flex-col ${
        fullScreen ? "h-screen" : "flex-1 h-full min-h-0"
      } bg-background ${containerClassName}`}
    >
      <div className="shrink-0 border-b border-border bg-card px-4 py-3.5">
        <PageHeader
          title={title}
          subtitle={subtitle}
          leftSlot={
            handleBack ? (
              <Button
                icon={<ArrowLeft className="size-4" />}
                onClick={handleBack}
                type="text"
                className="font-medium"
              >
                {backLabel}
              </Button>
            ) : undefined
          }
          rightSlot={effectiveActions}
        />
      </div>

      {effectiveSearchBar && (
        <div className="px-4 py-3 border-b border-border shrink-0 bg-muted/20">
          {effectiveSearchBar}
        </div>
      )}

      <div className="relative flex-1 overflow-y-auto min-h-0 p-4 md:p-6">
        {children}
      </div>

      {modals}
    </div>
  );
}

export default ManagementPageLayout;
