import { useState, useMemo, useEffect } from "react";
import { FolderOpen, Clock, Filter } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Project } from "@/lib/types";
import ProjectModal from "./ProjectModal";
import RejectionModal from "./RejectionModal";
import PendingProjectCard from "./PendingProjectCard";
import ProjectCard from "./ProjectCard";
import ProjectsHeader from "./ProjectsHeader";
import Pagination from "../../ui/Pagination";

interface ProjectsTabProps {
  pendingProjects: Project[];
  allProjects: Project[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

type ProjectFilter = 'all' | 'approved' | 'rejected';

export default function ProjectsTab({
  pendingProjects,
  allProjects,
  onDataChange,
  onError,
  onSuccess,
}: ProjectsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToReject, setProjectToReject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('approved');
  const [isRejecting, setIsRejecting] = useState(false);
  
  const projectsPerPage = 6;
  const pendingPerPage = 3;

  // Filter approved projects based on search and filter
  const filteredProjects = useMemo(() => {
    let filtered = allProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.member?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.member?.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (projectFilter === 'approved') {
      filtered = filtered.filter(project => project.isApproved);
    } else if (projectFilter === 'rejected') {
      filtered = filtered.filter(project => !project.isApproved && project.rejectionReason);
    }
    // 'all' shows both approved and rejected (but not pending)

    return filtered;
  }, [allProjects, searchQuery, projectFilter]);

  // Filter pending projects (only non-rejected pending projects)
  const filteredPendingProjects = useMemo(() => 
    pendingProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        project.member?.fullName?.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        project.member?.user?.username?.toLowerCase().includes(pendingSearchQuery.toLowerCase())
    ).filter(project => !project.rejectionReason), // Exclude rejected projects from pending view
  [pendingProjects, pendingSearchQuery]
  );

  // Paginate approved projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    return filteredProjects.slice(startIndex, startIndex + projectsPerPage);
  }, [filteredProjects, currentPage]);

  // Paginate pending projects
  const paginatedPendingProjects = useMemo(() => {
    const startIndex = (pendingCurrentPage - 1) * pendingPerPage;
    return filteredPendingProjects.slice(startIndex, startIndex + pendingPerPage);
  }, [filteredPendingProjects, pendingCurrentPage]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const pendingTotalPages = Math.ceil(filteredPendingProjects.length / pendingPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, projectFilter]);

  useEffect(() => {
    setPendingCurrentPage(1);
  }, [pendingSearchQuery]);

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeProjectModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Open rejection modal
  const openRejectionModal = (project: Project) => {
    setProjectToReject(project);
    setShowRejectionModal(true);
  };

  // Close rejection modal
  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setProjectToReject(null);
  };

  const handleApiCall = async (
    apiCall: () => Promise<any>,
    successMessage: string
  ) => {
    try {
      await apiCall();
      onSuccess(successMessage);
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || "Operation failed");
    }
  };

  const approveProject = (projectId: number) =>
    handleApiCall(
      () => adminApi.approveProject(projectId, { isApproved: true }),
      "Project approved successfully!"
    );

  // NEW: Enhanced reject project with reason
  const rejectProject = async (projectId: number, reason: string) => {
    setIsRejecting(true);
    try {
      await adminApi.approveProject(projectId, { 
        isApproved: false,
        reason: reason 
      });
      onSuccess("Project rejected successfully!");
      onDataChange();
      closeRejectionModal();
    } catch (error: any) {
      onError(error.response?.data?.error || "Failed to reject project");
    } finally {
      setIsRejecting(false);
    }
  };

  const deleteProject = (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    handleApiCall(() => adminApi.deleteProject(projectId), "Project deleted successfully!");
  };

  // Filter stats
  const getFilterStats = () => {
    const approvedCount = allProjects.filter(p => p.isApproved).length;
    const rejectedCount = allProjects.filter(p => !p.isApproved && p.rejectionReason).length;
    const pendingCount = pendingProjects.filter(p => !p.rejectionReason).length;

    return { approvedCount, rejectedCount, pendingCount };
  };

  const { approvedCount, rejectedCount, pendingCount } = getFilterStats();

  return (
    <div className="space-y-6">
      {/* Pending Projects */}
      {pendingCount > 0 && (
        <div className="card p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-transparent">
          <ProjectsHeader
            title="Pending Projects"
            count={pendingCount}
            searchQuery={pendingSearchQuery}
            onSearchChange={setPendingSearchQuery}
            icon={<Clock className="w-6 h-6 text-orange-400" />}
          />

          <div className="space-y-6">
            {filteredPendingProjects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedPendingProjects.map((project) => (
                    <PendingProjectCard
                      key={project.id}
                      project={project}
                      onApprove={approveProject}
                      onReject={() => openRejectionModal(project)} // Updated to use modal
                      onClick={openProjectModal}
                    />
                  ))}
                </div>

                {pendingTotalPages > 1 && (
                  <Pagination
                    currentPage={pendingCurrentPage}
                    totalPages={pendingTotalPages}
                    onPageChange={setPendingCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No pending projects found</p>
                <p className="text-slate-500 text-sm mt-2">
                  {pendingSearchQuery
                    ? "Try a different search term"
                    : "No pending projects available"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Projects with Filter */}
      <div className="card p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FolderOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">All Projects</h2>
              <p className="text-slate-400 text-sm">
                {filteredProjects.length} projects • {approvedCount} approved • {rejectedCount} rejected
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setProjectFilter('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  projectFilter === 'approved'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setProjectFilter('rejected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  projectFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  projectFilter === 'all'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                All
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-3 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={deleteProject}
                    onClick={openProjectModal}
                    showRejectionReason={projectFilter === 'rejected'}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No projects found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchQuery || projectFilter !== 'approved'
                  ? "Try a different search term or filter"
                  : "No projects available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={showModal}
          onClose={closeProjectModal}
          onApprove={approveProject}
          onReject={() => openRejectionModal(selectedProject)} // Updated to use modal
        />
      )}

      {/* Rejection Modal */}
      {projectToReject && (
        <RejectionModal
          project={projectToReject}
          isOpen={showRejectionModal}
          onClose={closeRejectionModal}
          onReject={rejectProject}
          isSubmitting={isRejecting}
        />
      )}
    </div>
  );
}