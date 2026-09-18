import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placesApi } from '../services/api';
import PlaceCard from '../components/trip/PlaceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  Compass, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';

export const RecommendedPlaces = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [placesRes, citiesRes, categoriesRes] = await Promise.all([
          placesApi.getPlaces(),
          placesApi.getCities(),
          placesApi.getCategories(),
        ]);
        setPlaces(placesRes.data);
        setCities(citiesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to load places data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      !searchQuery ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = !selectedCity || place.city === selectedCity;
    const matchesCategory = !selectedCategory || place.category === selectedCategory;

    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Curated Attraction Database</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Explore Destinations & Attractions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse top sights, historical monuments, beaches, and dining spots across India.
            </p>
          </div>

          <button
            onClick={() => navigate('/create-trip')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Itinerary With These Places</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spots (e.g. Fort, Beach, Palace)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900"
              />
            </div>

            {/* City Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900"
              >
                <option value="">All Cities ({cities.length})</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 shrink-0 font-medium">Quick filter:</span>
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                selectedCategory === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Places Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching places and coordinates..." />
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching attractions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your city filter or search terms to explore other available locations.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
                setSelectedCategory('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 rounded-xl"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredPlaces.length} attractions
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  showSelectBtn={true}
                  onSelect={() => navigate(`/create-trip?city=${place.city}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedPlaces;
