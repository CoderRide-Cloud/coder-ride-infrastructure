import { useState } from 'react';
import Layout from '@/components/Layout';
import { ChevronDown, ChevronUp, Shield, FileText, Github, Database, Users, Clock, AlertTriangle } from 'lucide-react';

export default function TermsAndPrivacy() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    privacy: true,
    dataCollection: false,
    thirdParty: false,
    dataUsage: false,
    tos: false,
    userResponsibilities: false,
    projectGuidelines: false,
    accountTermination: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Layout>
      <div className="container-custom py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-slate-300 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Privacy Policy Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
          </div>

          {/* GitHub OAuth Data Collection */}
          <div className="card p-0 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('privacy')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">GitHub OAuth Data Collection</h3>
              </div>
              {openSections.privacy ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.privacy && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <p className="text-slate-300">
                    When you sign up for Coder Ride using GitHub OAuth, we collect the following information from your GitHub profile:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Basic Profile Information</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• GitHub Username</li>
                        <li>• GitHub ID</li>
                        <li>• Email Address</li>
                        <li>• Avatar URL</li>
                        <li>• GitHub Profile URL</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Optional Information</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• Full Name (if public)</li>
                        <li>• Bio/Description</li>
                        <li>• Location (if public)</li>
                        <li>• Company (if public)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm">
                    <strong>Note:</strong> We never access your private repositories, GitHub passwords, or any sensitive information beyond your public profile data.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Data Storage & Security */}
          <div className="card p-0 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('dataCollection')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Data Storage & Security</h3>
              </div>
              {openSections.dataCollection ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.dataCollection && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-3">How We Store Your Data</h4>
                    <ul className="text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>All data is stored in secure databases with encryption at rest</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>We use industry-standard security practices to protect your information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Regular security audits and monitoring are performed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Data is only accessible to authorized Coder Ride administrators</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Third-Party Services */}
          <div className="card p-0 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('thirdParty')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Third-Party Services</h3>
              </div>
              {openSections.thirdParty ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.thirdParty && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">GitHub OAuth</h4>
                      <p className="text-slate-300 text-sm">
                        We use GitHub OAuth for authentication. GitHub's privacy policy applies to the data they collect during the OAuth process.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">Hosting & Infrastructure</h4>
                      <p className="text-slate-300 text-sm">
                        Our application is hosted on secure cloud infrastructure. These providers have their own privacy policies and security measures.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm">
                    <strong>Important:</strong> We do not sell, trade, or otherwise transfer your personal information to outside parties except for trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Data Usage */}
          <div className="card p-0 overflow-hidden">
            <button
              onClick={() => toggleSection('dataUsage')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">How We Use Your Data</h3>
              </div>
              {openSections.dataUsage ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.dataUsage && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-3">For Coder Ride Operations</h4>
                      <ul className="text-slate-300 text-sm space-y-2">
                        <li>• Create and manage your account</li>
                        <li>• Display your profile to other members</li>
                        <li>• Facilitate collaboration on projects</li>
                        <li>• Send important community updates</li>
                        <li>• Provide technical support</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-3">Community Features</h4>
                      <ul className="text-slate-300 text-sm space-y-2">
                        <li>• Showcase your projects and skills</li>
                        <li>• Connect with other developers</li>
                        <li>• Participate in community events</li>
                        <li>• Track learning progress</li>
                        <li>• Build your developer portfolio</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Limited Use</h4>
                    <p className="text-slate-300 text-sm">
                      Your data is used exclusively for Coder Ride community operations. We do not use your information for marketing purposes outside of Coder Ride, and we never share your data with third parties for advertising.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terms of Service Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-secondary" />
            <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
          </div>

          {/* User Responsibilities */}
          <div className="card p-0 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('tos')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Acceptance of Terms</h3>
              </div>
              {openSections.tos ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.tos && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <p className="text-slate-300">
                    By signing up for Coder Ride, you agree to participate in our community activities, which include:
                  </p>
                  
                  <div className="grid gap-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-2">Regular Participation</h4>
                      <p className="text-slate-300 text-sm">
                        Active involvement in community projects, coding challenges, and learning activities.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-2">Skill Development</h4>
                      <p className="text-slate-300 text-sm">
                        Commitment to learning new technologies and improving your programming skills through our structured learning paths.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-2">Collaboration</h4>
                      <p className="text-slate-300 text-sm">
                        Working together with other community members on projects and providing constructive feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Guidelines */}
          <div className="card p-0 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('projectGuidelines')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Project Guidelines & Deadlines</h3>
              </div>
              {openSections.projectGuidelines ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.projectGuidelines && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-3">Project Commitments</h4>
                    <ul className="text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>When you commit to a project, you're expected to meet agreed-upon deadlines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>Regular progress updates are required for ongoing projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>Communication with team members is essential for project success</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>Extensions may be granted with valid reasons and prior communication</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Consequences of Missed Deadlines
                    </h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• First offense: Warning and project reassignment</li>
                      <li>• Repeated offenses: Temporary suspension from project participation</li>
                      <li>• Chronic issues: Review of community membership</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Termination */}
          <div className="card p-0 overflow-hidden">
            <button
              onClick={() => toggleSection('accountTermination')}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Account Termination & Inactivity</h3>
              </div>
              {openSections.accountTermination ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {openSections.accountTermination && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-3">Inactivity Policy</h4>
                      <ul className="text-slate-300 text-sm space-y-2">
                        <li>• 30 days inactive: Warning notification</li>
                        <li>• 60 days inactive: Account suspension</li>
                        <li>• 90 days inactive: Account termination review</li>
                        <li>• Activity includes: Logins, project updates, community participation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-secondary mb-3">Termination Reasons</h4>
                      <ul className="text-slate-300 text-sm space-y-2">
                        <li>• Violation of community guidelines</li>
                        <li>• Repeated missed project deadlines</li>
                        <li>• Harassment or unprofessional behavior</li>
                        <li>• Extended inactivity without notice</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Appeal Process</h4>
                    <p className="text-slate-300 text-sm">
                      If your account is suspended or terminated, you may appeal the decision by contacting the Coder Ride administration team. We believe in second chances and will review each case individually.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Questions or Concerns?</h3>
            <p className="text-slate-300">
              If you have any questions about these Terms of Service or Privacy Policy, please contact us at{' '}
              <a href="mailto:admin@Coder Ride.com" className="text-primary hover:underline">
                admin@Coder Ride.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}