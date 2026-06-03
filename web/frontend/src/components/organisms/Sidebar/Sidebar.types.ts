export interface SidebarProps {
  /** "fixed": 데스크톱 고정 사이드바 / "drawer": 모바일 오프캔버스 내부 */
  variant?: "fixed" | "drawer";
  /** 드로어 모드에서 항목 클릭 시 드로어를 닫는 콜백 */
  onNavigate?: () => void;
  className?: string;
}
