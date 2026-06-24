import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import Pagination from "@/components/ui/Pagination";
import { memberApi, skillApi } from "@/lib/api";
import { Member, Project, Skill } from "@/lib/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { 
  Github, 
  Linkedin, 
  ExternalLink, 
  Mail, 
  Search, 
  Filter, 
  X, 
  Crown, 
  Shield, 
  User, 
  Code, 
  Award 
} from "lucide-react";

const PROJECTS_PER_PAGE = 3;

const categories = [
  { value: "", label: "All Categories" },
  { value: "WEB", label: "Web Development" },
  { value: "AI", label: "AI & Machine Learning" },
  { value: "UIUX", label: "UI/UX Design" },
];

export default function MemberProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [member, setMember] = useState<Member | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (!id) return;

    const loadMember = async () => {
      try {
        const [res, skillsRes] = await Promise.all([
          memberApi.getByUserId(Number(id)),
          skillApi.getAll()
        ]);
        
        // Fetch projects for the user
        let projects = [];
        try {
          if (res.data && res.data.userId) {
            const projectsRes = await memberApi.getProjects(res.data.userId);
            projects = projectsRes.data;
          }
        } catch (err) {
          console.error("Error loading user projects:", err);
        }

        setMember({ ...res.data, projects });
        setSkills(skillsRes.data);
      } catch (error) {
        console.error("Error loading member:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  // Filter approved projects based on search and category
  const approvedProjects = member?.projects?.filter(project => project.isApproved) || [];
  
  const filteredProjects = approvedProjects.filter((project) => {
    const matchesSearch = 
      !searchTerm ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = 
      !categoryFilter || 
      project.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || categoryFilter;

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <p className="text-slate-400">Member not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Profile Header */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-8 md:py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center w-full lg:w-auto">
              <div className="relative">
                <img
                  src={member.user.avatarUrl || "/avatar.png"}
                  alt={member.fullName}
                  className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-primary/50 shadow-lg"
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 w-full">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex-1">
                  {/* Name and Title */}
                  <div className="text-center lg:text-left mb-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                      {member.fullName || member.user.username}
                    </h1>
                    
                    {member.roleTitle && (
                      <p className="text-lg md:text-xl text-primary">
                        {member.roleTitle}
                      </p>
                    )}
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                    {/* Community Lead Badge */}
                    {member.user.isLead && (
                      <span className="badge-accent flex items-center gap-1.5 px-3 py-1.5 text-sm">
                        <Crown size={14} />
                        Community Lead
                      </span>
                    )}

                    {/* Custom Role Badge */}
                    {member.user.customRole && (
                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                        style={{
                          backgroundColor: `${member.user.customRole.color}15`,
                          color: member.user.customRole.color,
                          borderColor: `${member.user.customRole.color}30`,
                        }}
                      >
                        <Shield size={14} />
                        {member.user.customRole.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {member.bio && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                    <User size={18} className="text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-300">About</h3>
                  </div>
                  <p className="text-slate-300 text-base md:text-lg text-center lg:text-left leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Skills & Tech Stack Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Dev Stack */}
                {member.devStack && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                      <Code size={16} className="text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-300">Tech Stack</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                      {member.devStack.split(",").map((stack) => (
                        <span
                          key={stack.trim()}
                          className="badge-primary text-xs px-2 py-1"
                        >
                          {stack.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {member.skillIds && member.skillIds.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                      <Award size={16} className="text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-300">Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                      {member.skillIds.map((skillId) => {
                        const skill = skills.find(s => s.id === skillId);
                        return skill ? (
                        <span
                          key={skill.id}
                          className="badge-secondary text-xs px-2 py-1"
                        >
                          {skill.name}
                        </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-slate-700">
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {member.user.githubUrl && (
                    <a
                      href={member.user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2 text-sm px-3 py-2 flex-1 lg:flex-none min-w-[120px] justify-center"
                    >
                      <Github size={16} />
                      GitHub
                    </a>
                  )}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center gap-2 text-sm px-3 py-2 flex-1 lg:flex-none min-w-[120px] justify-center"
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </a>
                  )}
                  {member.portfolioUrl && (
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center gap-2 text-sm px-3 py-2 flex-1 lg:flex-none min-w-[120px] justify-center"
                    >
                      <ExternalLink size={16} />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="container-custom py-12">
        <div className="text-center mb-8">
          <h2 className="section-title mb-2">Projects</h2>
          <p className="section-subtitle">
            Check out {member.fullName || member.user.username}&apos;s amazing projects
          </p>
        </div>

        {/* Search and Filters */}
        {approvedProjects.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
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
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-slate-800">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-outline text-sm w-full sm:w-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-slate-400">
                  Showing {paginatedProjects.length} of {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                  {hasActiveFilters && ' (filtered)'}
                </p>
                {searchTerm && (
                  <p className="text-sm text-slate-500 mt-1">
                    Search results for: "{searchTerm}"
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {approvedProjects.length > 0 ? (
          paginatedProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>

              {/* Pagination */}
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
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={24} />
              </div>
              <p className="text-slate-400 text-lg mb-2">No projects found</p>
              <p className="text-slate-500 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-400 text-lg mb-2">No projects yet</p>
            <p className="text-slate-500 text-sm">
              {member.fullName || member.user.username} hasn&apos;t added any projects yet
            </p>
          </div>
        )}
      </section>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Layout>
  );
}