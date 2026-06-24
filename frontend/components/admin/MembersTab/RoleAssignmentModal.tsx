import { useState, useEffect } from "react";
import { User, UserRole, CustomRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import { canAssignRole, canAssignRoleBasic, canManageCustomRole, hasPermission } from "@/lib/permissions";
import { Permission } from "@/lib/types";
import { X, Save, Shield, AlertTriangle, Loader } from "lucide-react";

interface RoleAssignmentModalProps {
  user: User;
  onClose: () => void;
  onSave: (role: UserRole, customRoleId?: number | null) => void;
  currentUser: User;
}

export default function RoleAssignmentModal({
  user,
  onClose,
  onSave,
  currentUser,
}: RoleAssignmentModalProps) {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    user.role === "PENDING" ? "MEMBER" : user.role
  );
  const [selectedCustomRole, setSelectedCustomRole] = useState<number | null>(
    user.customRoleId || null
  );
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomRoles();
  }, []);

  const loadCustomRoles = async () => {
    try {
      setRolesLoading(true);
      setRolesError(null);
      const response = await adminApi.getCustomRoles();
      const responseData = response.data;

      let rolesData: CustomRole[] = [];

      if (Array.isArray(responseData)) {
        rolesData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        rolesData = responseData.data;
      } else if (responseData && Array.isArray(responseData.roles)) {
        rolesData = responseData.roles;
      }
      setCustomRoles(rolesData);
    } catch (error) {
      console.error("Failed to load custom roles:", error);
      setRolesError("Failed to load custom roles");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedRole, selectedCustomRole);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Permission checks
  const isCurrentUser = user.id === currentUser.id;
  
  // Allow admins to assign custom roles to themselves
  const canAssign = isCurrentUser 
    ? currentUser.role === "ADMIN" && selectedRole === "ADMIN" // Admins can only keep themselves as ADMIN
    : canAssignRole(currentUser, user, selectedRole);

  // More permissive basic assignment check for self-management
  const canAssignBasic = isCurrentUser
    ? currentUser.role === "ADMIN" // Admins can modify their own custom roles
    : canAssignRoleBasic(currentUser, user);

  // Prevent admins from un-adminning themselves
  const isRemovingAdminFromSelf =
    isCurrentUser && selectedRole !== "ADMIN" && user.role === "ADMIN";

  // Filter custom roles to only those the current user can manage
  const manageableCustomRoles = customRoles.filter((role) =>
    canManageCustomRole(currentUser, role)
  );

  // Allow custom roles for ADMIN users or when selecting MEMBER role
  const isCustomRoleDisabled = selectedRole !== "MEMBER";

  // Show custom role section when MEMBER role is selected
  const showCustomRoleSection = selectedRole === "MEMBER";

  // Special logic for admin self-management
  const isAdminManagingSelf = isCurrentUser && currentUser.role === "ADMIN";
  
  // Save logic that allows admin self-management for custom roles
  const canSaveCustomRoleAssignment = showCustomRoleSection && 
    selectedCustomRole !== null &&
    manageableCustomRoles.some(role => role.id === selectedCustomRole);
  
  const canSave = (canAssign || (isAdminManagingSelf && canSaveCustomRoleAssignment)) && 
    !isRemovingAdminFromSelf && 
    !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">
              Assign Role to {user.username}
              {isCurrentUser && " (Yourself)"}
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
        <div className="p-6 space-y-4">
          {/* Warning for self-admin removal */}
          {isRemovingAdminFromSelf && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-red-400 mb-1">
                    Security Warning
                  </h5>
                  <p className="text-red-300 text-sm">
                    You cannot remove ADMIN role from yourself. This would lock
                    you out of admin privileges.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info for admin self-management */}
          {isAdminManagingSelf && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-400 mb-1">
                    Admin Self-Management
                  </h5>
                  <p className="text-blue-300 text-sm">
                    You can assign custom roles to yourself while maintaining ADMIN privileges.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission Warning */}
          {!canAssign && !isAdminManagingSelf && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-yellow-400 mb-1">
                    Insufficient Permissions
                  </h5>
                  <p className="text-yellow-300 text-sm">
                    You don't have permission to assign roles to this user.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Main Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as UserRole);
                // Reset custom role when changing from MEMBER to something else
                if (e.target.value !== "MEMBER") {
                  setSelectedCustomRole(null);
                }
              }}
              disabled={!canAssignBasic && !isAdminManagingSelf}
              className={`w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary ${
                (!canAssignBasic && !isAdminManagingSelf)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="MEMBER">Member</option>
              {currentUser.role === "ADMIN" && (
                <option value="ADMIN">Admin</option>
              )}
            </select>
            {user.role === "PENDING" && (
              <p className="text-xs text-green-400 mt-1">
                User will be approved and activated
              </p>
            )}
            {isRemovingAdminFromSelf && (
              <p className="text-xs text-red-400 mt-1">
                Cannot remove your own ADMIN role
              </p>
            )}
            {isAdminManagingSelf && (
              <p className="text-xs text-blue-400 mt-1">
                You can assign custom roles while remaining as ADMIN
              </p>
            )}
          </div>

          {/* Custom Role Section - Show when MEMBER role is selected OR admin is managing themselves */}
          {(showCustomRoleSection || isAdminManagingSelf) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Role
                {isAdminManagingSelf && " (Additional Role)"}
              </label>
              
              {rolesLoading ? (
                <div className="flex items-center justify-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <Loader className="w-4 h-4 text-primary animate-spin mr-2" />
                  <span className="text-sm text-slate-400">Loading roles...</span>
                </div>
              ) : rolesError ? (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 text-center">
                    {rolesError}
                  </p>
                </div>
              ) : (
                <select
                  value={selectedCustomRole || ""}
                  onChange={(e) =>
                    setSelectedCustomRole(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={isCustomRoleDisabled && !isAdminManagingSelf}
                  className={`w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary ${
                    (isCustomRoleDisabled && !isAdminManagingSelf) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">No Custom Role</option>
                  {manageableCustomRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} (Position: {role.position})
                    </option>
                  ))}
                </select>
              )}
              
              {manageableCustomRoles.length === 0 && customRoles.length > 0 && !rolesLoading && !rolesError && (
                <p className="text-xs text-yellow-400 mt-1">
                  No manageable custom roles available
                </p>
              )}
            </div>
          )}

          {/* Role Description */}
          {selectedCustomRole && (showCustomRoleSection || isAdminManagingSelf) && (
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 mb-1">
                Role Permissions
              </h4>
              <p className="text-xs text-slate-400">
                {customRoles
                  .find((r) => r.id === selectedCustomRole)
                  ?.permissions?.join(", ") || "No permissions specified"}
              </p>
              {isAdminManagingSelf && (
                <p className="text-xs text-blue-400 mt-2">
                  These permissions will be in addition to your ADMIN privileges
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}