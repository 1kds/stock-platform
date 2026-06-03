export interface StatCardProps {
  label: string;
  value: string;
  /** 선택: 등락 델타(%) → TrendChip 표시 */
  trend?: number;
  /** 선택: 하단 보조 텍스트 */
  sub?: string;
  /** 값 색상: 수익률 등 부호 강조용 */
  valueTone?: "default" | "up" | "down";
  className?: string;
}
