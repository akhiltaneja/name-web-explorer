import React, { useMemo } from 'react';

interface DefaultAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'animal' | 'initials';
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ 
  name, 
  size = 'md', 
  className = '',
  type = 'animal'
}) => {
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

  // URLs to animal images (high-quality options)
  const animalImages = [
    // Cats
    'https://img.freepik.com/free-vector/cute-cat-gaming-cartoon_138676-2969.jpg',
    'https://img.freepik.com/free-vector/cute-cat-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4148.jpg',
    'https://img.freepik.com/free-vector/cute-cat-with-coffee-cup-cartoon-vector-icon-illustration-animal-drink-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4615.jpg',
    'https://img.freepik.com/free-vector/cute-cat-holding-fish-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4346.jpg',
    'https://img.freepik.com/free-vector/cute-cool-cat-wearing-sunglasses-cartoon-vector-icon-illustration-animal-fashion-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4234.jpg',
    
    // Dogs
    'https://img.freepik.com/free-vector/cute-dog-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3671.jpg',
    'https://img.freepik.com/free-vector/cute-corgi-dog-holding-bone-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4608.jpg',
    'https://img.freepik.com/free-vector/cute-shiba-inu-dog-waving-paw-cartoon_138676-2489.jpg',
    'https://img.freepik.com/free-vector/cute-pug-dog-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4655.jpg',
    'https://img.freepik.com/free-vector/cute-french-bulldog-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4449.jpg',

    // Other cute animals
    'https://img.freepik.com/free-vector/cute-rabbit-with-duck-float-cartoon-vector-icon-illustration-animal-summer-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4231.jpg',
    'https://img.freepik.com/free-vector/cute-panda-with-bamboo-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3740.jpg',
    'https://img.freepik.com/free-vector/cute-fox-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3323.jpg',
    'https://img.freepik.com/free-vector/cute-bear-holding-honey-pot-cartoon-vector-icon-illustration-animal-food-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3673.jpg',
    'https://img.freepik.com/free-vector/cute-lion-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4286.jpg',
  ];

  // Get a consistent animal image based on the name
  const imageIndex = useMemo(() => {
    return name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % animalImages.length;
  }, [name]);
  
  const animalImageUrl = animalImages[imageIndex];

  // Use the image for type 'animal', otherwise show initials
  if (type === 'animal') {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
        style={{ backgroundImage: `url(${animalImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
    );
  }

  return (
    <div
      className={`${bgColor} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

export default DefaultAvatar;
