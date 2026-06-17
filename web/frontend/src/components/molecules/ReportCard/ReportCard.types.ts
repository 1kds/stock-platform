import type { ReactNode } from "react";

export interface ReportCardProps {
  date: string;
  title: string;
  /** Top3 종목 요약 (예: "삼성전자 · SK하이닉스 · NAVER") */
  stocks: string;
  hit: boolean;
  /** 평균 수익률(%) */
  ret: number;
  featured?: boolean;
  /** 펼침/접힘 토글 핸들러. 지정 시 헤더가 버튼이 되고 셰브론이 표시된다. */
  onToggle?: () => void;
  /** 현재 펼침 상태. onToggle과 함께 사용. */
  expanded?: boolean;
  /** 펼쳤을 때 헤더 아래에 표시할 상세 내용. */
  children?: ReactNode;
  className?: string;
}
