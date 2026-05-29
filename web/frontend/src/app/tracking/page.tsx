export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">트래킹</h1>
      <p className="text-sm text-muted-foreground">
        날짜별 Top3 추천 이력과 실제 수익률·적중률을 확인하는 화면입니다.
        (이력 테이블 + 적중률 — 구현 예정)
      </p>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        🚧 준비 중 — GET /api/tracking 연동 예정
      </div>
    </div>
  );
}
