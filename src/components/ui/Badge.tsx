interface BadgeProps {
  variant: "green" | "amber" | "red" | "blue" | "neutral";
  children: React.ReactNode;
}

const STYLES: Record<BadgeProps["variant"], string> = {
  green: "bg-[var(--green-bg)] text-[var(--green)]",
  amber: "bg-[var(--amber-bg)] text-[var(--amber)]",
  red: "bg-[var(--red-bg)] text-[var(--red)]",
  blue: "bg-[var(--blue-bg)] text-[var(--blue)]",
  neutral: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[variant]}`}
    >
      {children}
    </span>
  );
}
