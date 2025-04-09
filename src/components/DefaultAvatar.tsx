
import React from 'react';

interface DefaultAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  // Generate a consistent color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={`${bgColor} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

export default DefaultAvatar;
