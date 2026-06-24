import { CustomRole } from "@/lib/types";
import { Edit2, Trash2, Users, Lock, ArrowUp, ArrowDown } from "lucide-react";

interface RoleCardProps {
  role: CustomRole;
  manageableRoles: number[];
  canReorder: boolean;
  onEdit: (role: CustomRole) => void;
  onDelete: (roleId: number) => void;
  onShowUsers: (roleId: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function RoleCard({
  role,
  manageableRoles,
  canReorder,
  onEdit,
  onDelete,
  onShowUsers,
  onMoveUp,
  onMoveDown,
}: RoleCardProps) {
  const canManage = manageableRoles.includes(role.id);

  return (
    <div className={`
      bg-slate-800 rounded-lg p-4 border transition-all
      ${!canManage ? "opacity-70" : ""}
    `}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Role Color and Basic Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: role.color }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white truncate">
                {role.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="badge text-xs bg-slate-700 text-slate-300">
                  Pos: {role.position}
                </span>
                {!canManage && (
                  <span className="badge text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Locked
                  </span>
                )}
              </div>
            </div>

            {role.description && (
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                {role.description}
              </p>
            )}

            {/* Permissions */}
            <div className="flex flex-wrap gap-1 mb-3 max-h-20 overflow-y-auto">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="badge-secondary text-xs truncate max-w-[120px]"
                  title={permission.replace("_", " ")}
                >
                  {permission.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-1 flex-shrink-0 justify-end">
          {/* Reordering Buttons */}
          {canReorder && canManage && (
            <div className="flex sm:flex-col gap-1">
              {onMoveUp && (
                <button
                  onClick={onMoveUp}
                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={onMoveDown}
                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              )}
            </div>
          )}

          {/* Management Actions */}
          <div className="flex sm:flex-col gap-1">
            {canManage ? (
              <>
                <button
                  onClick={() => onEdit(role)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  title="Edit role"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(role.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  title="Delete role"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => onShowUsers(role.id)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  title="View assigned users"
                >
                  <Users size={16} />
                </button>
              </>
            ) : (
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-600" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Cannot manage this role
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}