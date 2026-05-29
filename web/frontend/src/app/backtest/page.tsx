export default function BacktestPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">백테스팅</h1>
      <p className="text-sm text-muted-foreground">
        분석 기간·지표 조건·보유 기간을 설정해 과거 성과를 확인하는 화면입니다.
        (입력 폼 + 수익률 차트 — 구현 예정)
      </p>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        🚧 준비 중 — GET /api/backtest 연동 예정
      </div>
    </div>
  );
}
