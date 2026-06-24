import { useState } from "react";
import { User, UserRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import {
  canManageUser,
  canAssignRole,
  hasPermission,
  canAssignRoleBasic,
} from "@/lib/permissions";
import { Permission } from "@/lib/types";
import RoleAssignmentModal from "./RoleAssignmentModal";
import SuspensionModal from "./SuspensionModal";
import MemberModal from "./MemberModal";
import { Crown, MoreVertical } from "lucide-react";

interface MemberCardProps {
  user: User;
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUser: User;
  onViewMember?: (member: User) => void;
}

export default function MemberCard({
  user,
  onDataChange,
  onError,
  onSuccess,
  currentUser,
  onViewMember,
}: MemberCardProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleRoleUpdate = async (
    role: UserRole,
    customRoleId?: number | null,
    reason?: string
  ) => {
    try {
      const response = await adminApi.updateUserRole(user.id, {
        role,
        customRoleId,
        reason,
      });

      // Check if we got a valid user response instead of looking for success field
      if (!response.data || !response.data.id) {
        throw new Error("Invalid response from server");
      }

      // The response.data IS the updated user
      const updatedUser = response.data;

      // Build success message based on what changed
      let successMessage = "";
      const newCustomRole = updatedUser.customRole?.name;

      if (role === "SUSPENDED") {
        successMessage = `User has been suspended${
          reason ? `: ${reason}` : ""
        }`;
      } else if (user.role === "PENDING" && role === "MEMBER") {
        successMessage = newCustomRole
          ? `Member approved and assigned ${newCustomRole} role`
          : "Member approved as regular member";
      } else if (user.role === "SUSPENDED" && role === "MEMBER") {
        successMessage = newCustomRole
          ? `User activated with ${newCustomRole} role`
          : "User activated as regular member";
      } else if (role === "ADMIN" && user.role !== "ADMIN") {
        successMessage = "User promoted to Administrator";
      } else if (customRoleId !== user.customRoleId) {
        // Custom role actually changed
        if (newCustomRole) {
          successMessage = `Custom role updated to ${newCustomRole}`;
        } else {
          successMessage = "Custom role removed";
        }
      } else if (role !== user.role) {
        // Main role changed (but not to/from admin)
        successMessage = `Role updated to ${role}`;
      } else {
        // No actual changes detected
        successMessage = "Settings updated";
      }

      onSuccess(successMessage);
      onDataChange(); // This should trigger a refresh of the user list
      setShowMobileMenu(false);
      setShowRoleModal(false);
    } catch (error: any) {
      console.error("❌ Role update failed:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to update role";
      onError(errorMessage);
    }
  };
  // Permission checks using backend-compatible logic
  const canModify = canManageUser(currentUser, user);
  const canAssign = canAssignRoleBasic(currentUser, user);

  // Fix: Admins can set themselves as leads, and users can set leads for others they can manage
  const canSetLead =
    hasPermission(currentUser, Permission.MANAGE_MEMBERS) &&
    user.isActive &&
    (user.id === currentUser.id || canManageUser(currentUser, user));

  // Prevent admins from un-adminning themselves
  const isCurrentUser = user.id === currentUser.id;
  const canSuspend = canModify && !(isCurrentUser && user.role === "ADMIN");

  const handleUserInfoClick = () => {
    if (onViewMember) {
      onViewMember(user);
    } else {
      setShowMemberModal(true);
      setShowMobileMenu(false);
    }
  };

  const handleSetLeadStatus = async (isLead: boolean) => {
    try {
      await adminApi.setUserLeadStatus(user.id, isLead);
      onSuccess(
        isLead
          ? "User set as community lead"
          : "User removed from community leads"
      );
      onDataChange();
      setShowMobileMenu(false);
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to update lead status");
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* User Info */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={handleUserInfoClick}
          >
            <img
              src={user.avatarUrl || "/avatar.png"}
              alt={user.username || "User"}
              className="w-12 h-12 rounded-full border-2 border-slate-600 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-base truncate">
                {user.username || "Unknown User"}
              </h3>
              <p className="text-sm text-slate-400 truncate">
                {user.email || "No email provided"}
              </p>
              {user.member?.fullName && (
                <p className="text-xs text-slate-500 truncate">
                  {user.member.fullName}
                </p>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === "ADMIN"
                      ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30"
                      : user.role === "MEMBER"
                      ? "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/30"
                      : user.role === "SUSPENDED"
                      ? "bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-400 border border-red-500/30"
                      : "bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {user.role === "PENDING" ? "Pending Approval" : user.role}
                </span>

                {user.customRole && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium border"
                    style={{
                      backgroundColor: `${user.customRole.color}20`,
                      color: user.customRole.color,
                      borderColor: `${user.customRole.color}30`,
                    }}
                  >
                    {user.customRole.name}
                  </span>
                )}

                {!user.isActive &&
                  user.role !== "SUSPENDED" &&
                  user.role !== "PENDING" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/30 text-orange-400 border border-orange-500/30 font-medium">
                      Inactive
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowRoleModal(true)}
              disabled={!canAssign}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                canAssign
                  ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              Assign Role
            </button>

            {canSetLead && (
              <button
                onClick={() => handleSetLeadStatus(!user.isLead)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                  user.isLead
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                    : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                }`}
              >
                <Crown size={16} />
                {user.isLead ? "Remove Lead" : "Make Lead"}
              </button>
            )}

            {user.role !== "SUSPENDED" ? (
              <button
                onClick={() => setShowSuspensionModal(true)}
                disabled={!canSuspend}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canSuspend
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleRoleUpdate("MEMBER")}
                disabled={!canModify}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canModify
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Activate
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MoreVertical size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile Actions Menu */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-700/50 space-y-2">
            <button
              onClick={() => setShowRoleModal(true)}
              disabled={!canAssign}
              className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                canAssign
                  ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              Assign Role
            </button>

            {canSetLead && (
              <button
                onClick={() => handleSetLeadStatus(!user.isLead)}
                className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                  user.isLead
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                    : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                }`}
              >
                <Crown size={16} />
                {user.isLead ? "Remove Lead" : "Make Lead"}
              </button>
            )}

            {user.role !== "SUSPENDED" ? (
              <button
                onClick={() => setShowSuspensionModal(true)}
                disabled={!canSuspend}
                className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canSuspend
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleRoleUpdate("MEMBER")}
                disabled={!canModify}
                className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  canModify
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                Activate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRoleModal && (
        <RoleAssignmentModal
          user={user}
          onClose={() => {
            setShowRoleModal(false);
            setShowMobileMenu(false);
          }}
          onSave={handleRoleUpdate}
          currentUser={currentUser}
        />
      )}

      {showSuspensionModal && (
        <SuspensionModal
          user={user}
          onClose={() => {
            setShowSuspensionModal(false);
            setShowMobileMenu(false);
          }}
          onConfirm={(reason) =>
            handleRoleUpdate("SUSPENDED", undefined, reason)
          }
        />
      )}

      {showMemberModal && (
        <MemberModal
          user={user}
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false);
            setShowMobileMenu(false);
          }}
          onApprove={(customRoleId) => handleRoleUpdate("MEMBER", customRoleId)}
          onReject={(reason) =>
            handleRoleUpdate("SUSPENDED", undefined, reason)
          }
          currentUserId={currentUser.id}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
