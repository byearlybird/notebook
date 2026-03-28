import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "@base-ui/react";
import { cva, type VariantProps } from "cva";

const button = cva({
  base: [
    "flex items-center justify-center gap-2 flex-1 transition-all active:scale-105",
    "[&>svg]:size-4",
    "disabled:opacity-50",
  ],
  variants: {
    variant: {
      gold: "bg-gold-dark text-black",
      slate: "bg-slate-light text-ivory-light",
      ivory: "bg-ivory-light text-slate-dark",
    },
    size: {
      sm: "py-1.5 px-3 text-sm font-medium",
      md: "py-3 px-4 font-medium",
    },
    rounded: {
      md: "rounded-md",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "ivory",
    size: "md",
    rounded: "md",
  },
});

export function Button({
  variant,
  size,
  rounded,
  className,
  ...props
}: BaseButtonProps & VariantProps<typeof button>) {
  return <BaseButton className={button({ variant, size, rounded, className })} {...props} />;
}
