import type { Top3Item } from "@/lib/api";

export interface Top3GridProps {
  items: Top3Item[];
  onSelect?: (item: Top3Item) => void;
  className?: string;
}
