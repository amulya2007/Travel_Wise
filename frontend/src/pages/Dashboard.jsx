import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Calendar, 
  MapPin, 
  Compass, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  IndianRupee, 
  Users, 
  Clock, 
  Trash2,
  BookmarkCheck,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsApi.getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripsApi.deleteTrip(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your trip dashboard..." />;
  }

  const latestTrip = trips.length > 0 ? trips[0] : null;
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalDays = trips.reduce((acc, t) => acc + (t.number_of_days || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Traveler Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Traveler'}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your upcoming short vacations, inspect expenses, and customize packing checklists.
            </p>
          </div>

          <Link
            to="/create-trip"
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Vacation</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trips Planned
              </p>
              <p className="text-2xl font-black text-slate-900 font-heading mt-0.5">
                {trips.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Days Traveling
              </p>
              <p className="text-2xl font-black text-slate-900 font-heading mt-0.5">
                {totalDays} Days
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sunset-50 text-sunset-500 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Budget Planned
              </p>
              <p className="text-2xl font-black text-slate-900 font-heading mt-0.5">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Active Trip Spotlight */}
        {latestTrip && (
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider">
                  Featured / Latest Trip
                </span>
                <span className="text-xs text-slate-400">
                  Status: <span className="text-brand-300 font-semibold uppercase">{latestTrip.status}</span>
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  {latestTrip.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    <span>{latestTrip.starting_location} ➔ {latestTrip.destination}</span>
                  </span>
                  <span>•</span>
                  <span>{latestTrip.number_of_days} Days Vacation</span>
                  <span>•</span>
                  <span>{latestTrip.number_of_travelers} Travelers</span>
                  <span>•</span>
                  <span>Budget: {formatCurrency(latestTrip.budget)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={`/itinerary/${latestTrip.id}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/30 flex items-center space-x-1.5 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Open Itinerary & Schedule</span>
                </Link>
                <Link
                  to={`/itinerary/${latestTrip.id}`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  View Budget & Packing List
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trips List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              All Planned Trips ({trips.length})
            </h3>
            <Link to="/saved-trips" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View Detailed List
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No trips planned yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first customized vacation itinerary with our intelligent clustering engine.
              </p>
              <Link
                to="/create-trip"
                className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Trip</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/itinerary/${t.id}`)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                        {t.travel_style}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTrip(e, t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {t.title}
                    </h4>

                    <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span className="font-medium text-slate-700">
                          {t.starting_location} ➔ {t.destination}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.number_of_days} Days Vacation</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.number_of_travelers} Travelers</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        Budget
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(t.budget)}
                      </span>
                    </div>

                    <span className="inline-flex items-center space-x-1 text-brand-600 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
