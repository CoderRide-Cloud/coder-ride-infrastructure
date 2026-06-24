import { Project } from '@/lib/types';
import { Github, ExternalLink, X, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const categoryColor = {
    WEB: 'text-blue-400',
    AI: 'text-purple-400',
    UIUX: 'text-pink-400',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !project) return null;

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      {/* Modal Container - Bottom sheet on mobile */}
      <div 
        className="bg-slate-900 rounded-t-2xl md:rounded-xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-out"
        style={{
          height: 'calc(100vh - 2rem)',
          marginTop: 'auto',
          marginBottom: '0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-slate-900 flex justify-between items-start p-4 md:p-6 border-b border-slate-700 z-10">
          <div className="flex-1 pr-4">
            {project.category && (
              <span className={`badge-primary text-sm mb-2 ${categoryColor[project.category] || ''}`}>
                {project.category}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
              {project.title}
            </h2>
            
            {/* Project Meta - Stack on mobile */}
            <div className="flex flex-col gap-1 text-sm text-slate-400">
              {project.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
              )}
              {project.updatedAt && project.updatedAt !== project.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content - Better mobile padding */}
        <div className="p-4 md:p-6">
          {/* Project Image - Better mobile aspect ratio */}
          {project.imageUrl && (
            <div className="mb-4 md:mb-6 rounded-lg overflow-hidden bg-slate-800">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-48 md:h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 md:mb-3">Description</h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {project.description}
              </p>
            </div>
          )}

          {/* Tags - Better mobile wrapping */}
          {project.tags && project.tags.length > 0 && (
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 md:mb-3">Technologies & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => {
                  const tagId = tag?.id || index;
                  const tagName = tag?.name;
                  
                  if (!tagName) return null;
                  
                  return (
                    <span key={tagId} className="badge-secondary text-sm px-3 py-1.5">
                      {tagName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Links - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 justify-center py-3 text-base min-h-[44px]"
              >
                <Github size={18} />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 justify-center py-3 text-base min-h-[44px]"
              >
                <ExternalLink size={18} />
                Live Demo
              </a>
            )}
          </div>

          {/* Member Info */}
          {project.member && (
            <div className="pt-4 md:pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2 md:mb-3">Project by</h3>
              <Link
                href={`/members/user/${project.member.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
              >
                <img
                  src={project.member.user.avatarUrl || '/avatar.png'}
                  alt={project.member.fullName || project.member.user.username}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium group-hover:text-primary transition-colors truncate">
                    {project.member.fullName || project.member.user.username}
                  </p>
                  {project.member.user.username && (
                    <p className="text-slate-400 text-sm truncate">@{project.member.user.username}</p>
                  )}
                </div>
                <User size={18} className="text-slate-400 flex-shrink-0" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}