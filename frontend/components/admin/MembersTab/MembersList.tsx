import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Users } from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { adminApi } from "@/lib/api";
import MemberCard from "./MemberCard";
import Pagination from "@/components/ui/Pagination";

interface MembersListProps {
  users: User[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  currentUser: User;
  showFilters?: boolean;
  onViewMember?: (member: User) => void;
}

const ITEMS_PER_PAGE = 6;

export default function MembersList({
  users,
  onDataChange,
  onError,
  onSuccess,
  currentUser,
  showFilters = true,
  onViewMember,
}: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [customRoleFilter, setCustomRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [loadingCustomRoles, setLoadingCustomRoles] = useState(false);

  useEffect(() => {
    const loadCustomRoles = async () => {
      try {
        setLoadingCustomRoles(true);
        const response = await adminApi.getCustomRoles();
        const responseData = response.data;

        let rolesData = [];

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
        onError("Failed to load custom roles");
        setCustomRoles([]);
      } finally {
        setLoadingCustomRoles(false);
      }
    };

    loadCustomRoles();
  }, [onError]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    return users.filter((user) => {
      if (!user || !user.id) return false;

      const matchesSearch =
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.member?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesCustomRole =
        customRoleFilter === "all" ||
        (customRoleFilter === "none" && !user.customRole) ||
        (user.customRole && user.customRole.id.toString() === customRoleFilter);

      return matchesSearch && matchesRole && matchesCustomRole;
    });
  }, [users, searchQuery, roleFilter, customRoleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="card p-6 border border-slate-700/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {showFilters ? "All Members" : "Members"}
            </h2>
            <p className="text-slate-400 text-sm">
              {filteredUsers.length} of {users?.length || 0} members
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All Main Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <select
            value={customRoleFilter}
            onChange={(e) => {
              setCustomRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            disabled={loadingCustomRoles}
          >
            <option value="all">All Custom Roles</option>
            <option value="none">No Custom Role</option>
            {loadingCustomRoles ? (
              <option disabled>Loading custom roles...</option>
            ) : (
              Array.isArray(customRoles) &&
              customRoles.map((role) => (
                <option key={role.id} value={role.id.toString()}>
                  {role.name}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* Members Grid */}
      <div className="space-y-3">
        {paginatedUsers
          .filter((user) => user && user.id)
          .map((user) => {
            return (
              <MemberCard
                key={user.id}
                user={user}
                onDataChange={onDataChange}
                onError={onError}
                onSuccess={onSuccess}
                currentUser={currentUser}
                onViewMember={onViewMember}
              />
            );
          })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No members found
          </h3>
          <p className="text-slate-500 text-sm">
            {searchQuery || roleFilter !== "all" || customRoleFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No members in the system"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
