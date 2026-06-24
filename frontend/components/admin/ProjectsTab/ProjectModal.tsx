import {
  X,
  FolderOpen,
  User,
  CheckCircle,
  Clock,
  Github,
  ExternalLink,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Project } from "@/lib/types";

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (projectId: number) => void;
  onReject: (projectId: number) => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl my-8 mx-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 sticky top-0 bg-slate-800 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 active:scale-95 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Project Status & Author */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                by{" "}
                {project.member?.fullName ||
                  project.member?.user?.username ||
                  "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {project.isApproved ? (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium">
                  <CheckCircle className="inline-block w-3 h-3 mr-1" />
                  Approved
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-medium">
                  <Clock className="inline-block w-3 h-3 mr-1" />
                  Pending Review
                </span>
              )}
            </div>
            {project.category && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-medium">
                {project.category}
              </span>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Description
              </h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Technologies & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: any, index: number) => {
                  const tagId = tag?.id || index;
                  const tagName = tag?.name;

                  if (!tagName) return null;

                  return (
                    <span
                      key={tagId}
                      className="px-3 py-1.5 bg-slate-700 rounded-full text-slate-300 text-sm border border-slate-600"
                    >
                      {tagName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                <Github size={16} />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
          </div>

          {/* Rejection Reason */}
          {project.rejectionReason && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Rejection Reason
              </h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300 leading-relaxed whitespace-pre-line">
                  {project.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons for Pending Projects */}
          {!project.isApproved && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => onApprove(project.id)}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] text-base"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Project
              </button>
              <button
                onClick={() => onReject(project.id)}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] text-base"
              >
                <XCircle className="w-5 h-5" />
                Reject Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
