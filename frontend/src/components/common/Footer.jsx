import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, ShieldCheck, Sparkles, MapPin, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-ocean-500 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-heading text-white">
                Travel<span className="text-brand-400">Wise</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart, stress-free travel planning designed specifically for short weekend getaways and multi-day vacations.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Smart Clustering & Budget Forecasting</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/places" className="hover:text-white transition-colors">Explore Places</Link>
              </li>
              <li>
                <Link to="/create-trip" className="hover:text-white transition-colors">Plan a Trip</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Trip Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Featured Destinations */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Hubs</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Hyderabad, Telangana</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Goa (North & South)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Jaipur & Rajasthan</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Bengaluru & Karnataka</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Agra, Uttar Pradesh</span>
              </li>
            </ul>
          </div>

          {/* Tech & Architecture */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">System</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Powered by FastAPI (Python), SQLAlchemy, PostgreSQL/SQLite, React 19, Vite, and Tailwind CSS.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FastAPI REST API v1.0</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelWise Platform. Designed for short vacation planners.</p>
          <div className="flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Built with precision for travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
