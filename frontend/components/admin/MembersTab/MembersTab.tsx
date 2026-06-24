import { useState } from "react";
import { Users, Clock } from "lucide-react";
import MembersList from "./MembersList";
import PendingMembersSection from "./PendingMembersSection";
import { User } from "@/lib/types";

interface MembersTabProps {
  pendingMembers: User[];
  allUsers: User[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUserId: number;
  currentUser: User;
}

export default function MembersTab({
  pendingMembers,
  allUsers,
  onDataChange,
  onError,
  onSuccess,
  currentUserId,
  currentUser,
}: MembersTabProps) {
  const [activeView, setActiveView] = useState<"all" | "pending">("all");

  return (
    <div className="space-y-6">
      {/* View Toggle - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-800 rounded-lg w-full sm:w-fit">
        <button
          onClick={() => setActiveView("all")}
          className={`flex items-center justify-center sm:justify-start px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-all ${
            activeView === "all"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          All Members ({allUsers.length})
        </button>
        {pendingMembers.length > 0 && (
          <button
            onClick={() => setActiveView("pending")}
            className={`flex items-center justify-center sm:justify-start px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "pending"
                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingMembers.length})
          </button>
        )}
      </div>

      {/* Content */}
      {activeView === "pending" ? (
        <PendingMembersSection
          pendingMembers={pendingMembers}
          onDataChange={onDataChange}
          onError={onError}
          onSuccess={onSuccess}
          currentUserId={currentUserId}
          currentUser={currentUser}
        />
      ) : (
        <MembersList
          users={allUsers}
          onDataChange={onDataChange}
          onError={onError}
          onSuccess={onSuccess}
          currentUser={currentUser}
          showFilters={true}
        />
      )}
    </div>
  );
}