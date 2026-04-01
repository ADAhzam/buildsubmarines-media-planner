import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border border-[var(--border)] rounded-xl p-5 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardLabelProps {
  children: ReactNode;
}

export function CardLabel({ children }: CardLabelProps) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">
      {children}
    </p>
  );
}
