"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import { ScoreBar } from "@/components/molecules/ScoreBar";
import type { StockDetailModalProps } from "./StockDetailModal.types";

// 7개 지표 (common.md 5장)
const ITEMS = [
  ["undervaluation", "저평가", 25],
  ["investor_flow", "수급", 20],
  ["volume_spike", "거래량", 15],
  ["news_keyword", "뉴스", 10],
  ["momentum", "모멘텀", 20],
  ["earnings", "실적", 10],
] as const;

/** 종목 상세 모달 — 7항목 점수바 + 리스크 감점 + 선정 이유. */
export function StockDetailModal({ item, open, onOpenChange }: StockDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
              {ITEMS.map(([key, label, max]) => (
                <ScoreBar key={key} label={label} value={item.scores[key]} max={max} />
              ))}
              <ScoreBar label="리스크" value={item.scores.risk_penalty} max={15} penalty />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
