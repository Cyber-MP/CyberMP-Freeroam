import type { PropsWithChildren } from 'react';
import { useGlitch } from 'react-powerglitch';

type Props = PropsWithChildren & Parameters<typeof useGlitch>[0];

export const GlitchText = ({ children, ...options }: Props) => {
  const glitch = useGlitch(options);

  return <span ref={glitch.ref}>{children}</span>;
};
