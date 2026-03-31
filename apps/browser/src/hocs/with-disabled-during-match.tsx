import type { FC } from 'react';
import { useActiveMatch } from '@/hooks/use-active-match';

export function withDisabledDuringMatch<T extends Record<string, any>>(
  WrappedComponent: FC<T>,
) {
  if (window.MOCKED_MP) {
    return WrappedComponent;
  }

  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const Component: FC<T> = (props) => {
    const activeMatch = useActiveMatch();

    if (activeMatch) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center">
          This functionality is disabled during an active match
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  Component.displayName = `withDisabledDuringMatch(${displayName})`;

  return Component;
}
