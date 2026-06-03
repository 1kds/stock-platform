import type { ComponentType } from "react";

export interface NavItemProps {
  href: string;
  label: string;
  /** lucide-react 아이콘 컴포넌트 */
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  className?: string;
}
