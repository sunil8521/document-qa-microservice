import * as React from "react"
import { cn } from "../../lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "solid" | "outlined" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    
    const variants = {
      primary: "bg-[#A5D6A7] text-[#1B5E20] hover:bg-[#81C784] shadow-sm font-semibold",
      secondary: "bg-[#F3E5F5] text-[#7B1FA2] hover:bg-[#E1BEE7] shadow-sm font-semibold",
      solid: "bg-[#2E7D32] text-white hover:bg-[#1B5E20] shadow-sm font-semibold",
      outlined: "border border-gray-300 text-gray-700 hover:bg-gray-50",
      ghost: "hover:bg-gray-100 text-gray-700",
    }
    
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
