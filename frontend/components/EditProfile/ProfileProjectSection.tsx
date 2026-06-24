import React, { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import ProfileProjectCard from "./ProfileProjectCard";
import Pagination from "../ui/Pagination";
import {
  Search,
  Plus,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  List,
  Image as ImageIcon,
} from "lucide-react";
import { projectApi, tagApi } from "@/lib/api";

interface ProfileProjectsSectionProps {
  projects: Project[];
  isOwnProfile: boolean;
  onProjectsUpdate: (updatedProjects: Project[]) => void;
  memberName: string;
}

const ITEMS_PER_PAGE = 6; // Increased for better mobile layout

// Status filter options
const STATUS_FILTERS = [
  { value: "ALL", label: "All", icon: List, color: "text-slate-400" },
  {
    value: "APPROVED",
    label: "Approved",
    icon: CheckCircle,
    color: "text-green-400",
  },
  { value: "PENDING", label: "Pending", icon: Clock, color: "text-yellow-400" },
  {
    value: "REJECTED",
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
  },
];

export default function ProfileProjectsSection({
  projects,
  isOwnProfile,
  onProjectsUpdate,
  memberName,
}: ProfileProjectsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "APPROVED" | "PENDING" | "REJECTED"
  >("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    githubUrl: "",
    liveUrl: "",
    category: "",
    imageUrl: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);

  // Load all available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await tagApi.getAll();
        const tagNames = res.data.map((tag: any) => tag.name);
        setAllTags(tagNames);
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    };
    loadTags();
  }, []);

  // Filter projects based on search, category, and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      !categoryFilter || project.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPROVED" && project.isApproved) ||
      (statusFilter === "PENDING" &&
        !project.isApproved &&
        !project.isRejected) ||
      (statusFilter === "REJECTED" && project.isRejected);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get counts for each status
  const statusCounts = {
    ALL: projects.length,
    APPROVED: projects.filter((p) => p.isApproved).length,
    PENDING: projects.filter((p) => !p.isApproved && !p.isRejected).length,
    REJECTED: projects.filter((p) => p.isRejected).length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const validateTags = (tags: string[]): boolean => {
    const invalidTags = tags.filter(
      (tag) => !allTags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );

    if (invalidTags.length > 0) {
      setTagError(`Invalid tags: ${invalidTags.join(", ")}. Please use existing tags.`);
      return false;
    }
    setTagError(null);
    return true;
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updatedProjects = projects.map((p) =>
      p.id === updatedProject.id ? updatedProject : p
    );
    onProjectsUpdate(updatedProjects);
    setSuccess("Project updated successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteProject = (projectId: number) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    onProjectsUpdate(updatedProjects);
    setSuccess("Project deleted successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      setError("Project title is required");
      return;
    }

    if (!validateTags(newProject.tags)) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await projectApi.create({
        title: newProject.title,
        description: newProject.description || undefined,
        githubUrl: newProject.githubUrl || undefined,
        liveUrl: newProject.liveUrl || undefined,
        category: newProject.category || undefined,
        imageUrl: newProject.imageUrl || undefined,
        tags: newProject.tags,
      });

      onProjectsUpdate([res.data, ...projects]);
      setShowAddModal(false);
      setNewProject({
        title: "",
        description: "",
        githubUrl: "",
        liveUrl: "",
        category: "",
        imageUrl: "",
        tags: [],
      });
      setTagError(null);
      setSuccess("Project created successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const newTags = [...newProject.tags, tag.trim()];
    setNewProject(prev => ({ ...prev, tags: newTags }));
    validateTags(newTags);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = newProject.tags.filter((tag) => tag !== tagToRemove);
    setNewProject(prev => ({ ...prev, tags: newTags }));
    validateTags(newTags);
  };

  const resetNewProject = () => {
    setNewProject({
      title: "",
      description: "",
      githubUrl: "",
      liveUrl: "",
      category: "",
      imageUrl: "",
      tags: [],
    });
    setTagError(null);
    setError(null);
  };

  const categories = ["WEB", "AI", "UIUX"];
  const filteredTags = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !newProject.tags.includes(tag)
  );

  const hasActiveFilters = searchTerm || categoryFilter || statusFilter !== "ALL";

  return (
    <section className="container-custom py-8 md:py-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Projects
          </h2>
          <p className="text-slate-400">
            {isOwnProfile
              ? "Manage your projects"
              : `Check out ${memberName}'s amazing work`}
          </p>
        </div>

        {isOwnProfile && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 justify-center lg:justify-start touch-manipulation min-h-[44px] w-full lg:w-auto"
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-r text-red-300 flex items-start gap-3">
          <X className="flex-shrink-0 mt-0.5" size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border-l-4 border-green-500 rounded-r text-green-300">
          <p>{success}</p>
        </div>
      )}

      {/* Search and Filter Section */}
      {(projects.length > 0 || hasActiveFilters) && (
        <div className="space-y-4 mb-6">
          {/* Status Filter Tabs - Mobile optimized */}
          {isOwnProfile && (
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {STATUS_FILTERS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all min-h-[44px] ${
                    statusFilter === value
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-slate-600 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Icon size={16} className={color} />
                  <span className="text-sm">{label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === value ? "bg-primary/30" : "bg-slate-600"
                    }`}
                  >
                    {statusCounts[value as keyof typeof statusCounts]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search and Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="relative sm:w-48">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredProjects.length > 0 && (
        <div className="mb-4 text-slate-400 text-sm">
          Showing {Math.min(ITEMS_PER_PAGE, paginatedProjects.length)} of {filteredProjects.length} projects
          {hasActiveFilters && " (filtered)"}
        </div>
      )}

      {/* Projects Grid */}
      {paginatedProjects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {paginatedProjects.map((project) => (
              <ProfileProjectCard
                key={project.id}
                project={project}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
                isOwnProfile={isOwnProfile}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-400 text-lg mb-2">
            {projects.length === 0 ? "No projects yet" : "No projects found"}
          </p>
          <p className="text-slate-500 text-sm">
            {projects.length === 0 && isOwnProfile
              ? "Start by adding your first project!"
              : "Try adjusting your search or filters"}
          </p>
          {projects.length === 0 && isOwnProfile && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 flex items-center gap-2 mx-auto min-h-[44px]"
            >
              <Plus size={18} />
              Add Your First Project
            </button>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add New Project</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewProject();
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Project title *"
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />

              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description"
                rows={3}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              {/* Image URL Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Project Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="url"
                    value={newProject.imageUrl}
                    onChange={(e) => setNewProject(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/20 text-primary rounded-full border border-primary/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary/70"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags..."
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {tagInput && filteredTags.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                      {filteredTags.slice(0, 5).map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="w-full px-3 py-2 text-left text-white hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {tagError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <XCircle size={14} />
                    {tagError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="GitHub URL"
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                <input
                  type="url"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="Live Demo URL"
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <select
                value={newProject.category}
                onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating || !newProject.title.trim() || !!tagError}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Create Project
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewProject();
                  }}
                  className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}