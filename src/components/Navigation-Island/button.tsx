/**
 * @file 10_Frontend/components/ui/atoms/button.tsx
 * 
 * @summary Core frontend button module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 * 
 * @description
 * This file is responsible for:
 *  - Implementing button functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 * 
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for button
 * 3. Export the resulting APIs, hooks, or components for reuse
 * 
 * @changelog
 * V1.0.0 - 2025-01-19 - Initial creation
 */

/**
 * File Overview
 * 
 * START CODING
 * 
 * --------------------------
 * SECTION 1: button Core Logic
 * Section overview and description.
 * --------------------------
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

import { composeInteractiveClasses, INTERACTIVE_VARIANTS, RADIUS } from "../../config/foundations"

const buttonVariants = cva(composeInteractiveClasses(), {
  variants: {
    variant: {
      default: `${INTERACTIVE_VARIANTS.primary} shadow-sm`,
      destructive:
        "bg-[var(--orb-status-error)] text-[var(--orb-on-primary)] hover:opacity-90 active:opacity-80 shadow-sm",
      outline: `${INTERACTIVE_VARIANTS.outline} shadow-sm`,
      secondary:
        "bg-[var(--orb-surface-2)] text-[var(--orb-fg)] hover:bg-[var(--orb-hover)] active:bg-[var(--orb-selected)] shadow-sm",
      ghost: INTERACTIVE_VARIANTS.ghost,
      link: "text-[var(--orb-status-primary)] underline-offset-4 hover:underline hover:text-[var(--orb-status-primary)] active:text-[var(--orb-p700)]",
      // 聊天场景专用按钮样式
      "chat-tool": "bg-[var(--orbai-surface-2)] border border-[var(--orbai-border-soft)] text-[var(--orbai-text-2)] hover:bg-[var(--orbai-surface-3)] hover:border-[var(--orbai-border-strong)] hover:text-[var(--orbai-text-1)] active:scale-95 transition-all duration-200",
      "chat-send": "bg-[var(--orb-primary)] hover:bg-[var(--orb-p600)] text-[var(--orb-on-primary)] border border-[var(--orbai-border-strong)] shadow-[var(--orbai-shadow-soft-sm)] hover:shadow-[var(--orbai-shadow-soft-md)] active:scale-95 transition-all duration-200",
      "chat-stop": "bg-[var(--orb-status-error)] hover:opacity-90 border border-[var(--orbai-border-strong)] shadow-[var(--orbai-shadow-soft-sm)] hover:shadow-[var(--orbai-shadow-soft-md)] active:scale-95 text-[var(--orb-on-primary)] transition-all duration-200",
      "chat-disabled": "cursor-not-allowed opacity-50 bg-[var(--orbai-surface-2)] border border-[var(--orbai-border-soft)] text-[var(--orbai-muted)]"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
      // 聊天场景专用尺寸
      "chat-sm": "h-8 w-8 rounded-full",
      "chat-md": "h-10 w-10 rounded-full",
      "chat-lg": "h-12 w-12 rounded-full",
    },
    rounded: {
      none: RADIUS.none,         // 0% - 无圆角
      sm: RADIUS.sm,             // 33% - 小圆角  
      md: RADIUS.md,             // 66% - 中等圆角 (默认)
      full: RADIUS.full,         // 100% - 全圆角
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "md",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
