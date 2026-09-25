import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Never substitute an unrelated stock image for a named place. */
export default function PlaceImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`bg-gradient-to-br from-slate-900 via-brand-900 to-ocean-800 text-white flex flex-col items-center justify-center p-5 text-center ${className}`}><ImageOff className="w-7 h-7 text-brand-300 mb-2" /><span className="text-sm font-bold leading-tight">{name}</span><span className="text-[11px] text-slate-300 mt-1">Photo unavailable</span></div>;
  return <img src={src} alt={name} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
