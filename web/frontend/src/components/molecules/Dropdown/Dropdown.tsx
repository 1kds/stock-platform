"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DropdownProps } from "./Dropdown.types";

/** 트리거 버튼 공통 스타일(목업/실선택 트리거 동일). */
const TRIGGER_CLASS =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted";

/**
 * 드롭다운 셀렉트.
 * - options/value/onChange가 있으면 controlled 메뉴로 동작(실제 선택).
 * - options가 없으면 표시 전용(목업) 트리거.
 */
export function Dropdown({ label, options, value, onChange, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const interactive = Boolean(options && onChange);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const selected = options?.find((o) => o.value === value);
  const triggerText = selected ? `${label}: ${selected.label ?? selected.value}` : label;

  if (!interactive) {
    return (
      <button type="button" className={cn(TRIGGER_CLASS, className)}>
        {label}
        <ChevronDown className="size-3.5" />
      </button>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={TRIGGER_CLASS}
      >
        {triggerText}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-full max-w-64 overflow-hidden rounded-md border border-border bg-card py-1 shadow-md"
        >
          {options!.map((o) => {
            const isActive = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange!(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {o.label ?? o.value}
                  {isActive && <Check className="size-3.5 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
