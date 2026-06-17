import { cn } from "@/lib/utils";
import { scoreSummaryLine, reportHighlights, resultNarrative } from "@/lib/report";
import type { Top3Item } from "@/lib/api";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import type { ReportDetailProps } from "./ReportDetail.types";

type Stock = ReportDetailProps["stocks"][number];

/** 종목 한 칸 — 헤더 + 1줄 점수 요약 + 기사형 분석 포인트(점수 있을 때) / 결과 설명(없을 때). */
function StockBlock({
  stock,
  detail,
  day,
  highlightCount,
}: {
  stock: Stock;
  detail?: Top3Item;
  day: ReportDetailProps["day"];
  highlightCount: number;
}) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {stock.rank}
          </span>
          <span className="truncate font-semibold text-foreground">{stock.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{stock.symbol}</span>
        </div>
        {detail && <ScoreBadge score={detail.final_score} />}
      </div>

      {detail ? (
        <>
          <p className="text-xs font-medium tabular-nums text-foreground/80">{scoreSummaryLine(detail)}</p>
          <ul className="mt-0.5 flex flex-col gap-2">
            {reportHighlights(detail, highlightCount).map((h) => (
              <li key={h.tag} className="border-l-2 border-accent/40 pl-2.5">
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="text-xs text-muted-foreground">{h.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">선정 사유</span> · {detail.reason}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{resultNarrative(stock.rank, day)}</p>
      )}
    </div>
  );
}

/**
 * 리포트 펼침 영역 — 그날 추천 종목별 분석.
 * 1위는 위쪽 전체폭, 2·3위는 아래 2열로 배치해 한 화면에 모두 보이게 한다.
 * 점수가 있으면 1줄 점수 요약 + 기사형 분석 포인트, 없으면 결과 기반 간단 설명.
 */
export function ReportDetail({ stocks, detail, day, className }: ReportDetailProps) {
  const findDetail = (s: Stock) => detail?.find((it) => it.symbol === s.symbol);
  const [lead, ...rest] = stocks;

  return (
    <div className={cn("mt-3 flex flex-col gap-3 border-t border-border pt-3", className)}>
      {lead && <StockBlock stock={lead} detail={findDetail(lead)} day={day} highlightCount={3} />}
      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((s) => (
            <StockBlock key={s.symbol} stock={s} detail={findDetail(s)} day={day} highlightCount={2} />
          ))}
        </div>
      )}
    </div>
  );
}
