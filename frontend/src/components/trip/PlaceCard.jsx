import React from 'react';
import { MapPin, Clock, Star, Sparkles, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDuration, getCategoryBadgeStyle } from '../../utils/formatters';

export const PlaceCard = ({ place, onSelect, isSelected = false, showSelectBtn = false }) => {
  return (
    <div
      className={`group rounded-2xl bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner with Image or Aesthetic Gradient */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-600 via-brand-500 to-ocean-600 flex items-center justify-center text-white p-4">
            <span className="text-lg font-bold font-heading text-center">{place.name}</span>
          </div>
        )}

        {/* Category Badge & Rating */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border backdrop-blur-md ${getCategoryBadgeStyle(
              place.category
            )}`}
          >
            {place.category}
          </span>
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{place.rating ? Number(place.rating).toFixed(1) : '4.5'}</span>
          </div>
        </div>

        {/* City tag bottom left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium">
            <MapPin className="w-3 h-3 text-brand-400" />
            <span>{place.city}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {place.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {place.description || 'Fascinating destination rich in history and local culture.'}
          </p>
        </div>

        {/* Info badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1" title="Estimated visit duration">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(place.estimated_duration)}</span>
          </div>

          <div className="flex items-center space-x-1 font-semibold text-slate-800" title="Entry fee per person">
            <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
            <span>{place.entry_fee === 0 ? 'Free Entry' : formatCurrency(place.entry_fee)}</span>
          </div>
        </div>

        {/* Optional Action Button */}
        {showSelectBtn && (
          <button
            onClick={() => onSelect && onSelect(place)}
            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-brand-50 text-brand-700 border border-brand-300'
                : 'bg-slate-900 hover:bg-brand-600 text-white shadow-sm'
            }`}
          >
            {isSelected ? '✓ Selected for Trip' : '+ Add to Itinerary'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
