import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  tripsApi, 
  itineraryApi, 
  budgetApi, 
  checklistApi 
} from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  IndianRupee, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  Printer, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  DollarSign, 
  Luggage, 
  ArrowLeft, 
  RotateCw,
  Utensils,
  Car,
  Compass,
  Check
} from 'lucide-react';
import { formatCurrency, formatDuration, formatDistance, getCategoryBadgeStyle } from '../utils/formatters';

export const ItineraryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [checklist, setChecklist] = useState(null);

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary', 'budget', 'checklist'
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Essentials');
  const [actionError, setActionError] = useState('');

  // Load all trip data
  const loadTripData = async () => {
    try {
      setLoading(true);
      const [tripRes, itinRes, budgetRes, checkRes] = await Promise.all([
        tripsApi.getTrip(id),
        itineraryApi.getItinerary(id),
        budgetApi.getBudget(id),
        checklistApi.getChecklist(id),
      ]);

      setTrip(tripRes.data);
      setItinerary(itinRes.data);
      setBudget(budgetRes.data);
      setChecklist(checkRes.data);
    } catch (err) {
      console.error('Failed to load trip details:', err);
      setActionError('Could not load trip data. Please verify trip ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [id]);

  // Re-generate itinerary
  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      await itineraryApi.generateItinerary(id);
      await loadTripData();
    } catch (err) {
      console.error('Failed to regenerate itinerary:', err);
      setActionError('Failed to regenerate itinerary.');
    } finally {
      setRegenerating(false);
    }
  };

  // Toggle checklist item
  const handleToggleChecklistItem = async (item) => {
    try {
      const updated = !item.is_completed;
      await checklistApi.updateItem(item.id, { is_completed: updated });
      // Optimistic update
      setChecklist((prev) => {
        if (!prev) return prev;
        const newItems = prev.items.map((i) =>
          i.id === item.id ? { ...i, is_completed: updated } : i
        );
        const completedCount = newItems.filter((i) => i.is_completed).length;
        return {
          ...prev,
          completed_items: completedCount,
          progress_percentage: Math.round((completedCount / newItems.length) * 100),
          items: newItems,
        };
      });
    } catch (err) {
      console.error('Failed to update checklist item:', err);
    }
  };

  // Add custom checklist item
  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      const res = await checklistApi.addItem(id, {
        item: newItemText.trim(),
        category: newItemCategory,
        is_completed: false,
      });
      setNewItemText('');
      // Reload checklist
      const updatedCheck = await checklistApi.getChecklist(id);
      setChecklist(updatedCheck.data);
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  // Delete checklist item
  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await checklistApi.deleteItem(itemId);
      const updatedCheck = await checklistApi.getChecklist(id);
      setChecklist(updatedCheck.data);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Building your smart travel schedule..." size="large" />;
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Trip Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested itinerary could not be loaded.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const days = itinerary?.days || [];
  const currentDay = days[selectedDayIndex] || days[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/saved-trips"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Trips</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Itinerary</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Optimizing...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Trip Overview Hero Header */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                  {trip.travel_style} Pacing
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Created for {trip.number_of_travelers} Traveler{trip.number_of_travelers > 1 ? 's' : ''}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center space-x-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>
                    {trip.starting_location} ➔ {trip.destination}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trip.number_of_days} Days Vacation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <span>Budget: {formatCurrency(trip.budget)}</span>
                </div>
              </div>
            </div>

            {/* Quick Budget Health Pill */}
            {budget && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Est. Total
                  </p>
                  <p className="text-lg font-black text-slate-900 font-heading">
                    {formatCurrency(budget.total_estimated_cost)}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      budget.is_over_budget
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {budget.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Itinerary, Budget, Packing Checklist) */}
          <div className="flex space-x-2 border-b border-slate-100 mt-6 pt-2">
            {[
              { id: 'itinerary', label: 'Day-by-Day Schedule', icon: Calendar },
              { id: 'budget', label: 'Expense Forecast', icon: DollarSign },
              { id: 'checklist', label: 'Packing Checklist', icon: Luggage },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'border-brand-600 text-brand-700 bg-brand-50/40 rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: ITINERARY VIEW */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            {/* Day Selector Tabs */}
            {days.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {days.map((day, idx) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      selectedDayIndex === idx
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    Day {day.day_number}: {day.title}
                  </button>
                ))}
              </div>
            )}

            {/* Current Day Schedule */}
            {currentDay ? (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                      Day {currentDay.day_number} Plan
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-heading mt-0.5">
                      {currentDay.title}
                    </h2>
                    {currentDay.description && (
                      <p className="text-xs text-slate-500 mt-1">{currentDay.description}</p>
                    )}
                  </div>

                  {/* Items Timeline */}
                  <div className="space-y-6 relative before:absolute before:left-4 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {currentDay.items && currentDay.items.length > 0 ? (
                      currentDay.items.map((item, itemIdx) => (
                        <div key={item.id} className="relative pl-10 sm:pl-12">
                          {/* Timeline node icon */}
                          <div
                            className={`absolute left-2 sm:left-3 top-1 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm z-10 ${
                              item.item_type === 'meal'
                                ? 'bg-amber-500 border-white text-white'
                                : 'bg-brand-600 border-white text-white'
                            }`}
                          >
                            {itemIdx + 1}
                          </div>

                          {/* Transit alert between spots */}
                          {item.travel_time_from_prev_mins > 0 && (
                            <div className="mb-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 text-[11px] font-medium">
                              <Car className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                ~{item.travel_time_from_prev_mins} mins transit ({formatDistance(item.travel_distance_km)})
                              </span>
                            </div>
                          )}

                          {/* Activity Card */}
                          <div className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[11px] font-bold">
                                    {item.time_slot}
                                  </span>
                                  {item.place?.category && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadgeStyle(
                                        item.place.category
                                      )}`}
                                    >
                                      {item.place.category}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mt-1.5 font-heading">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="flex items-center space-x-3 text-xs text-slate-500 shrink-0">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{formatDuration(item.duration_hours * 60)}</span>
                                </div>
                                {item.estimated_cost > 0 && (
                                  <div className="flex items-center space-x-1 font-semibold text-slate-800">
                                    <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
                                    <span>{formatCurrency(item.estimated_cost)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {item.place && (
                              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{item.place.address || item.place.city}</span>
                                </span>
                                {item.place.rating && (
                                  <span className="font-semibold text-amber-600">
                                    ★ {Number(item.place.rating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-8 text-center">
                        No activities scheduled for this day. Click "Regenerate" above to rebuild.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-12 text-slate-500 text-sm">No days generated.</p>
            )}
          </div>
        )}

        {/* TAB 2: BUDGET PLANNER */}
        {activeTab === 'budget' && budget && (
          <div className="space-y-6">
            {/* Warning Alert if over budget */}
            {budget.is_over_budget && (
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Estimated Cost Exceeds Allocated Budget!</p>
                  <p className="mt-1 text-rose-700 leading-relaxed">
                    {budget.message ||
                      'The current activities and dining estimates exceed your planned limit. Consider adjusting your travel style to "Relaxed" or increasing your budget.'}
                  </p>
                </div>
              </div>
            )}

            {/* Budget Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left border-b border-slate-100 pb-6 mb-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Budget Allocated
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
                    {formatCurrency(budget.user_budget)}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Estimated Expenses
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-brand-600 font-heading mt-1">
                    {formatCurrency(budget.total_estimated_cost)}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Remaining Balance
                  </span>
                  <p
                    className={`text-2xl sm:text-3xl font-black font-heading mt-1 ${
                      budget.remaining_budget < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(budget.remaining_budget)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Budget Utilization</span>
                  <span>{Math.round(budget.budget_usage_percentage)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      budget.is_over_budget
                        ? 'bg-rose-500'
                        : budget.budget_usage_percentage > 85
                        ? 'bg-amber-500'
                        : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(100, budget.budget_usage_percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 5-Category Breakdown Cards */}
            {budget.breakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(budget.breakdown).map(([key, cat]) => (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        {cat.category}
                      </span>
                      <h4 className="text-xl font-black text-slate-900 font-heading mt-1">
                        {formatCurrency(cat.amount)}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Share of total</span>
                      <span>{Math.round(cat.percentage)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PACKING CHECKLIST */}
        {activeTab === 'checklist' && checklist && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Automated Packing Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated based on destination, weather traits, and activities.
                </p>
              </div>

              {/* Progress counter */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                <span>
                  {checklist.completed_items} of {checklist.total_items} packed (
                  {Math.round(checklist.progress_percentage)}%)
                </span>
              </div>
            </div>

            {/* Add Custom Item Form */}
            <form onSubmit={handleAddChecklistItem} className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add custom item (e.g. Extra camera battery)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="Essentials">Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Custom">Custom</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </form>

            {/* Items grouped by category */}
            <div className="space-y-3 pt-2">
              {checklist.items && checklist.items.length > 0 ? (
                checklist.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      item.is_completed
                        ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          item.is_completed
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {item.is_completed && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{item.item}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {item.category}
                      </span>
                      {item.is_custom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChecklistItem(item.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-xs text-slate-400">Checklist is empty.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryView;
