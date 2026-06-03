export interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  /** 감점 항목(리스크): 빨강 + 음수 표기 */
  penalty?: boolean;
  className?: string;
}
