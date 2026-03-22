import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "@base-ui/react";
import { cva, type VariantProps } from "cva";

const button = cva({
  base: [
    "flex items-center justify-center gap-2 flex-1 rounded-md transition-all active:scale-105",
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
      md: "py-3 px-4 font-medium",
    },
  },
  defaultVariants: {
    variant: "ivory",
    size: "md",
  },
});

export function Button({
  variant,
  size,
  className,
  ...props
}: BaseButtonProps & VariantProps<typeof button>) {
  return <BaseButton className={button({ variant, size, className })} {...props} />;
}
