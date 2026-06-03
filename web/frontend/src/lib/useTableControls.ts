"use client";

import { useState } from "react";

/** 정렬 방향. */
export type SortDir = "asc" | "desc";

export interface SortState<K extends string> {
  /** 현재 정렬 기준 컬럼 key (null = 정렬 없음). */
  key: K | null;
  dir: SortDir;
}

export interface UseTableControlsOptions<T, K extends string> {
  /** 정렬 가능한 컬럼 → 행에서 값 추출. 숫자/문자 모두 지원. */
  accessors: Record<K, (row: T) => number | string>;
  /** 초기 정렬 상태. */
  initialSort?: SortState<K>;
}

export interface UseTableControls<T, K extends string> {
  sort: SortState<K>;
  /** 헤더 클릭: 같은 key면 방향 토글, 다른 key면 해당 key로 desc 시작. */
  toggleSort: (key: K) => void;
  /** 입력 rows에 현재 정렬을 적용해 반환(원본 불변). */
  applySort: (rows: T[]) => T[];
}

/**
 * 테이블 컬럼 헤더 클릭 정렬을 위한 재사용 훅.
 * 필터(검색/드롭다운/세그먼트)는 각 organism이 자체 상태로 처리하고,
 * 공통 로직인 "정렬"만 여기서 담당한다.
 */
export function useTableControls<T, K extends string>({
  accessors,
  initialSort,
}: UseTableControlsOptions<T, K>): UseTableControls<T, K> {
  const [sort, setSort] = useState<SortState<K>>(
    initialSort ?? { key: null, dir: "desc" },
  );

  function toggleSort(key: K) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  }

  function applySort(rows: T[]): T[] {
    const { key, dir } = sort;
    if (!key) return rows;
    const accessor = accessors[key];
    const sorted = [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), "ko");
    });
    return dir === "asc" ? sorted : sorted.reverse();
  }

  return { sort, toggleSort, applySort };
}
