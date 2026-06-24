import { Event } from '@/lib/types';
import { Calendar, MapPin, Star } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="card-hover overflow-hidden">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="h-40 overflow-hidden bg-slate-700">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="flex items-center gap-1 mb-2 text-accent">
            <Star size={16} className="fill-current" />
            <span className="text-xs font-medium">Featured</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar size={16} className="text-primary" />
            <span className="text-sm">
              {eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mb-4">
          {isUpcoming ? (
            <span className="badge-accent">Upcoming</span>
          ) : (
            <span className="badge bg-slate-700 text-slate-400">Past Event</span>
          )}
        </div>

        {/* Register Button */}
        {event.registrationUrl && isUpcoming && (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Register Now
          </a>
        )}
      </div>
    </div>
  );
}
