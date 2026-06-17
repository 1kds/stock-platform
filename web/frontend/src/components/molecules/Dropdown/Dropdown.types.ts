export interface DropdownOption {
  /** 선택 시 onChange로 전달되는 값. */
  value: string;
  /** 메뉴/트리거에 표시되는 라벨. 생략 시 value 사용. */
  label?: string;
}

export interface DropdownProps {
  /**
   * 트리거에 보이는 기본 라벨(접두). 예: "정렬". 선택값이 있으면 "정렬: <선택>"으로 표시.
   * options가 없으면 표시 전용(목업) 트리거로 동작.
   */
  label: string;
  /** 선택 가능한 옵션들. 주어지면 controlled 메뉴로 동작. */
  options?: DropdownOption[];
  /** 현재 선택값(controlled). */
  value?: string;
  /** 선택 변경 콜백(controlled). */
  onChange?: (value: string) => void;
  /** true면 트리거에 접두 라벨("정렬:")을 숨기고 선택값만 표시(접근성 라벨은 유지). */
  bare?: boolean;
  className?: string;
}
