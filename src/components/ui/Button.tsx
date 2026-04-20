"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: undefined;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  href: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-forest-700 text-paper hover:bg-forest-800 active:scale-[0.98] shadow-[0_4px_12px_rgba(28,42,33,0.08)]",
  secondary:
    "bg-transparent text-forest-700 border-[1.5px] border-forest-700 hover:bg-forest-700 hover:text-paper active:scale-[0.98]",
  tertiary:
    "bg-transparent text-forest-700 underline-offset-4 hover:underline",
  ghost:
    "bg-sage-100 text-forest-800 hover:bg-sage-200 active:scale-[0.98]",
  destructive:
    "bg-berry-500 text-paper hover:bg-berry-600 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-[12px]",
  md: "h-12 px-6 text-[15px] rounded-[14px]",
  lg: "h-14 px-7 text-base rounded-[16px]",
};

const baseClasses = cn(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out select-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50",
  "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
  "touch-manipulation"
);

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  // Destructure ALL custom/layout props out so they never leak onto the DOM.
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    iconLeft,
    iconRight,
    children,
    className,
    ...rest
  } = props;

  const combinedClass = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  const inner = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  );

  // Link mode: ButtonAsLinkProps -> render Next.js Link
  if ("href" in rest && rest.href !== undefined) {
    const { href, target, rel, onClick } = rest as ButtonAsLinkProps;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={combinedClass}
      >
        {inner}
      </Link>
    );
  }

  // Button mode: drop href (optional/undefined), keep native button attrs
  const { href: _href, ...buttonProps } = rest as ButtonAsButtonProps & {
    href?: undefined;
  };
  void _href;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={combinedClass}
      {...buttonProps}
    >
      {inner}
    </button>
  );
});
Button.displayName = "Button";
