import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Crown, Shield, User, CheckCircle2 } from 'lucide-react';

const roles = [
  {
    value: 'owner',
    label: 'Owner',
    icon: Crown,
    description: 'Full control over projects and teams',
    color: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
    activeColor: 'border-yellow-500 bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Manage tasks and team members',
    color: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
    activeColor: 'border-blue-500 bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    value: 'member',
    label: 'Member',
    icon: User,
    description: 'Create and update assigned tasks',
    color: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    activeColor: 'border-gray-500 bg-gray-100',
    iconColor: 'text-gray-600',
  },
];

export const RoleSelector = ({ value, onChange, error }) => {
  const [selectedRole, setSelectedRole] = useState(value || 'member');

  useEffect(() => {
    if (value) {
      setSelectedRole(value);
    }
  }, [value]);

  const handleSelect = (roleValue) => {
    setSelectedRole(roleValue);
    if (onChange) {
      onChange(roleValue);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select Your Role <span className="text-gray-400 text-xs">(Optional - defaults to Member)</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;
          
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => handleSelect(role.value)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-200',
                'text-left cursor-pointer transform hover:scale-105',
                isSelected ? role.activeColor : role.color,
                error && !isSelected && 'border-red-300'
              )}
            >
              <div className="flex items-start space-x-3">
                <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', role.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">
                    {role.label}
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {role.description}
                  </div>
                </div>
                {isSelected && (
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', role.activeColor)}>
                    <CheckCircle2 className={cn('w-4 h-4', role.iconColor)} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

