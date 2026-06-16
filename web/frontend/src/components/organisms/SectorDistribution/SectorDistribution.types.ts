import type { SectorCount } from "@/lib/marketSummary";

export interface SectorDistributionProps {
  /** 업종별 종목 수 (lib/marketSummary.sectorDistribution). */
  data: SectorCount[];
  className?: string;
}
