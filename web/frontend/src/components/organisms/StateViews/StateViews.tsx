import { cn } from "@/lib/utils";
import type {
  LoadingStateProps,
  ErrorStateProps,
  EmptyStateProps,
} from "./StateViews.types";

/** 로딩 스켈레톤 */
export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-md border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

/** 백엔드 연결 실패 (기존 page.tsx 메시지 보존) */
export function ErrorState({ message, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/40 bg-card p-6 text-sm",
        className,
      )}
    >
      <p className="font-semibold text-destructive">백엔드 연결 실패</p>
      <p className="mt-1 text-muted-foreground">
        FastAPI 서버를 켜주세요 — web/backend 에서 uvicorn main:app --port 8000
        {message ? ` (${message})` : ""}
      </p>
    </div>
  );
}

/** 빈 상태 (휴장일·데이터 없음) */
export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-card p-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <span className="h-0.5 w-5 rounded bg-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title ?? "표시할 데이터가 없습니다"}</p>
      <p className="text-sm text-muted-foreground">
        {description ?? "휴장일이거나 분석 결과가 아직 없습니다. 직전 영업일 데이터를 확인해 보세요."}
      </p>
    </div>
  );
}
