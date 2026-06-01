import type { Top3Item } from "@/lib/api";

export interface Top3CardProps {
  item: Top3Item;
  /** 1위 강조 (petrol 보더) */
  rankAccent?: boolean;
  onClick?: () => void;
  className?: string;
}
