import { Star, Trash2, Edit, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Event } from '@/lib/types';

interface EventCardProps {
  event: Event;
  onToggleFeatured: (eventId: number, featured: boolean) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
}

export default function EventCard({ event, onToggleFeatured, onEdit, onDelete }: EventCardProps) {
  const isUpcoming = new Date(event.eventDate) > new Date();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="h-32 md:h-40 overflow-hidden bg-slate-700 relative">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {event.isFeatured && (
              <div className="bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Star size={12} className="fill-current" />
                Featured
              </div>
            )}
            {isUpcoming && (
              <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                Upcoming
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-white text-base md:text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
            <Calendar size={14} className="flex-shrink-0" />
            <span>
              {new Date(event.eventDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onToggleFeatured(event.id, event.isFeatured)}
            className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              event.isFeatured
                ? 'bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30 hover:from-accent/30 hover:to-accent/40'
                : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            <Star size={14} className={event.isFeatured ? 'fill-current' : ''} />
            {event.isFeatured ? 'Featured' : 'Feature'}
          </button>
          
          <button
            onClick={() => onEdit(event)}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-300 border border-slate-600"
          >
            <Edit size={14} />
          </button>
          
          <button
            onClick={() => onDelete(event.id)}
            className="px-3 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 border border-red-500/20"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Registration Link */}
        {event.registrationUrl && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:text-accent transition-colors"
            >
              <ExternalLink size={12} />
              Registration Link
            </a>
          </div>
        )}
      </div>
    </div>
  );
}