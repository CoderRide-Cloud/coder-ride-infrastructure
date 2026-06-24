import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Event } from '@/lib/types';
import { adminApi, eventApi } from '@/lib/api';
import EventSearch, { EventFilters } from './EventSearch';
import EventForm, { EventFormData } from './EventForm';
import EventCard from './EventCard';
import Pagination from '@/components/ui/Pagination';

interface EventsTabProps {
  events: Event[];
  onDataChange: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ITEMS_PER_PAGE = 9;

export default function EventsTab({ events, onDataChange, onSuccess, onError }: EventsTabProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({
    featuredOnly: false,
    upcomingOnly: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Featured filter
    if (filters.featuredOnly && !event.isFeatured) return false;

    // Upcoming filter
    if (filters.upcomingOnly) {
      const isUpcoming = new Date(event.eventDate) > new Date();
      if (!isUpcoming) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const toggleEventFeatured = async (eventId: number, featured: boolean) => {
    try {
      setLoading(true);
      await adminApi.setEventFeatured(eventId, { isFeatured: !featured });
      onSuccess('Event updated successfully');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: EventFormData) => {
    try {
      setLoading(true);
      await eventApi.create(data);
      setShowEventForm(false);
      onSuccess('Event created successfully');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      setLoading(true);
      await eventApi.update(editingEvent.id, data);
      setEditingEvent(null);
      onSuccess('Event updated successfully');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setLoading(true);
      await eventApi.delete(eventId);
      onSuccess('Event deleted successfully');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Event Management</h2>
              <p className="text-slate-400 text-sm">
                Create and manage community events
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEventForm(true)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
          >
            <Plus size={20} />
            New Event
          </button>
        </div>

        {/* Search and Filters */}
        <EventSearch
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchQuery={searchQuery}
        />
      </div>

      {/* Events Grid */}
      <div className="card p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-white">
            All Events ({filteredEvents.length})
          </h3>
          
          {/* Results info */}
          {filteredEvents.length > 0 && (
            <div className="text-sm text-slate-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of{' '}
              {filteredEvents.length} events
            </div>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-base">
              {searchQuery || filters.featuredOnly || filters.upcomingOnly
                ? 'No events match your search criteria'
                : 'No events yet. Create your first event!'}
            </p>
            {(searchQuery || filters.featuredOnly || filters.upcomingOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    featuredOnly: false,
                    upcomingOnly: false,
                  });
                }}
                className="mt-2 text-primary hover:text-accent transition-colors text-sm"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onToggleFeatured={toggleEventFeatured}
                  onEdit={handleEdit}
                  onDelete={deleteEvent}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Event Form Modals */}
      {showEventForm && (
        <EventForm
          onSubmit={createEvent}
          onCancel={() => setShowEventForm(false)}
          loading={loading}
        />
      )}

      {editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={updateEvent}
          onCancel={() => setEditingEvent(null)}
          loading={loading}
        />
      )}
    </div>
  );
}