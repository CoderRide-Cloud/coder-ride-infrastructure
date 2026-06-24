import { useState } from 'react';
import { Trash2, Plus, Tags } from 'lucide-react';
import { tagApi } from '@/lib/api';

interface TagsTabProps {
  tags: any[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function TagsTab({ tags, onDataChange, onError, onSuccess }: TagsTabProps) {
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTag, setNewTag] = useState({ name: '' });

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tagApi.create(newTag);
      setNewTag({ name: '' });
      setShowTagForm(false);
      onSuccess('Tag created');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to create tag');
    }
  };

  const deleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await tagApi.delete(tagId);
      onSuccess('Tag deleted');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to delete tag');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Create Tag */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Tags className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Tags Management</h2>
              <p className="text-slate-400 text-xs md:text-sm">Organize content with tags</p>
            </div>
          </div>
          <button
            onClick={() => setShowTagForm(!showTagForm)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all duration-300 text-sm md:text-base w-full sm:w-auto justify-center ${
              showTagForm
                ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/30'
            }`}
          >
            <Plus
              size={18}
              className={showTagForm ? 'rotate-45 transition-transform duration-300' : ''}
            />
            {showTagForm ? 'Cancel' : 'New Tag'}
          </button>
        </div>

        {showTagForm && (
          <form onSubmit={createTag} className="space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tag Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                required
                placeholder="e.g. Machine Learning, Open Source"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Create Tag
            </button>
          </form>
        )}
      </div>

      {/* Tags Grid */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
          All Tags ({tags.length})
        </h3>
        {tags.length === 0 ? (
          <div className="text-center py-12">
            <Tags className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm md:text-base">No tags yet. Create your first tag!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-slate-800/50 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white text-sm md:text-base group-hover:text-primary transition-colors truncate flex-1">
                    #{tag.name}
                  </p>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}