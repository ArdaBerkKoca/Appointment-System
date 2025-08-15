import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Yükleniyor...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Ana spinner */}
        <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* İkincil spinner (farklı hızda) */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-purple-600 rounded-full animate-spin`}
          style={{ animationDelay: '-0.5s' }}
        ></div>
        
        {/* Üçüncül spinner (en yavaş) */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-indigo-600 rounded-full animate-spin`}
          style={{ animationDelay: '-1s' }}
        ></div>
      </div>
      
      {text && (
        <p className={`mt-4 text-gray-600 font-medium ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Pulse loading variant
export function LoadingPulse({ 
  size = 'md', 
  text = 'Yükleniyor...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse`}></div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

// Dots loading variant
export function LoadingDots({ 
  text = 'Yükleniyor', 
  className = '' 
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
