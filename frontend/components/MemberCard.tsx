import Link from 'next/link';
import { Member, Skill } from '@/lib/types';
import { ChevronRight, Star } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  allSkills?: Skill[];
}

export default function MemberCard({ member, allSkills = [] }: MemberCardProps) {
  return (
    <Link href={`/members/user/${member.id}`}>
      <div className="card-hover cursor-pointer group overflow-hidden h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header with Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <img
              src={member.user.avatarUrl || '/avatar.png'}
              alt={member.fullName}
              className="w-16 h-16 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                {member.fullName || member.user.username}
              </h3>
              
              {/* Role Title */}
              {member.roleTitle && (
                <p className="text-sm text-slate-400 truncate mt-1">{member.roleTitle}</p>
              )}
              
              {/* Roles */}
              {(member.user.customRole || member.user.isLead) && (
                <div className="flex flex-wrap gap-2 mt-2">
                                    {/* Lead Badge */}
                  {member.user.isLead && (
                    <span className="badge-accent text-xs px-2 py-1 flex items-center gap-1 flex-shrink-0">
                      <Star size={12} />
                      Lead
                    </span>
                  )}{/* Custom Role Badge */}
                  {member.user.customRole && (
                    <span 
                      className="badge text-xs px-2 py-1 border flex-shrink-0"
                      style={{ 
                        backgroundColor: `${member.user.customRole.color}20`,
                        borderColor: `${member.user.customRole.color}40`,
                        color: member.user.customRole.color
                      }}
                    >
                      {member.user.customRole.name}
                    </span>
                  )}
                  

                </div>
              )}
            </div>
          </div>

          {/* Content Area - Fixed height with consistent spacing */}
          <div className="flex-1 space-y-4 min-h-[120px]">
            {/* Dev Stack */}
            {member.devStack && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Dev Stack</p>
                <div className="flex flex-wrap gap-2">
                  {member.devStack.split(',').slice(0, 3).map((stack) => (
                    <span
                      key={stack.trim()}
                      className="badge-primary text-xs"
                    >
                      {stack.trim()}
                    </span>
                  ))}
                  {member.devStack.split(',').length > 3 && (
                    <span className="badge text-xs bg-slate-700 text-slate-300">
                      +{member.devStack.split(',').length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {member.skillIds && member.skillIds.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Skills ({member.skillIds.length})</p>
                <div className="flex flex-wrap gap-2">
                  {member.skillIds.slice(0, 3).map((skillId) => {
                    const skill = allSkills.find(s => s.id === skillId);
                    return skill ? (
                    <span
                      key={skill.id}
                      className="badge-secondary text-xs"
                    >
                      {skill.name}
                    </span>
                    ) : null;
                  })}
                  {member.skillIds.length > 3 && (
                    <span className="badge text-xs bg-slate-700 text-slate-300">
                      +{member.skillIds.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bio Preview */}
            {member.bio && (
              <div>
                <p className="text-xs text-slate-400 mb-2">About</p>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            )}

            {/* Empty state to maintain consistent height */}
            {!member.devStack && !member.skillIds?.length && !member.bio && (
              <div className="h-20 flex items-center justify-center">
                <p className="text-slate-500 text-sm text-center">
                  No additional information
                </p>
              </div>
            )}
          </div>

          {/* View Profile Link - Always at bottom */}
          <div className="flex items-center text-primary group-hover:text-secondary transition-colors text-sm font-medium mt-4 pt-4 border-t border-slate-700/50">
            View Profile
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}