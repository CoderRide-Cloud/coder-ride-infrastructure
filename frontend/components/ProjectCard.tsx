import { Project } from '@/lib/types';
import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const categoryColor = {
    WEB: 'text-blue-400',
    AI: 'text-purple-400',
    UIUX: 'text-pink-400',
  };

  return (
    <div 
      className="card-hover overflow-hidden flex flex-col h-full cursor-pointer bg-slate-800 rounded-xl border border-slate-700 transition-all duration-300 hover:border-slate-600 active:scale-[0.98]"
      onClick={onClick}
    >
      {/* Project Image */}
      {project.imageUrl && (
        <div className="aspect-video overflow-hidden bg-slate-700">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-4 md:p-6 flex flex-col flex-1">
        {/* Category Badge */}
        {project.category && (
          <span className={`badge-primary w-fit text-xs mb-3 ${categoryColor[project.category] || ''}`}>
            {project.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => {
              const tagId = tag?.id || index;
              const tagName = tag?.name;
              
              if (!tagName) return null;
              
              return (
                <span key={tagId} className="badge-secondary text-xs px-2 py-1">
                  {tagName}
                </span>
              );
            })}
            {project.tags.length > 3 && (
              <span className="badge-secondary text-xs px-2 py-1">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 mb-4">No tags</div>
        )}

        {/* Links */}
        <div className="flex gap-2 pt-4 border-t border-slate-700" onClick={(e) => e.stopPropagation()}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 min-h-[44px]"
            >
              <Github size={16} />
              <span className="hidden xs:inline">GitHub</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 min-h-[44px]"
            >
              <ExternalLink size={16} />
              <span className="hidden xs:inline">Live</span>
            </a>
          )}
        </div>

        {/* Member Info */}
        {project.member && (
          <div 
            className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={project.member.user.avatarUrl || '/avatar.png'}
              alt={project.member.fullName || project.member.user.username}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <Link
              href={`/members/user/${project.member.id}`}
              className="text-sm text-slate-400 hover:text-primary transition-colors truncate"
            >
              {project.member.fullName || project.member.user.username}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}