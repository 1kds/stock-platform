import type { ScoreRow } from "@/lib/api";

export interface WatchlistProps {
  /** 표시할 행 (예: 4~10위). 페이지가 잘라서 전달한다. */
  rows: ScoreRow[];
  /** "전체 보기" 링크 경로. */
  href?: string;
  className?: string;
}
