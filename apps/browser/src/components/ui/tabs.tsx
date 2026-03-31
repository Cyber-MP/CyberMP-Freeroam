import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-3 data-horizontal:flex-col',
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  // Scaled: h-8 -> h-12, p-1 -> p-1.5
  'group/tabs-list inline-flex w-fit items-center justify-center p-1.5 text-muted-foreground group-data-horizontal/tabs:h-12 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-2 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Scaled: text-xs -> text-base, gap-1.5 -> gap-2, px-1.5 -> px-4
        'relative inline-flex h-full flex-1 items-center justify-center gap-2 border border-transparent px-4 py-2 text-base font-medium切换 transition-all',
        'group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-3',
        'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Icon scaling: size-4 -> size-5
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        // Active States
        'data-active:bg-primary data-active:text-foreground data-active:shadow-sm',
        'dark:data-active:border-input dark:data-active:bg-input/30',
        // Line Variant Scaling: bottom-[-5px] -> bottom-[-1.5] (Tailwind units)
        'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity',
        'group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1.5 group-data-horizontal/tabs:after:h-1',
        'group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-2 group-data-vertical/tabs:after:w-1',
        'group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      // Scaled: text-xs -> text-sm or base
      className={cn('flex-1 text-sm/relaxed outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
