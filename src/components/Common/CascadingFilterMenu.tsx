"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon, FilterIcon } from "@/components/Common/icons";

export type FilterOption = {
  value: string;
  label: string;
  prefix?: string;
  dot?: string;
};

export type FilterGroup = {
  key: string;
  label: string;
  options: readonly FilterOption[];
};

export function CascadingFilterMenu({
  groups,
  selected,
  onChange,
  onClear,
  triggerLabel = "Bộ lọc",
}: {
  groups: readonly FilterGroup[];
  selected: Readonly<Record<string, readonly string[]>>;
  onChange: (next: Record<string, readonly string[]>) => void;
  onClear: () => void;
  triggerLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const totalSelected = Object.values(selected).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveGroup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveGroup(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const toggleValue = (groupKey: string, value: string) => {
    const current = selected[groupKey] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...selected, [groupKey]: next });
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setActiveGroup(null);
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        data-active={isOpen || totalSelected > 0}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm
                   text-muted-foreground bg-card transition-colors duration-150
                   hover:bg-muted hover:text-foreground cursor-pointer
                   data-[active=true]:bg-muted data-[active=true]:text-foreground"
      >
        <FilterIcon className="size-4" />
        {triggerLabel}
        {totalSelected > 0 && (
          <span className="font-mono rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
            {totalSelected}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border
                     bg-card p-1 shadow-xl"
        >
          {groups.map((group) => {
            const count = (selected[group.key] ?? []).length;
            const isActive = activeGroup === group.key;

            return (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => setActiveGroup(group.key)}
              >
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={isActive}
                  onClick={() => setActiveGroup(isActive ? null : group.key)}
                  onFocus={() => setActiveGroup(group.key)}
                  data-active={isActive}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm
                             text-muted-foreground transition-colors duration-150 cursor-pointer
                             hover:bg-muted hover:text-foreground
                             data-[active=true]:bg-muted data-[active=true]:text-foreground"
                >
                  <span className="flex-1 truncate">{group.label}</span>
                  {count > 0 && (
                    <span className="font-mono text-xs text-primary font-semibold">{count}</span>
                  )}
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>

                {isActive && (
                  <div
                    role="menu"
                    className="absolute left-full top-0 z-50 ml-1 w-72 rounded-xl border border-border
                               bg-card p-1 shadow-xl"
                  >
                    {group.options.map((option) => {
                      const isChecked = (selected[group.key] ?? []).includes(
                        option.value,
                      );
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={isChecked}
                          onClick={() => toggleValue(group.key, option.value)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm
                                     text-muted-foreground transition-colors duration-150 cursor-pointer
                                     hover:bg-muted hover:text-foreground"
                        >
                          <span
                            data-checked={isChecked}
                            className="flex size-4 shrink-0 items-center justify-center rounded
                                       border border-border
                                       data-[checked=true]:border-primary data-[checked=true]:bg-primary
                                       data-[checked=true]:text-white"
                          >
                            {isChecked && <CheckIcon className="size-3" />}
                          </span>
                          {option.dot && (
                            <span
                              className={`size-2 shrink-0 rounded-full ${option.dot}`}
                              aria-hidden
                            />
                          )}
                          {option.prefix && (
                            <span className="font-mono shrink-0 text-muted-foreground">
                              {option.prefix}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {totalSelected > 0 && (
            <>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                role="menuitem"
                onClick={onClear}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm
                           text-muted-foreground transition-colors duration-150 cursor-pointer
                           hover:bg-muted hover:text-foreground"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
