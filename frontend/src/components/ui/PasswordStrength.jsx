import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-gray-200');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setLabel('');
      setColor('bg-gray-200');
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    setStrength(score);

    if (score <= 2) {
      setLabel('Weak');
      setColor('bg-red-500');
    } else if (score <= 4) {
      setLabel('Fair');
      setColor('bg-yellow-500');
    } else if (score <= 5) {
      setLabel('Good');
      setColor('bg-blue-500');
    } else {
      setLabel('Strong');
      setColor('bg-green-500');
    }
  }, [password]);

  if (!password) return null;

  const percentage = (strength / 6) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength</span>
        <span className={cn(
          'text-xs font-medium',
          strength <= 2 && 'text-red-600',
          strength > 2 && strength <= 4 && 'text-yellow-600',
          strength > 4 && strength <= 5 && 'text-blue-600',
          strength > 5 && 'text-green-600'
        )}>
          {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

