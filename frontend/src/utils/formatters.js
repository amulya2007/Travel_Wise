// Format Indian Rupee (₹)
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format duration in hours/minutes
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${mins} min`;
};

// Format distance
export const formatDistance = (km) => {
  if (!km && km !== 0) return '';
  return `${Number(km).toFixed(1)} km`;
};

// Category colors and badge styling
export const getCategoryBadgeStyle = (category) => {
  const map = {
    Heritage: 'bg-amber-100 text-amber-800 border-amber-200',
    Nature: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Beach: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    Food: 'bg-orange-100 text-orange-800 border-orange-200',
    Adventure: 'bg-rose-100 text-rose-800 border-rose-200',
    Sightseeing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Spiritual: 'bg-purple-100 text-purple-800 border-purple-200',
    Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
    Relaxation: 'bg-teal-100 text-teal-800 border-teal-200',
  };
  return map[category] || 'bg-slate-100 text-slate-800 border-slate-200';
};
