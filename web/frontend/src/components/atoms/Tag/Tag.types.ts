import type { ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  tone?: "green" | "neutral";
  className?: string;
}
