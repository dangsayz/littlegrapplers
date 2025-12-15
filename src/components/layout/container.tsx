import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: 'default' | 'sm' | 'lg' | 'full';
}

export function Container({
  children,
  className,
  as: Component = 'div',
  size = 'default',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        {
          'max-w-7xl': size === 'default',
          'max-w-4xl': size === 'sm',
          'max-w-screen-2xl': size === 'lg',
          'max-w-none': size === 'full',
        },
        className
      )}
    >
      {children}
    </Component>
  );
}
