import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export const Avatar = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 text-primary-700',
        'flex items-center justify-center font-semibold',
        'overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <User className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      )}
    </div>
  );
};

