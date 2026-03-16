import { RiLoader2Fill } from '@remixicon/react';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<typeof RiLoader2Fill>) {
  return (
    <RiLoader2Fill
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
