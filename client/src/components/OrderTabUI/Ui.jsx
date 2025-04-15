"use client"

import React from "react"
import { cn } from "../../lib/utils" // Updated import path

// Card component
export const Card = ({ className, children, ...props }) => {
  return (
    <div className={cn("relative rounded-lg border border-gray-200 shadow-md overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}

// Button component
export const Button = ({ className, variant = "default", size = "default", children, ...props }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "h-10 px-4 py-2": size === "default",
          "h-9 px-3": size === "sm",
          "h-11 px-8": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Typography components
import PropTypes from 'prop-types';

const TypographyProps = {
  variant: PropTypes.oneOf(["h1", "h2", "h3", "h4", "p", "blockquote", "list"]),
}

export const Typography = {
  Title: ({
    className,
    level = 1,
    children,
    ...props
  }) => {
    const Component = `h${level}`;
    const styles = {
      1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      4: "scroll-m-20 text-xl font-semibold tracking-tight",
      5: "scroll-m-20 text-lg font-semibold tracking-tight",
    };
    return (
      <Component className={cn(styles[level], className)} {...props}>
        {children}
      </Component>
    );
  },
  Text: ({ className, children, ...props }) => (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>
      {children}
    </p>
  ),
  Blockquote: ({ className, children, ...props }) => (
    <blockquote className={cn("mt-6 border-l-4 pl-6 italic", className)} {...props}>
      {children}
    </blockquote>
  ),
  List: ({ className, children, ...props }) => (
    <ul className={cn("mt-6 list-disc list-inside", className)} {...props}>
      {children}
    </ul>
  ),
};

// Flex component
export const Flex = ({
  className,
  direction = "row",
  align = "start",
  justify = "start",
  wrap = "nowrap",
  gap = 0,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex",
        {
          "flex-row": direction === "row",
          "flex-column": direction === "column",
          "flex-row-reverse": direction === "row-reverse",
          "flex-column-reverse": direction === "column-reverse",
          "items-start": align === "start",
          "items-center": align === "center",
          "items-end": align === "end",
          "items-stretch": align === "stretch",
          "items-baseline": align === "baseline",
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-evenly": justify === "evenly",
          "flex-nowrap": wrap === "nowrap",
          "flex-wrap": wrap === "wrap",
          "flex-wrap-reverse": wrap === "wrap-reverse",
          "gap-0": gap === 0,
          "gap-1": gap === 1,
          "gap-2": gap === 2,
          "gap-3": gap === 3,
          "gap-4": gap === 4,
          "gap-5": gap === 5,
          "gap-6": gap === 6,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Flex.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.oneOf(["row", "column", "row-reverse", "column-reverse"]),
  align: PropTypes.oneOf(["start", "center", "end", "stretch", "baseline"]),
  justify: PropTypes.oneOf(["start", "center", "end", "between", "around", "evenly"]),
  wrap: PropTypes.oneOf(["nowrap", "wrap", "wrap-reverse"]),
  gap: PropTypes.number,
  children: PropTypes.node,
};

