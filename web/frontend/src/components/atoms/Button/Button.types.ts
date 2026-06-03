import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 시각적 변형 */
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
}
