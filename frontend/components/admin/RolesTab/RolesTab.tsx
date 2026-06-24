import { useState, useEffect } from "react";
import { CustomRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import { Plus, Users, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import RoleCard from "./RoleCard";
import RoleForm from "./RoleForm";
import RoleUsersModal from "./RoleUsersModal";

interface RolesTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDataChange: () => Promise<void>;
}

interface RolesResponse {
  roles: CustomRole[];
  manageableRoles: number[];
  canReorder: boolean;
}

export default function RolesTab({
  onSuccess,
  onError,
  onDataChange,
}: RolesTabProps) {
  const [rolesData, setRolesData] = useState<RolesResponse>({
    roles: [],
    manageableRoles: [],
    canReorder: false,
  });
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleUsers, setRoleUsers] = useState<{ [key: number]: any[] }>({});
  const [usersModal, setUsersModal] = useState<{
    isOpen: boolean;
    roleName: string;
    users: any[];
  }>({ isOpen: false, roleName: "", users: [] });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCustomRoles();
      
      // Sort roles by position ascending, then by ID for stability
      const sortedRoles = [...res.data.roles].sort((a, b) => {
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        if (posA !== posB) return posA - posB;
        return a.id - b.id;
      });

      // Ensure every role has a distinct, well-spaced position locally
      sortedRoles.forEach((role, idx) => {
        role.position = (idx + 1) * 10;
      });

      setRolesData({ ...res.data, roles: sortedRoles });
    } catch (error) {
      onError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const loadRoleUsers = async (roleId: number) => {
    try {
      const role = rolesData.roles.find(r => r.id === roleId);
      if (!role) return;

      const res = await adminApi.getRoleUsers(roleId);
      const users = res.data;
      
      setRoleUsers((prev) => ({ ...prev, [roleId]: users }));
      setUsersModal({
        isOpen: true,
        roleName: role.name,
        users: users,
      });
    } catch (error) {
      onError("Failed to load role users");
    }
  };

  const handleSaveRole = async (roleData: any) => {
    try {
      if (isCreating) {
        await adminApi.createCustomRole(roleData);
      } else {
        await adminApi.updateCustomRole(editingRole!.id, roleData);
      }

      await loadRoles();
      setEditingRole(null);
      setIsCreating(false);
      onSuccess(
        isCreating ? "Role created successfully" : "Role updated successfully"
      );
      await onDataChange();
    } catch (error: any) {
      onError(
        error.response?.data?.error ||
          `Failed to ${isCreating ? "create" : "update"} role`
      );
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;

    try {
      await adminApi.deleteCustomRole(roleId);
      await loadRoles();
      onSuccess("Role deleted successfully");
      await onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to delete role");
    }
  };

  // Improved role reordering - uses swap approach
  const handleMoveRole = async (roleId: number, direction: 'up' | 'down') => {
    try {
      const currentIndex = rolesData.roles.findIndex(r => r.id === roleId);
      let targetIndex: number;

      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < rolesData.roles.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return; // Cannot move further
      }

      const currentRole = rolesData.roles[currentIndex];
      const targetRole = rolesData.roles[targetIndex];

      // Check if user can manage both roles
      const canManageCurrent = rolesData.manageableRoles.includes(currentRole.id);
      const canManageTarget = rolesData.manageableRoles.includes(targetRole.id);

      if (!canManageCurrent || !canManageTarget) {
        onError("Cannot reorder roles you don't have permission to manage");
        return;
      }

      // Swap positions - update both roles
      await adminApi.updateRolePosition(currentRole.id, { newPosition: targetRole.position });
      await adminApi.updateRolePosition(targetRole.id, { newPosition: currentRole.position });

      await loadRoles();
      onSuccess(`Role position updated`);
      await onDataChange();
    } catch (error: any) {
      console.error('Error moving role:', error);
      onError(error.response?.data?.error || "Failed to update role position");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Made more mobile friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">Custom Roles</h2>
          <p className="text-slate-400 text-sm mt-1 truncate">
            Manage role permissions and hierarchy
            {!rolesData.canReorder && " • Reordering disabled"}
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-4 text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="truncate">New Role</span>
        </button>
      </div>

      {/* Info Banner - Only show if completely disabled */}
      {!rolesData.canReorder && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-yellow-400 text-sm font-medium truncate">
                Role Reordering Disabled
              </p>
              <p className="text-yellow-500/80 text-sm mt-1">
                You need higher permissions to reorder roles. Higher roles can manage lower roles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Form - Mobile optimized with auto-scroll */}
      {(isCreating || editingRole) && (
        <div id="role-form-section">
          <RoleForm
            role={editingRole}
            onSave={handleSaveRole}
            onCancel={() => {
              setEditingRole(null);
              setIsCreating(false);
              // Optional: scroll back to top after cancel
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Roles List - Mobile optimized */}
      <div className="space-y-3 sm:space-y-4">
        {rolesData.roles.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              No Custom Roles
            </h3>
            <p className="text-slate-500 mb-4 px-4">
              Create your first custom role to get started
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary"
            >
              Create First Role
            </button>
          </div>
        ) : (
          rolesData.roles.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              manageableRoles={rolesData.manageableRoles}
              canReorder={rolesData.canReorder}
              onEdit={(roleToEdit) => {
                setEditingRole(roleToEdit);
                setIsCreating(false);
                // Scroll to form smoothly on mobile
                setTimeout(() => {
                  const formSection = document.getElementById('role-form-section');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              }}
              onDelete={handleDeleteRole}
              onShowUsers={loadRoleUsers}
              onMoveUp={index > 0 ? () => handleMoveRole(role.id, 'up') : undefined}
              onMoveDown={index < rolesData.roles.length - 1 ? () => handleMoveRole(role.id, 'down') : undefined}
            />
          ))
        )}
      </div>

      {/* Users Modal */}
      <RoleUsersModal
        isOpen={usersModal.isOpen}
        roleName={usersModal.roleName}
        users={usersModal.users}
        onClose={() => setUsersModal({ isOpen: false, roleName: "", users: [] })}
      />
    </div>
  );
}