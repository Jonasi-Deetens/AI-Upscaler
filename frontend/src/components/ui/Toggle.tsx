"use client";


export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: ToggleProps<T>) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-foreground mb-3">
          {label}
        </legend>
      )}
      <div
        className="inline-flex gap-2 p-1 rounded-xl bg-muted border border-border"
        role="group"
        aria-label={label}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={opt.label}
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
