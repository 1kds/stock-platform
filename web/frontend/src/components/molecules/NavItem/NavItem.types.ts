import type { ComponentType } from "react";

export interface NavItemProps {
  href: string;
  label: string;
  /** lucide-react 아이콘 컴포넌트 */
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  /** 모바일 드로어에서 항목 클릭 시 드로어를 닫기 위한 콜백 */
  onClick?: () => void;
  className?: string;
}
