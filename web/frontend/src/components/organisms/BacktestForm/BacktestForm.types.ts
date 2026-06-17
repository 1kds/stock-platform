import type { BacktestCondition } from "@/lib/backtest";

/** 백테스팅 폼 상태(제어 컴포넌트). */
export interface BacktestFormState {
  /**
   * 분석 기간 시작/종료 (YYYY-MM-DD).
   * 현재 BacktestForm에서 표시 전용(읽기 전용)이며, 기간 편집 UI는 향후 확장 항목.
   */
  start: string;
  end: string;
  /** 매수 조건식 목록(모두 만족 시 매수 = AND). */
  conditions: BacktestCondition[];
  /** 대상 종목(종목명 또는 코드). 비우면 유니버스 전체가 대상. */
  symbols: string[];
  /** 보유 기간 (예: "T+3"). */
  hold: string;
  /** 종목 유니버스 ("all" | "KOSPI" | "KOSDAQ"). */
  universe: string;
  /** 매도 조건 — 손절 하락률(%, 양수 입력=−값 의미). 빈 문자열=미사용. */
  stopLoss: string;
  /** 매도 조건 — 익절 상승률(%). 빈 문자열=미사용. */
  takeProfit: string;
  /** 초기 자본금(원). */
  capital: string;
  /** 종목당 비중(%). */
  positionPct: string;
  /** 거래 수수료율(%). */
  fee: string;
  /** 거래 세금율(%). */
  tax: string;
}

export interface BacktestFormProps {
  /** 현재 폼 상태(controlled). */
  value: BacktestFormState;
  /** 상태 변경 콜백. */
  onChange: (value: BacktestFormState) => void;
  /** "백테스팅 실행" 클릭 시 호출 — 현재 상태 전달. */
  onRun: (value: BacktestFormState) => void;
  className?: string;
}
