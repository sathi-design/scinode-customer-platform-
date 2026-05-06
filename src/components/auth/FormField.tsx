import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id?: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable form field wrapper: label → control → error/hint
 */
export function FormField({ id, label, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-status-error-text flex items-center gap-1">
          <span>↑</span> {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-text-subtle">{hint}</p>
      )}
    </div>
  );
}
