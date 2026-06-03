export interface ReportCardProps {
  date: string;
  title: string;
  /** Top3 종목 요약 (예: "삼성전자 · SK하이닉스 · NAVER") */
  stocks: string;
  hit: boolean;
  /** 평균 수익률(%) */
  ret: number;
  featured?: boolean;
  className?: string;
}
