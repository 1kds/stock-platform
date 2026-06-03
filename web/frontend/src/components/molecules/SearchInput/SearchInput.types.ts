import type { InputHTMLAttributes } from "react";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  /**
   * 입력 필드의 접근 가능한 이름(스크린리더). 시각적 라벨이 없는 검색창이므로
   * 명시하지 않으면 `placeholder` → 최종 기본값 "검색" 순으로 폴백한다.
   * (`InputHTMLAttributes`에 이미 존재하지만 폴백 동작을 문서화하기 위해 명시.)
   */
  "aria-label"?: string;
}
