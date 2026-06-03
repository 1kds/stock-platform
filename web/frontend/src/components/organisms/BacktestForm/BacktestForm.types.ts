/** 백테스팅 폼 상태(제어 컴포넌트). */
export interface BacktestFormState {
  /**
   * 분석 기간 시작/종료 (YYYY-MM-DD).
   * 현재 BacktestForm에서 표시 전용(읽기 전용)이며, 폼 내 onChange는
   * indicators/hold만 변경한다. 기간 편집 UI는 향후 확장 항목.
   */
  start: string;
  end: string;
  /** 선택된 지표 라벨 목록(예: "저평가", "수급"). */
  indicators: string[];
  /** 보유 기간 (예: "T+3"). */
  hold: string;
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
