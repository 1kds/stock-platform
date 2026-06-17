"use client";

import { useEffect, useId, useRef, useState } from "react";
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
 * - 키보드: Esc 닫기, ArrowUp/Down 항목 이동, Enter/Space 선택, 열릴 때 포커스 이동.
 */
export function Dropdown({ label, options, value, onChange, bare, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const interactive = Boolean(options && onChange);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // 열릴 때 리스트로 포커스 이동(외부 시스템 동기화 — DOM 포커스).
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const selected = options?.find((o) => o.value === value);
  const triggerText = selected
    ? bare
      ? (selected.label ?? selected.value)
      : `${label}: ${selected.label ?? selected.value}`
    : label;

  // 열기: 현재 선택 항목(없으면 첫 항목)을 활성 인덱스로 잡고 메뉴를 연다.
  function openMenu() {
    const selectedIdx = options?.findIndex((o) => o.value === value) ?? -1;
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function selectAt(index: number) {
    const opt = options?.[index];
    if (!opt) return;
    onChange!(opt.value);
    close();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (!options) return;
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) selectAt(activeIndex);
        break;
      case "Tab":
        // 탭으로 포커스 이탈 시 메뉴 닫되 포커스는 자연 이동.
        close(false);
        break;
    }
  }

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
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={TRIGGER_CLASS}
      >
        {triggerText}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-20 mt-1 min-w-full max-w-64 overflow-hidden rounded-md border border-border bg-card py-1 shadow-md outline-none"
        >
          {options!.map((o, index) => {
            const isActive = o.value === value;
            const isHighlighted = index === activeIndex;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  id={`${listId}-opt-${index}`}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  onClick={() => selectAt(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors",
                    isHighlighted && "bg-muted",
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
