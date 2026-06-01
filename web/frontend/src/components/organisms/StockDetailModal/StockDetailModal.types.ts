import type { Top3Item } from "@/lib/api";

export interface StockDetailModalProps {
  item: Top3Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
