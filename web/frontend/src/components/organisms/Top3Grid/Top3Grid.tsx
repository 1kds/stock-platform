import { cn } from "@/lib/utils";
import { Top3Card } from "@/components/molecules/Top3Card";
import type { Top3GridProps } from "./Top3Grid.types";

/** Top3 추천 카드 3개 그리드. 1위 강조, 클릭 → onSelect(상세 모달). */
export function Top3Grid({ items, onSelect, className }: Top3GridProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", className)}>
      {items.map((it) => (
        <Top3Card
          key={it.symbol}
          item={it}
          rankAccent={it.rank === 1}
          onClick={onSelect ? () => onSelect(it) : undefined}
        />
      ))}
    </div>
  );
}
