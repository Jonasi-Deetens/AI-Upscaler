"use client";

import {
  forwardRef,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";
const DISABLED = "disabled:opacity-50 disabled:cursor-not-allowed";
const ACTIVE_SCALE = "active:scale-[0.98] transition-transform";

export type ButtonVariant = "cta" | "primary" | "secondary" | "round" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as the single child (e.g. Link, a) and apply button styles */
  asChild?: boolean;
  /** Ghost variant only: use rose/destructive styling */
  destructive?: boolean;
  children?: ReactNode;
  className?: string;
}

/* Same padding and shape for all non-round variants so they look alike; only colors differ */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

const roundSizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const BASE_BUTTON =
  "inline-flex items-center justify-center rounded-full font-medium min-w-[2.5rem] cursor-pointer";

const variantBaseClasses: Record<ButtonVariant, string> = {
  cta: cn(
    BASE_BUTTON,
    "gradient-ai text-white hover:opacity-90",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  primary: cn(
    BASE_BUTTON,
    "bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 border-2 border-transparent transition-[border-color] duration-200 hover:border-violet-400 dark:hover:border-violet-300",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  secondary: cn(
    BASE_BUTTON,
    "btn-ai-secondary btn-hover-border-secondary",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  round: cn(
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 dark:border-zinc-600 bg-white/80 dark:bg-zinc-800/80 text-neutral-500 dark:text-zinc-400 hover:border-neutral-300 dark:hover:border-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300 transition-colors cursor-pointer",
    FOCUS_RING,
    DISABLED
  ),
  ghost: cn(
    BASE_BUTTON,
    "text-neutral-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-700 border-2 border-transparent transition-[border-color] duration-200 hover:border-neutral-300 dark:hover:border-zinc-500",
    FOCUS_RING,
    DISABLED
  ),
  destructive: cn(
    BASE_BUTTON,
    "border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-[border-color] duration-200 hover:border-rose-400 dark:hover:border-rose-700",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
};

const ghostDestructiveClasses =
  "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-700 hover:text-rose-700 dark:hover:text-rose-300";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild = false,
      destructive = false,
      className,
      children,
      type = "button",
      disabled,
      ...rest
    },
    ref
  ) => {
    const isSecondary = variant === "secondary";
    const isRound = variant === "round";
    const sizeClass = isRound ? roundSizeClasses[size] : sizeClasses[size];
    /* Secondary applies size to the inner span so padding matches other variants */
    const sizeClassForOuter = isSecondary ? "" : sizeClass;
    const variantClass = variantBaseClasses[variant];
    const ghostExtra = variant === "ghost" && destructive ? ghostDestructiveClasses : "";
    const mergedClassName = cn(
      variantClass,
      sizeClassForOuter,
      ghostExtra,
      className
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; ref?: unknown; children?: ReactNode }>;
      const inner = isSecondary ? (
        <span className={cn("btn-ai-secondary-inner", sizeClass)}>
          <span>{child.props.children}</span>
        </span>
      ) : (
        child.props.children
      );
      const childRef = "ref" in child ? (child as { ref?: React.Ref<unknown> }).ref : undefined;
      const mergedRef = (el: HTMLButtonElement | HTMLAnchorElement | null) => {
        if (typeof ref === "function") ref(el as HTMLButtonElement);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el as HTMLButtonElement;
        if (childRef) {
          if (typeof childRef === "function") childRef(el);
          else (childRef as React.MutableRefObject<unknown>).current = el;
        }
      };
      return cloneElement(child, {
        className: cn(child.props.className, mergedClassName),
        ref: mergedRef,
        ...(isSecondary && { children: inner }),
      });
    }

    if (isSecondary) {
      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={mergedClassName}
          {...rest}
        >
          <span className={cn("btn-ai-secondary-inner", sizeClass)}>
            <span>{children}</span>
          </span>
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={mergedClassName}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
