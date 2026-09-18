import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripsApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Calendar, 
  MapPin, 
  Compass, 
  PlusCircle, 
  ArrowRight, 
  IndianRupee, 
  Users, 
  Trash2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const SavedTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsApi.getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to fetch saved trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await tripsApi.deleteTrip(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your saved trips..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              My Saved Trips
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review all historical and upcoming vacation schedules you've planned.
            </p>
          </div>

          <Link
            to="/create-trip"
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan a New Trip</span>
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No saved trips</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Plan your next getaway in seconds with personalized route clustering and expense forecasting.
            </p>
            <Link
              to="/create-trip"
              className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/itinerary/${t.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[11px] font-bold uppercase tracking-wider">
                      {t.travel_style}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTrip(e, t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-heading">
                    {t.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-slate-800">
                        {t.starting_location} ➔ {t.destination}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{t.number_of_days} Days Vacation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{t.number_of_travelers} Travelers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span>Budget: {formatCurrency(t.budget)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 group-hover:underline">
                    Open Full Itinerary
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTrips;
