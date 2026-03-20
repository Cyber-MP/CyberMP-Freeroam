declare module '*.svg?react' {
  import type * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string }
  >;

  export default ReactComponent;
}

// biome-ignore lint/correctness/noUnusedVariables: expanding window interface
interface Window {
  MOCKED_MP: boolean;
}
