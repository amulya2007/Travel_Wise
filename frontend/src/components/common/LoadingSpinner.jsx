import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading your travel plan...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-brand-100 animate-ping opacity-60 absolute"></div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-ocean-500 flex items-center justify-center shadow-lg text-white">
          <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin`} />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
