import { User } from "@/lib/types";
import { X, User as UserIcon, ExternalLink } from "lucide-react";

interface RoleUsersModalProps {
  isOpen: boolean;
  roleName: string;
  users: User[];
  onClose: () => void;
}

export default function RoleUsersModal({
  isOpen,
  roleName,
  users,
  onClose,
}: RoleUsersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Role Members
              </h3>
              <p className="text-slate-400 text-sm">{roleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users assigned to this role</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <img
                    src={user.avatarUrl || "/avatar.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {user.username}
                    </h4>
                    {user.member?.fullName && (
                      <p className="text-slate-400 text-sm truncate">
                        {user.member.fullName}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/members/user/${user.id}`}
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-600 rounded-lg transition-colors"
                    title="View profile"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            {users.length} user(s) assigned to this role
          </p>
        </div>
      </div>
    </div>
  );
}