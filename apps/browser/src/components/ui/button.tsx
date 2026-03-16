import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-[0.0926vh] border-transparent bg-clip-padding text-[1.1111vh] font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[0.0926vh] focus-visible:ring-ring/50 active:translate-y-[0.0926vh] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[0.0926vh] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.4815vh]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-[0.3704vh] hover:underline',
      },
      size: {
        default:
          'h-[0.7407vh] gap-[0.1389vh] px-[0.2315vh] has-data-[icon=inline-end]:pr-[0.1852vh] has-data-[icon=inline-start]:pl-[0.1852vh]',
        xs: "h-[0.5556vh] gap-[0.0926vh] rounded-none px-[0.1852vh] text-[1.1111vh] has-data-[icon=inline-end]:pr-[0.1389vh] has-data-[icon=inline-start]:pl-[0.1389vh] [&_svg:not([class*='size-'])]:size-[1.1111vh]",
        sm: "h-[0.6481vh] gap-[0.0926vh] rounded-none px-[0.2315vh] has-data-[icon=inline-end]:pr-[0.1389vh] has-data-[icon=inline-start]:pl-[0.1389vh] [&_svg:not([class*='size-'])]:size-[1.2963vh]",
        lg: 'h-[0.8333vh] gap-[0.1389vh] px-[0.2315vh] has-data-[icon=inline-end]:pr-[0.2778vh] has-data-[icon=inline-start]:pl-[0.2778vh]',
        icon: 'size-[0.7407vh]',
        'icon-xs':
          "size-[0.5556vh] rounded-none [&_svg:not([class*='size-'])]:size-[1.1111vh]",
        'icon-sm': 'size-[0.6481vh] rounded-none',
        'icon-lg': 'size-[0.8333vh]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
