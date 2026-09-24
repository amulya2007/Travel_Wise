import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsApi, placesApi } from '../services/api';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Heart, 
  AlertCircle,
  Coffee,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const POPULAR_CITIES = ['Hyderabad', 'Goa', 'Jaipur', 'Bengaluru', 'Munnar', 'Agra'];

const INTEREST_OPTIONS = [
  { id: 'Nature', label: 'Nature & Parks', icon: '🌿' },
  { id: 'Food', label: 'Food & Culinary', icon: '🍲' },
  { id: 'Sightseeing', label: 'Top Sights & Views', icon: '📸' },
  { id: 'Heritage', label: 'Heritage & History', icon: '🏛️' },
  { id: 'Beach', label: 'Beaches & Coast', icon: '🏖️' },
  { id: 'Adventure', label: 'Adventure & Treks', icon: '🧗' },
  { id: 'Spiritual', label: 'Spiritual & Temples', icon: '🛕' },
  { id: 'Shopping', label: 'Markets & Bazaars', icon: '🛍️' },
  { id: 'Relaxation', label: 'Relaxation & Spa', icon: '🧘' },
];

const TRAVEL_STYLES = [
  {
    id: 'relaxed',
    title: 'Relaxed Pacing',
    desc: '2-3 spots per day. Starts around 10:00 AM. Ideal for peaceful exploration without hurrying.',
    icon: Coffee,
    color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900',
  },
  {
    id: 'balanced',
    title: 'Balanced Flow',
    desc: '3-4 spots per day with relaxed meal breaks. The gold standard for a great weekend getaway.',
    icon: Compass,
    color: 'border-brand-500 bg-brand-50/40 text-brand-900',
  },
  {
    id: 'packed',
    title: 'Packed & Fast-Paced',
    desc: '5-6 spots per day. Starts at 08:30 AM. For energetic explorers wanting to cover everything.',
    icon: Zap,
    color: 'border-amber-500 bg-amber-50/40 text-amber-900',
  },
];

export const CreateTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [startingLocation, setStartingLocation] = useState(user?.home_city || 'Hyderabad');
  const [destination, setDestination] = useState(searchParams.get('city') || 'Hyderabad');
  const [numberOfDays, setNumberOfDays] = useState(2);
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [budget, setBudget] = useState(5000);
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [selectedInterests, setSelectedInterests] = useState(['Nature', 'Food', 'Sightseeing']);
  const [destinationPlaces, setDestinationPlaces] = useState([]);
  const [selectedPlaceNames, setSelectedPlaceNames] = useState([]);

  // Auto-sync user's home city when user loads
  useEffect(() => {
    if (user?.home_city && startingLocation === 'Hyderabad') {
      setStartingLocation(user.home_city);
    }
  }, [user]);

  // Fetch candidate places for the destination city
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!destination) return;
      try {
        const res = await placesApi.getPlaces({ city: destination, limit: 12 });
        setDestinationPlaces(res.data || []);
      } catch (err) {
        console.error('Failed to load destination attractions:', err);
      }
    };
    fetchPlaces();
  }, [destination]);

  // Handle interest toggle
  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interestId));
      }
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  // Handle specific attraction toggle
  const togglePlace = (place) => {
    if (selectedPlaceNames.includes(place.name)) {
      setSelectedPlaceNames(selectedPlaceNames.filter((name) => name !== place.name));
    } else {
      setSelectedPlaceNames([...selectedPlaceNames, place.name]);
      if (place.category && !selectedInterests.includes(place.category)) {
        setSelectedInterests([...selectedInterests, place.category]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/create-trip', search: searchParams.toString() ? `?${searchParams.toString()}` : '' } } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tripData = {
        title: `${numberOfDays}-Day ${destination} Getaway`,
        starting_location: startingLocation,
        destination: destination,
        number_of_days: Number(numberOfDays),
        number_of_travelers: Number(numberOfTravelers),
        budget: Number(budget),
        travel_style: travelStyle,
        interests: selectedInterests.join(','),
        auto_generate: true,
      };

      const res = await tripsApi.createTrip(tripData);
      const createdTrip = res.data;
      navigate(`/itinerary/${createdTrip.id}`);
    } catch (err) {
      console.error('Trip generation failed:', err);
      setError(
        err.response?.data?.detail || 'Failed to generate itinerary. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Wizard Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-medium text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Signed in as <strong className="text-slate-900 font-semibold">{user?.full_name || user?.email}</strong></span>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {step} of 3</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Plan Your Vacation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize duration, destinations, and what you want to experience. Our engine will cluster spots and optimize your schedule.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
          </div>

          {[
            { num: 1, label: 'Destination' },
            { num: 2, label: 'Budget & Style' },
            { num: 3, label: 'Interests' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  step >= s.num
                    ? 'bg-brand-600 text-white shadow-brand-500/25 ring-4 ring-brand-100'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${step >= s.num ? 'text-brand-700 font-semibold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-200/40">
          {/* STEP 1: Destination, Duration, Travelers */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Where are you starting & heading?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We use coordinates to calculate realistic travel times between your locations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Starting City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Starting / Current City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4 text-brand-500" />
                    </div>
                    <input
                      type="text"
                      value={startingLocation}
                      onChange={(e) => setStartingLocation(e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Destination City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Destination City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Compass className="w-4 h-4 text-ocean-500" />
                    </div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Hyderabad, Goa, Jaipur"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Pick Destination Pills */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Or quick pick a popular destination:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setDestination(city)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        destination.toLowerCase() === city.toLowerCase()
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>Vacation Length</span>
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                      {numberOfDays} Day{numberOfDays > 1 ? 's' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>1 Day</span>
                    <span>2 Days</span>
                    <span>3 Days</span>
                    <span>4 Days</span>
                    <span>5 Days</span>
                  </div>
                </div>

                {/* Travelers Count */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-ocean-600" />
                      <span>Number of Travelers</span>
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full bg-ocean-100 text-ocean-800 text-xs font-bold">
                      {numberOfTravelers} Person{numberOfTravelers > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumberOfTravelers(num)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          numberOfTravelers === num
                            ? 'border-ocean-500 bg-ocean-50 text-ocean-700 shadow-sm ring-2 ring-ocean-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num === 4 ? '4+' : num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Budget & Travel Style */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Total Budget & Desired Pacing
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We estimate travel, meals, stay, and attraction entrance tickets against this figure.
                </p>
              </div>

              {/* Budget Input & Quick Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Total Trip Budget (in ₹ INR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-5 h-5 text-brand-600" />
                  </div>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[3000, 5000, 8000, 12000, 20000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudget(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        budget === preset
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style Selector */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Travel Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TRAVEL_STYLES.map((style) => {
                    const Icon = style.icon;
                    const isSelected = travelStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setTravelStyle(style.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? style.color + ' shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Icon className="w-5 h-5" />
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                          </div>
                          <h4 className="text-sm font-bold">{style.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {style.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interests Multi-Select */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  What are your travel interests?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select at least one category to guide our attraction selection algorithm.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {item.label}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                          isSelected ? 'bg-brand-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Specific Attractions Selection ("What you want to visit") */}
              {destinationPlaces.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-brand-600" />
                        <span>Highlights you want in {destination} (Optional)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pick individual sights or must-see places you specifically want included.
                      </p>
                    </div>
                    {selectedPlaceNames.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {selectedPlaceNames.length} selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {destinationPlaces.slice(0, 6).map((place) => {
                      const isPicked = selectedPlaceNames.includes(place.name);
                      return (
                        <div
                          key={place.id}
                          onClick={() => togglePlace(place)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between space-x-2 ${
                            isPicked
                              ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-500/40'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{place.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {place.category} • {place.entry_fee === 0 ? 'Free' : `₹${place.entry_fee}`}
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                              isPicked ? 'bg-brand-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isPicked && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary Card Before Generating */}
              <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <span className="text-xs text-brand-300 font-semibold uppercase tracking-wider">
                      Trip Overview
                    </span>
                  </div>
                  <p className="text-sm font-bold">
                    {numberOfDays} Days in {destination} • {numberOfTravelers} Traveler{numberOfTravelers > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    Budget: {formatCurrency(budget)} • Style: {travelStyle.toUpperCase()}
                  </p>
                </div>
                <div className="text-xs text-slate-400 text-center sm:text-right space-y-0.5">
                  <p className="text-white font-semibold">{selectedInterests.length} Interests Active</p>
                  {selectedPlaceNames.length > 0 && (
                    <p className="text-brand-300">{selectedPlaceNames.length} Specific Spots Chosen</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-md transition-all ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerate}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-ocean-600 hover:from-brand-700 hover:to-ocean-700 text-white text-sm font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60 ml-auto"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{loading ? 'Creating Smart Itinerary...' : 'Generate Smart Itinerary'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
