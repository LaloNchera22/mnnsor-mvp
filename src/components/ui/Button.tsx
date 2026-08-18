import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  // Tinta sólida — la única acción "de peso" (monocromo).
  primary:
    "bg-ink text-on-ink hover:bg-ink/90 active:bg-ink border border-ink shadow-sm",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-2 hover:border-ink/40 shadow-xs",
  outline:
    "bg-transparent text-ink border border-line-strong hover:bg-surface-2 hover:border-ink/40",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink border border-transparent",
  danger:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-ink hover:text-on-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8125rem] gap-1.5 rounded",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[0.95rem] gap-2 rounded-md",
  icon: "h-10 w-10 rounded-md",
};

const shared =
  "inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "children">;

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent opacity-70"
    />
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(shared, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
  "aria-label"?: string;
};

export function ButtonLink({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  href,
  external,
  ...props
}: ButtonLinkProps) {
  const cls = cn(shared, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} {...props}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
