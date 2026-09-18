import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Luggage, 
  Navigation2,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Home = () => {
  const navigate = useNavigate();

  const featuredDestinations = [
    {
      city: 'Hyderabad',
      state: 'Telangana',
      tagline: 'City of Pearls, Charminar & Royal Biryani',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&auto=format&fit=crop&q=60',
      placesCount: '12+ Spots',
      avgBudget: '₹4,500 for 2 Days',
    },
    {
      city: 'Goa',
      state: 'Goa',
      tagline: 'Sun-drenched beaches, forts & coastal dining',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=60',
      placesCount: '15+ Spots',
      avgBudget: '₹7,500 for 3 Days',
    },
    {
      city: 'Jaipur',
      state: 'Rajasthan',
      tagline: 'Pink City palaces, amber forts & vibrant bazaars',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=60',
      placesCount: '10+ Spots',
      avgBudget: '₹5,000 for 2 Days',
    },
    {
      city: 'Bengaluru',
      state: 'Karnataka',
      tagline: 'Garden City parks, craft breweries & palaces',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=60',
      placesCount: '8+ Spots',
      avgBudget: '₹4,000 for 2 Days',
    },
    {
      city: 'Munnar',
      state: 'Kerala',
      tagline: 'Misty tea plantations, waterfalls & hills',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=60',
      placesCount: '8+ Spots',
      avgBudget: '₹6,000 for 3 Days',
    },
    {
      city: 'Agra',
      state: 'Uttar Pradesh',
      tagline: 'Taj Mahal wonder, Mughal architecture & crafts',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60',
      placesCount: '6+ Spots',
      avgBudget: '₹3,500 for 2 Days',
    },
  ];

  const highlights = [
    {
      icon: Navigation2,
      title: 'No Zigzagging Routes',
      desc: 'Our intelligent clustering algorithm groups adjacent sights per day, cutting transit time so you spend hours exploring instead of sitting in traffic.',
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      icon: DollarSign,
      title: 'Realistic Budget Forecast',
      desc: 'Break down every single rupee across transport, entry tickets, dining, and stay with active alerts if your wishlist exceeds your planned budget.',
      color: 'text-ocean-600 bg-ocean-50 border-ocean-200',
    },
    {
      icon: Luggage,
      title: 'Smart Packing Checklist',
      desc: 'Automatically pre-populates essentials and category-triggered items (beachwear for Goa, trekking gear for hills) so you never leave crucial items behind.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: Clock,
      title: 'Tailored Pacing',
      desc: 'Choose between Relaxed (leisurely starts, longer stops), Balanced (classic sightseeing), or Packed (maximize every hour) travel styles.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-brand-50/20 to-slate-50">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-brand-200/40 via-ocean-200/40 to-sunset-100/40 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
              <span>Smart Travel Planning for Short 2-4 Day Vacations</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Turn Your Weekend Into an{' '}
              <span className="bg-gradient-to-r from-brand-600 via-ocean-600 to-brand-500 bg-clip-text text-transparent">
                Unforgettable Journey
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              TravelWise crafts optimized, day-wise itineraries matching your exact budget, interests, and preferred pacing. No wasted transit, no budget surprises.
            </p>

            {/* Hero CTA buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/create-trip"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <Compass className="w-5 h-5" />
                <span>Start Planning Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/places"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300/80 shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
              >
                <MapPin className="w-5 h-5 text-slate-500" />
                <span>Explore Top Places</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
              <div>
                <p className="text-2xl font-black text-slate-900 font-heading">50+</p>
                <p className="text-xs text-slate-500 font-medium">Curated Attractions</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-heading">100%</p>
                <p className="text-xs text-slate-500 font-medium">Optimized Transit</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-heading">₹0</p>
                <p className="text-xs text-slate-500 font-medium">Hidden Booking Fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
            Engineered for Short Getaways
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Why Generic Travel Guides Fall Short
          </p>
          <p className="text-slate-600 text-sm mt-3">
            Short trips fail when you spend 4 hours in transit between opposite ends of a city. TravelWise solves this with algorithmic scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Weekend Destinations */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Top Hubs in India
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
                Popular Weekend Getaways
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Curated destination databases ready for instant itinerary building.
              </p>
            </div>
            <Link
              to="/places"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>View all attractions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((dest, i) => (
              <div
                key={i}
                onClick={() => navigate(`/create-trip?city=${dest.city}`)}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 cursor-pointer bg-slate-900"
              >
                <div className="h-64 w-full overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/90 text-white backdrop-blur-md">
                      {dest.placesCount}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{dest.avgBudget}</span>
                  </div>
                  <h3 className="text-2xl font-black font-heading text-white tracking-wide">
                    {dest.city}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-light">
                    {dest.tagline}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-brand-300 group-hover:text-brand-200">
                    <span>Plan a trip here</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Effortless Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-1">
            How TravelWise Plans Your Trip in 30 Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-md mb-6">
              01
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Input Budget & Duration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tell us your starting city, vacation length (e.g., 2 or 3 days), your total budget in ₹ INR, and who is traveling with you.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="w-10 h-10 rounded-full bg-ocean-500 text-white font-bold flex items-center justify-center text-sm shadow-md mb-6">
              02
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Select Your Interests & Style
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick your passions: Heritage, Nature, Beaches, Food, or Adventure, and set your style from Relaxed to Fast-paced.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="w-10 h-10 rounded-full bg-sunset-500 text-white font-bold flex items-center justify-center text-sm shadow-md mb-6">
              03
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Receive Complete Plan & Checklist
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly view your day-by-day timetable, itemized expense forecast, and customized packing checklist ready to check off.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl space-y-4 text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
              Ready to take the stress out of vacation planning?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light">
              Join travelers who build realistic, unforgettable itineraries in seconds.
            </p>
          </div>
          <div className="mt-8 md:mt-0 z-10">
            <Link
              to="/create-trip"
              className="px-8 py-4 rounded-xl text-base font-bold text-slate-900 bg-white hover:bg-brand-50 hover:text-brand-700 shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center space-x-2"
            >
              <span>Create My Trip Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
