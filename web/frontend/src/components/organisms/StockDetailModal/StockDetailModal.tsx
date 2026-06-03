"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SCORE_ITEMS, RISK_PENALTY_MAX } from "@/lib/scores";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import { ScoreBar } from "@/components/molecules/ScoreBar";
import type { StockDetailModalProps } from "./StockDetailModal.types";

/** 종목 상세 모달 — 7항목 점수바 + 리스크 감점 + 선정 이유. */
export function StockDetailModal({ item, open, onOpenChange }: StockDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>
                {item.name}{" "}
                <span className="font-normal text-muted-foreground">({item.symbol})</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-3">
              <ScoreBadge score={item.final_score} />
              <span className="text-sm text-muted-foreground">최종 점수</span>
            </div>
            <div className="mt-2 flex flex-col gap-2.5">
              {SCORE_ITEMS.map(({ key, label, max }) => (
                <ScoreBar key={key} label={label} value={item.scores[key]} max={max} />
              ))}
              <ScoreBar
                label="리스크"
                value={item.scores.risk_penalty}
                max={RISK_PENALTY_MAX}
                penalty
              />
            </div>
            <DialogDescription className="mt-2">{item.reason}</DialogDescription>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
