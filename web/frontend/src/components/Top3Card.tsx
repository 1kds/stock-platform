"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Top3Item } from "@/lib/api";

// 항목별 최대 점수 (common.md 5장) — 바 차트 비율 계산용
const MAX = {
  undervaluation: 25,
  investor_flow: 20,
  volume_spike: 15,
  news_keyword: 10,
  momentum: 20,
  earnings: 10,
} as const;

const LABEL: Record<keyof typeof MAX, string> = {
  undervaluation: "저평가",
  investor_flow: "수급",
  volume_spike: "거래량",
  news_keyword: "뉴스",
  momentum: "모멘텀",
  earnings: "실적",
};

export function Top3Card({ item }: { item: Top3Item }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{item.rank}위</Badge>
            <span className="text-2xl font-bold">{item.final_score}</span>
          </div>
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <span className="text-sm text-muted-foreground">{item.symbol}</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{item.reason}</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {item.name} ({item.symbol}) — {item.final_score}점
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {(Object.keys(MAX) as (keyof typeof MAX)[]).map((key) => {
              const score = item.scores[key];
              const pct = Math.round((score / MAX[key]) * 100);
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{LABEL[key]}</span>
                    <span className="text-muted-foreground">
                      {score} / {MAX[key]}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-1 text-sm text-muted-foreground">
              리스크 감점: −{item.scores.risk_penalty}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
