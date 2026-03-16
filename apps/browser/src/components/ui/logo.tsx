import { cva } from 'class-variance-authority';
import type { ComponentProps, FC } from 'react';
import LogoSVG from '../../assets/images/logo.svg?react';
import { cn } from '../../lib/utils';

export type LogoProps = ComponentProps<'svg'> & {
  alternative?: boolean;
  size?: number | string;
  bg?: boolean;
};

const logoVariants = cva('transition-fill duration-300 group', {
  variants: {
    alternative: {
      false: 'fill-[#FFEF00]',
      true: 'fill-black',
    },
  },
  defaultVariants: {
    alternative: false,
  },
});

export const Logo: FC<LogoProps> = ({
  alternative,
  className,
  size,
  bg,
  ...props
}) => {
  const svgClasses = logoVariants({ alternative });

  return (
    <LogoSVG
      {...props}
      className={cn(svgClasses, className)}
      {...(size ? { width: size, height: size } : {})}
    />
  );
};
