declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: ReactNode;
  }

  export interface PieChartProps {
    width?: number;
    height?: number;
    children?: ReactNode;
  }

  export interface PieProps {
    data: any[];
    dataKey: string;
    nameKey: string;
    cx?: string | number;
    cy?: string | number;
    outerRadius?: number;
    label?: boolean | ((props: any) => ReactNode);
    children?: ReactNode;
  }

  export interface CellProps {
    fill?: string;
    stroke?: string;
    children?: ReactNode;
  }

  export interface BarChartProps {
    data: any[];
    children?: ReactNode;
  }

  export interface BarProps {
    dataKey: string;
    name?: string;
    fill?: string;
    children?: ReactNode;
  }

  export interface XAxisProps {
    dataKey?: string;
    children?: ReactNode;
  }

  export interface YAxisProps {
    children?: ReactNode;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    children?: ReactNode;
  }

  export interface TooltipProps {
    children?: ReactNode;
  }

  export interface LegendProps {
    children?: ReactNode;
  }

  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const PieChart: ComponentType<PieChartProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
  export const BarChart: ComponentType<BarChartProps>;
  export const Bar: ComponentType<BarProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
} 