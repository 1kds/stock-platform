// 백테스팅 조건식 메타 — 지표 카탈로그·연산자·포맷터.
// BacktestForm(입력)과 결과 요약이 공유하는 단일 기준.
// 지표 key는 common.md §4 데이터 컬럼(ohlcv·investor·financial)에 대응한다.
// (현재 UI/폼 단계: 결과 계산은 mock. 실제 평가는 백엔드 실연동 단계에서.)

export type BacktestOperator = "lte" | "gte" | "lt" | "gt" | "eq";

/** 조건 한 줄: [지표] [연산자] [값]. value는 입력 중 빈 값 허용 → 문자열 보관. */
export interface BacktestCondition {
  indicator: string;
  operator: BacktestOperator;
  value: string;
}

export interface IndicatorMeta {
  /** 데이터 컬럼 key (common.md §4). */
  key: string;
  /** 표시 라벨. */
  label: string;
  /** 단위(있으면 입력 옆·요약에 표시). */
  unit?: string;
  /** 그룹(지표 분류). */
  group: string;
}

/** 조건에 쓸 수 있는 지표 — common.md §4(ohlcv·investor·financial) 컬럼 기준. */
export const BACKTEST_INDICATORS: readonly IndicatorMeta[] = [
  { key: "per", label: "PER", group: "가치" },
  { key: "pbr", label: "PBR", group: "가치" },
  { key: "roe", label: "ROE", unit: "%", group: "가치" },
  { key: "dividend_yield", label: "배당수익률", unit: "%", group: "가치" },
  { key: "debt_ratio", label: "부채비율", unit: "%", group: "가치" },
  { key: "operating_margin", label: "영업이익률", unit: "%", group: "가치" },
  { key: "revenue_growth", label: "매출성장률", unit: "%", group: "실적" },
  { key: "operating_profit_growth", label: "영업이익성장률", unit: "%", group: "실적" },
  { key: "foreign_net_buy_5d", label: "외국인 5일 순매수", unit: "주", group: "수급" },
  { key: "institution_net_buy_5d", label: "기관 5일 순매수", unit: "주", group: "수급" },
  { key: "foreign_holding_ratio", label: "외국인 보유비율", unit: "%", group: "수급" },
  { key: "volume_ratio_20", label: "거래량비율(20일)", unit: "배", group: "거래/가격" },
  { key: "change_rate", label: "등락률", unit: "%", group: "거래/가격" },
  { key: "volatility_20", label: "변동성(20일)", unit: "%", group: "거래/가격" },
  { key: "return_5d", label: "5일 수익률", unit: "%", group: "모멘텀" },
  { key: "return_20d", label: "20일 수익률", unit: "%", group: "모멘텀" },
] as const;

/** 연산자(기호 포함). */
export const BACKTEST_OPERATORS: readonly { key: BacktestOperator; symbol: string }[] = [
  { key: "lte", symbol: "≤" },
  { key: "gte", symbol: "≥" },
  { key: "lt", symbol: "<" },
  { key: "gt", symbol: ">" },
  { key: "eq", symbol: "=" },
] as const;

/** 종목 유니버스 옵션. */
export const BACKTEST_UNIVERSES: readonly { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "KOSPI", label: "KOSPI" },
  { value: "KOSDAQ", label: "KOSDAQ" },
] as const;

/** Dropdown용 지표 옵션(단위 포함 라벨). */
export const INDICATOR_OPTIONS = BACKTEST_INDICATORS.map((i) => ({
  value: i.key,
  label: i.unit ? `${i.label} (${i.unit})` : i.label,
}));

/** Dropdown용 연산자 옵션(기호). */
export const OPERATOR_OPTIONS = BACKTEST_OPERATORS.map((o) => ({ value: o.key, label: o.symbol }));

/** 기본 조건 — 예시(PER ≤ 10, ROE ≥ 15). */
export const DEFAULT_CONDITIONS: BacktestCondition[] = [
  { indicator: "per", operator: "lte", value: "10" },
  { indicator: "roe", operator: "gte", value: "15" },
];

export function indicatorMeta(key: string): IndicatorMeta | undefined {
  return BACKTEST_INDICATORS.find((i) => i.key === key);
}

export function operatorSymbol(op: BacktestOperator): string {
  return BACKTEST_OPERATORS.find((o) => o.key === op)?.symbol ?? op;
}

/** 조건을 "PER ≤ 10" 형태 문자열로. 요약 칩 등에 사용. */
export function formatCondition(c: BacktestCondition): string {
  const m = indicatorMeta(c.indicator);
  const unit = m?.unit ?? "";
  return `${m?.label ?? c.indicator} ${operatorSymbol(c.operator)} ${c.value}${unit}`;
}
