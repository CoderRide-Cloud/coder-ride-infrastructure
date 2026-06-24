import { useState } from 'react';
import { Trash2, Plus, Award } from 'lucide-react';
import { skillApi } from '@/lib/api';
import { Skill } from '@/lib/types';

interface SkillsTabProps {
  skills: Skill[];
  onDataChange: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function SkillsTab({ skills, onDataChange, onError, onSuccess }: SkillsTabProps) {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  const createSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillApi.create(newSkill);
      setNewSkill({ name: '', category: '' });
      setShowSkillForm(false);
      onSuccess('Skill created');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to create skill');
    }
  };

  const deleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillApi.delete(skillId);
      onSuccess('Skill deleted');
      onDataChange();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to delete skill');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Create Skill */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Skills Management</h2>
              <p className="text-slate-400 text-xs md:text-sm">Manage available skills for members</p>
            </div>
          </div>
          <button
            onClick={() => setShowSkillForm(!showSkillForm)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all duration-300 text-sm md:text-base w-full sm:w-auto justify-center ${
              showSkillForm
                ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/30'
            }`}
          >
            <Plus
              size={18}
              className={showSkillForm ? 'rotate-45 transition-transform duration-300' : ''}
            />
            {showSkillForm ? 'Cancel' : 'New Skill'}
          </button>
        </div>

        {showSkillForm && (
          <form onSubmit={createSkill} className="space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  required
                  placeholder="e.g. React, Python, UI/UX Design"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  placeholder="e.g. Frontend, Backend, Design"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Create Skill
            </button>
          </form>
        )}
      </div>

      {/* Skills Grid */}
      <div className="card p-4 md:p-6 border border-slate-700/50">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
          All Skills ({skills.length})
        </h3>
        {skills.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm md:text-base">No skills yet. Add your first skill!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-slate-800/50 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm md:text-base group-hover:text-primary transition-colors truncate">
                      {skill.name}
                    </p>
                    {skill.category && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{skill.category}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteSkill(skill.id)}
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