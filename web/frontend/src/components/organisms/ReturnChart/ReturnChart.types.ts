export interface ReturnPointData {
  date: string;
  return: number;
}
export interface ReturnChartProps {
  data: ReturnPointData[];
  title?: string;
  subtitle?: string;
  className?: string;
}
