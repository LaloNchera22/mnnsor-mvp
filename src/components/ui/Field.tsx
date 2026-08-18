import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/ui/icons";

const control =
  "w-full rounded-md border border-line-strong bg-surface-2 text-ink placeholder:text-muted transition-colors focus:border-ink focus:bg-surface focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50";

export function Label({
  children,
  htmlFor,
  hint,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-sm font-medium text-ink">
        {children}
        {required && <span className="text-ink-3"> *</span>}
      </span>
      {hint && <span className="label-tec normal-case tracking-normal">{hint}</span>}
    </label>
  );
}

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: (props: { id: string; describedBy?: string }) => ReactNode;
}

export function Field({
  label,
  hint,
  error,
  description,
  required,
  children,
}: FieldProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      {label && (
        <Label htmlFor={id} hint={hint} required={required}>
          {label}
        </Label>
      )}
      {description && (
        <p id={descId} className="mb-1.5 text-[0.8125rem] text-ink-3">
          {description}
        </p>
      )}
      {children({ id, describedBy })}
      {error && (
        <p id={errId} className="mt-1.5 text-[0.8125rem] text-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(control, "h-10 px-3 text-sm", invalid && "border-ink", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(control, "min-h-[120px] resize-y px-3 py-2.5 text-sm leading-relaxed", invalid && "border-ink", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(control, "h-10 appearance-none px-3 pr-9 text-sm", className)}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        width={16}
        height={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
      />
    </div>
  );
}
