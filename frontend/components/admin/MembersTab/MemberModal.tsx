import { useState, useEffect } from "react";
import { User, CustomRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import { canManageCustomRole } from "@/lib/permissions";
import { X, Mail, Github, Calendar, CheckCircle, XCircle, User as UserIcon, AlertTriangle } from "lucide-react";

interface MemberModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (customRoleId?: number) => void;
  onReject: (reason: string) => void;
  currentUserId: number;
  currentUser: User; // Add currentUser prop
}

export default function MemberModal({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  currentUserId,
  currentUser, // Add currentUser
}: MemberModalProps) {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [selectedCustomRole, setSelectedCustomRole] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user.role === "PENDING") {
      loadCustomRoles();
    }
  }, [isOpen, user.role]);

  if (!isOpen) return null;

  const canModify = user.id !== currentUserId || user.role !== "ADMIN";

  const loadCustomRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await adminApi.getCustomRoles();
      
      // Handle the Axios response structure
      const responseData = response.data;
      
      let rolesData: CustomRole[] = [];
      
      if (Array.isArray(responseData)) {
        rolesData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        rolesData = responseData.data;
      } else if (responseData && Array.isArray(responseData.roles)) {
        rolesData = responseData.roles;
      }
      
      console.log('Custom roles in member modal:', rolesData);
      setCustomRoles(rolesData);
    } catch (error) {
      console.error("Failed to load custom roles:", error);
    } finally {
      setRolesLoading(false);
    }
  };

  // Filter custom roles to only those the current user can manage
  const manageableCustomRoles = customRoles.filter(role => 
    canManageCustomRole(currentUser, role)
  );

  const handleApprove = () => {
    onApprove(selectedCustomRole || undefined);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onReject(rejectionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-white">
              Member Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <img
              src={user.avatarUrl || "/avatar.png"}
              alt={user.username}
              className="w-20 h-20 rounded-full border-2 border-slate-600"
            />
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-white mb-2">
                {user.username}
              </h4>
              {user.member?.fullName && (
                <p className="text-lg text-slate-300 mb-3">
                  {user.member.fullName}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <a href={user.githubUrl} target="_blank" className="text-primary hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suspension Warning */}
          {user.role === "SUSPENDED" && user.suspensionReason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-red-400 mb-2">Account Suspended</h5>
                  <div className="space-y-2">
                    <p className="text-red-300 text-sm">
                      <strong>Reason:</strong> {user.suspensionReason}
                    </p>
                    <p className="text-red-300/80 text-xs">
                      This account has been suspended and cannot access the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status & Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h5 className="font-semibold text-slate-300 mb-2">Status</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Main Role:</span>
                  <span className={`font-medium ${
                    user.role === "ADMIN" ? "text-accent" :
                    user.role === "MEMBER" ? "text-primary" :
                    user.role === "SUSPENDED" ? "text-red-400" :
                    "text-yellow-400"
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active:</span>
                  <span className={user.isActive ? "text-green-400" : "text-red-400"}>
                    {user.isActive ? "Yes" : "No"}
                  </span>
                </div>
                {user.customRole && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custom Role:</span>
                    <span 
                      className="font-medium"
                      style={{ color: user.customRole.color }}
                    >
                      {user.customRole.name}
                    </span>
                  </div>
                )}
                {/* Show suspension reason in status panel too */}
                {user.role === "SUSPENDED" && user.suspensionReason && (
                  <div className="pt-2 border-t border-slate-600">
                    <span className="text-slate-400 text-sm">Suspension Reason:</span>
                    <p className="text-red-300 text-sm mt-1">{user.suspensionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h5 className="font-semibold text-slate-300 mb-2">Member Profile</h5>
              <div className="space-y-2 text-sm">
                {user.member?.roleTitle && (
                  <div>
                    <span className="text-slate-400">Title:</span>
                    <p className="text-white">{user.member.roleTitle}</p>
                  </div>
                )}
                {user.member?.devStack && (
                  <div>
                    <span className="text-slate-400">Tech Stack:</span>
                    <p className="text-white">{user.member.devStack}</p>
                  </div>
                )}
                {user.isLead && (
                  <div>
                    <span className="text-slate-400">Lead Status:</span>
                    <p className="text-accent">Community Lead</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.member?.bio && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h5 className="font-semibold text-slate-300 mb-2">Bio</h5>
              <p className="text-slate-300 text-sm leading-relaxed">
                {user.member.bio}
              </p>
            </div>
          )}

          {/* Actions for Pending Members */}
          {user.role === "PENDING" && canModify && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h5 className="font-semibold text-yellow-400 mb-3">Review Application</h5>
              
              {!showRejectionForm ? (
                <div className="space-y-4">
                  {/* Custom Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Assign Custom Role (Optional)
                    </label>
                    
                    {rolesLoading ? (
                      <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-400 mt-2">Loading roles...</p>
                      </div>
                    ) : (
                      <select
                        value={selectedCustomRole || ""}
                        onChange={(e) => setSelectedCustomRole(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      >
                        <option value="">Regular Member</option>
                        {/* Only show manageable roles */}
                        {manageableCustomRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} (Position: {role.position})
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {manageableCustomRoles.length === 0 && customRoles.length > 0 && !rolesLoading && (
                      <p className="text-xs text-yellow-400 mt-2">
                        No custom roles available to assign (all roles are equal or higher than your position)
                      </p>
                    )}
                    
                    {manageableCustomRoles.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        You can assign roles with position lower than your current position
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Member
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(true)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(false)}
                      className="flex-1 bg-slate-600 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}