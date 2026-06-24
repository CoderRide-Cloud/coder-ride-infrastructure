import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface EventFilters {
  featuredOnly: boolean;
  upcomingOnly: boolean;
}

interface EventSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: EventFilters) => void;
  searchQuery: string;
  className?: string;
}

export default function EventSearch({ 
  onSearch, 
  onFilter, 
  searchQuery, 
  className = '' 
}: EventSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    featuredOnly: false,
    upcomingOnly: false,
  });

  const handleFilterChange = (key: keyof EventFilters, value: boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: EventFilters = {
      featuredOnly: false,
      upcomingOnly: false,
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = filters.featuredOnly || filters.upcomingOnly;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary text-sm"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={(e) => handleFilterChange('featuredOnly', e.target.checked)}
                className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300">Featured only</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.upcomingOnly}
                onChange={(e) => handleFilterChange('upcomingOnly', e.target.checked)}
                className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-300">Upcoming only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}