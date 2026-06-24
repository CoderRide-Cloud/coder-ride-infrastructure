import React, { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { Github, ExternalLink, Pencil, Trash2, Save, X, CheckCircle, Clock, XCircle, Image as ImageIcon } from "lucide-react";
import { projectApi, tagApi } from "@/lib/api";

interface ProfileProjectCardProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onDelete: (projectId: number) => void;
  isOwnProfile: boolean;
}

export default function ProfileProjectCard({
  project,
  onUpdate,
  onDelete,
  isOwnProfile,
}: ProfileProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || "",
    category: project.category || "",
    imageUrl: project.imageUrl || "",
    tags: project.tags?.map(t => t.name) || [],
  });
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

  const handleSave = async () => {
    if (!validateTags(formData.tags)) return;
    
    setSaving(true);
    try {
      const res = await projectApi.update(project.id, formData);
      onUpdate(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: project.title,
      description: project.description || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      category: project.category || "",
      imageUrl: project.imageUrl || "",
      tags: project.tags?.map(t => t.name) || [],
    });
    setTagError(null);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await projectApi.delete(project.id);
      onDelete(project.id);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const newTags = [...formData.tags, tag.trim()];
    setFormData(prev => ({ ...prev, tags: newTags }));
    validateTags(newTags);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
    validateTags(newTags);
  };

  const filteredTags = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.tags.includes(tag)
  );

  // Edit Modal
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div 
          className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Edit Project</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Project Image Preview */}
            {formData.imageUrl && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Current Image
                </label>
                <div className="relative rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                  <img
                    src={formData.imageUrl}
                    alt="Project preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}

            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Project title *"
            />

            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Project description"
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
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
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
                {formData.tags.map((tag, index) => (
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
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="GitHub URL"
              />

              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Live Demo URL"
              />
            </div>

            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select category</option>
              <option value="WEB">Web Development</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="UIUX">UI/UX Design</option>
            </select>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !formData.title.trim() || !!tagError}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>

              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project Card Display
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-primary/50 transition-all duration-300 group">
      {/* Project Image */}
      {project.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-slate-700 aspect-video">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.category && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded-full border border-primary/30">
              {project.category}
            </span>
          )}
        </div>

        {isOwnProfile && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-700 rounded-lg transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Edit project"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDeleting
                  ? "bg-red-600 text-white"
                  : "text-slate-400 hover:text-red-400 hover:bg-slate-700"
              }`}
              aria-label={isDeleting ? "Confirm delete" : "Delete project"}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm mb-2">
            Are you sure you want to delete this project?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium min-h-[44px]"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="flex-1 bg-slate-700 text-slate-300 py-2 px-3 rounded text-sm font-medium min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 4).map((projectTag) => (
            <span
              key={projectTag.id}
              className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-full"
            >
              {projectTag.name}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded-full">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-2">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors flex-1 justify-center touch-manipulation min-h-[44px]"
          >
            <Github size={16} />
            <span className="hidden xs:inline">Code</span>
          </a>
        )}

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition-colors flex-1 justify-center touch-manipulation min-h-[44px] border border-primary/30"
          >
            <ExternalLink size={16} />
            <span className="hidden xs:inline">Demo</span>
          </a>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        {!project.isApproved && !project.isRejected && (
          <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
            <Clock size={12} className="mr-1" />
            Pending Approval
          </span>
        )}

        {project.isRejected && (
          <span className="inline-flex items-center px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        )}

        {project.isApproved && (
          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        )}
      </div>
    </div>
  );
}