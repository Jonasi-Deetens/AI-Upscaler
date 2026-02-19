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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const DISABLED = "disabled:opacity-50 disabled:cursor-not-allowed";
const ACTIVE_SCALE = "active:scale-[0.98] transition-transform";

export type ButtonVariant = "cta" | "accent" | "primary" | "secondary" | "round" | "roundPlain" | "ghost" | "destructive" | "iconTile";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as the single child (e.g. Link, a) and apply button styles */
  asChild?: boolean;
  /** Ghost variant only: use destructive styling */
  destructive?: boolean;
  children?: ReactNode;
  className?: string;
}

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
    "bg-accent-gradient !text-white hover:opacity-90 [&_*]:!text-white [&_svg]:!text-white [&_svg]:shrink-0",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  accent: cn(
    BASE_BUTTON,
    "bg-accent text-accent-foreground hover:bg-accent-gradient hover:!text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white border-2 border-transparent",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  primary: cn(
    BASE_BUTTON,
    "bg-primary text-primary-foreground hover:bg-accent-gradient hover:!text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white border-2 border-transparent",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  secondary: cn(
    BASE_BUTTON,
    "bg-secondary text-secondary-foreground border border-border hover:bg-accent-gradient hover:!text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white hover:border-transparent",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  round: cn(
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground hover:border-accent-solid hover:bg-accent-gradient hover:text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white transition-colors cursor-pointer",
    FOCUS_RING,
    DISABLED
  ),
  roundPlain: cn(
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground hover:border-input hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
    FOCUS_RING,
    DISABLED
  ),
  ghost: cn(
    BASE_BUTTON,
    "text-foreground hover:bg-accent-gradient hover:!text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white border-2 border-transparent hover:border-transparent transition-colors",
    FOCUS_RING,
    DISABLED
  ),
  destructive: cn(
    BASE_BUTTON,
    "border-2 border-destructive/50 text-destructive bg-transparent hover:bg-destructive/10 hover:border-destructive",
    ACTIVE_SCALE,
    FOCUS_RING,
    DISABLED
  ),
  iconTile: cn(
    "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card border border-border text-primary shadow-sm transition-[transform,color] duration-300 hover:scale-105 hover:bg-accent-gradient hover:!text-white hover:[&_*]:!text-white hover:[&_svg]:!text-white active:scale-[0.98] cursor-pointer",
    FOCUS_RING,
    DISABLED
  ),
};

const ghostDestructiveClasses = "text-destructive hover:bg-destructive/10 hover:text-destructive";

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
    const isRound = variant === "round" || variant === "roundPlain";
    const isIconTile = variant === "iconTile";
    const sizeClass = isRound || isIconTile ? roundSizeClasses[size] : sizeClasses[size];
    const variantClass = variantBaseClasses[variant];
    const ghostExtra = variant === "ghost" && destructive ? ghostDestructiveClasses : "";
    const mergedClassName = cn(variantClass, sizeClass, ghostExtra, className);

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; ref?: unknown; children?: ReactNode }>;
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
      });
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
