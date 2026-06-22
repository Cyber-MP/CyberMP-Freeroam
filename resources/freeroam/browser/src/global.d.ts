/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*&imagetools' {
  /**
   * actual types
   * - code https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts
   * - docs https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/getting-started.md#metadata
   */
  const out;
  // eslint-disable-next-line import/no-default-export
  export default out;
}

declare module '*.svg?react' {
  import type * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string }
  >;

  export default ReactComponent;
}
