import type { FC } from 'react';
import { useSnapshot } from 'valtio';
import { loadingOverlayState } from '@/store/loading-overlay';

export const withMountWithoutLoading = <T extends Record<string, any>>(
  WrappedComponent: FC<T>,
) => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const Component: FC<T> = (props) => {
    const { visible } = useSnapshot(loadingOverlayState);

    if (visible) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  Component.displayName = `withMountWithoutLoading(${displayName})`;

  return Component;
};
