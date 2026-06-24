import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { eventApi } from '@/lib/api';
import { Event } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUpcoming, setFilterUpcoming] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventApi.getAll();
        const allEvents = res.data.sort(
          (a: Event, b: Event) =>
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
        setEvents(allEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = filterUpcoming
    ? events.filter((event) => event.isUpcoming)
    : events;

  return (
    <Layout>
      {/* Header */}
      <section className="container-custom py-16 text-center">
        <h1 className="section-title mb-4">Events</h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          Join us for workshops, meetups, and community events
        </p>
      </section>

      {/* Filters and Grid */}
      <section className="container-custom py-12">
        {/* Filter Tabs */}
        <div className="mb-8 flex gap-4 justify-center">
          <button
            onClick={() => setFilterUpcoming(true)}
            className={`btn ${
              filterUpcoming
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setFilterUpcoming(false)}
            className={`btn ${
              !filterUpcoming
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {filterUpcoming ? 'No upcoming events' : 'No past events'}
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
