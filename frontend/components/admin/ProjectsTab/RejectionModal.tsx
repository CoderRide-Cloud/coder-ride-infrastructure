import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Project } from '@/lib/types';

interface RejectionModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onReject: (projectId: number, reason: string) => void;
  isSubmitting?: boolean;
}

export default function RejectionModal({ 
  project, 
  isOpen, 
  onClose, 
  onReject, 
  isSubmitting = false 
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    
    onReject(project.id, rejectionReason.trim());
    setRejectionReason('');
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-red-500/30 w-full max-w-md mx-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reject Project</h2>
              <p className="text-slate-400 text-sm mt-1">Provide a reason for rejection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Project Info */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="font-semibold text-white mb-2">{project.title}</h3>
          <p className="text-slate-400 text-sm">
            by {project.member?.fullName || project.member?.user?.username}
          </p>
        </div>

        {/* Rejection Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide specific feedback on why this project was rejected. This will be sent to the user via email and Discord."
              className="w-full h-32 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none transition-colors"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-2">
              This reason will be emailed to the user and stored with the project record.
            </p>
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center text-sm">
            <span className={`${rejectionReason.length === 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {rejectionReason.length === 0 ? 'Reason is required' : `${rejectionReason.length} characters`}
            </span>
            <span className="text-slate-500">
              Minimum 10 characters
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rejectionReason.trim().length < 10}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Reject Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}