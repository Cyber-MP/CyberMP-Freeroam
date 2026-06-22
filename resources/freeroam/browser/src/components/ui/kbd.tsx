import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-8 w-fit min-w-8 items-center justify-center gap-1.5 border-[0.1vh] border-input bg-muted px-1.5 font-sans text-xl font-semibold text-muted-foreground select-none',
        'in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10',
        "[&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
