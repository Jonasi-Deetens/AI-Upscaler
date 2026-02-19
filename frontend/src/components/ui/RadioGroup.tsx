"use client";

import type { InputHTMLAttributes } from "react";

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function RadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  label,
  className = "",
  ...rest
}: RadioGroupProps<T>) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-semibold text-foreground mb-3">
          {label}
        </legend>
      )}
      <div className="flex flex-wrap gap-5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value as T)}
              className="w-4 h-4 rounded-full border-2 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              {...rest}
            />
            <span className="text-sm text-foreground group-hover:text-foreground">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
