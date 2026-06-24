import { Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: number) => void;
  onClick: (project: Project) => void;
  showRejectionReason?: boolean;
}

export default function ProjectCard({ 
  project, 
  onDelete, 
  onClick,
  showRejectionReason = false
}: ProjectCardProps) {
  const isRejected = !project.isApproved && project.rejectionReason;

  return (
    <div
      onClick={() => onClick(project)}
      className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 active:scale-95 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {project.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            by {project.member?.fullName || project.member?.user?.username}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {project.isApproved ? (
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/30 text-green-400 border border-green-500/30 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Approved
              </span>
            ) : isRejected ? (
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-400 border border-red-500/30 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Rejected
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 text-yellow-400 border border-yellow-500/30 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
            {project.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                {project.category}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-95 rounded-lg transition-all duration-300 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Delete project"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Show rejection reason when in rejected filter */}
      {showRejectionReason && project.rejectionReason && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs font-medium text-red-400 mb-1">Rejection Reason:</p>
          <p className="text-xs text-red-300 leading-relaxed line-clamp-2">
            {project.rejectionReason}
          </p>
        </div>
      )}
      
      {project.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mt-3 leading-relaxed">
          {project.description}
        </p>
      )}
    </div>
  );
}