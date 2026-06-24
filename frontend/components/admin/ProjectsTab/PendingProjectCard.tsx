import { CheckCircle, XCircle } from 'lucide-react';
import { Project } from '@/lib/types';

interface PendingProjectCardProps {
  project: Project;
  onApprove: (projectId: number) => void;
  onReject: (projectId: number) => void;
  onClick: (project: Project) => void;
}

export default function PendingProjectCard({ 
  project, 
  onApprove, 
  onReject, 
  onClick 
}: PendingProjectCardProps) {
  return (
    <div
      onClick={() => onClick(project)}
      className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 cursor-pointer active:scale-95 group"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {project.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            by {project.member?.fullName || project.member?.user?.username}
          </p>
        </div>
        {project.category && (
          <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30 whitespace-nowrap flex-shrink-0 mt-1">
            {project.category}
          </span>
        )}
      </div>
      
      {project.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}
      
      {/* Mobile-optimized buttons */}
      <div className="flex flex-col xs:flex-row gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(project.id);
          }}
          className="flex-1 py-3 xs:py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-green-600/30 active:scale-95 transition-all duration-200 text-sm font-medium border border-green-500/20 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject(project.id);
          }}
          className="flex-1 py-3 xs:py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-lg hover:from-red-500/30 hover:to-red-600/30 active:scale-95 transition-all duration-200 text-sm font-medium border border-red-500/20 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <XCircle className="w-4 h-4" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}