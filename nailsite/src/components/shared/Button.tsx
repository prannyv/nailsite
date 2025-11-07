// Re-export shadcn Button with custom variant mapping
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '../ui/button';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ 
  variant = 'primary',
  className,
  ...props 
}: ButtonProps) => {
  // Map our custom variants to shadcn variants
  const shadcnVariant = 
    variant === 'primary' ? 'default' :
    variant === 'secondary' ? 'secondary' :
    variant === 'danger' ? 'destructive' : 'default';
  
  return (
    <ShadcnButton 
      variant={shadcnVariant}
      className={cn('px-6 py-3', className)}
      {...props} 
    />
  );
};

