'use client';

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, LogOut, LogIn, User } from "lucide-react";
import { useState } from "react";
import { Permission } from "../lib/types";

interface NavbarProps {
  navbarStyle: string;
}

export default function Navbar({ navbarStyle }: NavbarProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user has admin role OR dashboard permission
  const hasAdminAccess = () => {
    if (!session?.user) return false;
    
    const user = session.user as any;
    
    // If user has ADMIN role
    if (user.role === "ADMIN") return true;
    
    // If user has a custom role with dashboard permission
    if (user.customRole?.permissions?.includes(Permission.VIEW_DASHBOARD)) {
      return true;
    }
    
    return false;
  };

  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/" });
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const canAccessAdmin = hasAdminAccess();

  return (
    <nav className={`bg-slate-900/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 ${navbarStyle}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex-shrink-0">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Coder Ride
            </span>
          </Link>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-8">
            <Link
              href="/members"
              className="text-slate-300 hover:text-primary transition-colors whitespace-nowrap relative group"
            >
              Members
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/projects"
              className="text-slate-300 hover:text-primary transition-colors whitespace-nowrap relative group"
            >
              Projects
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/events"
              className="text-slate-300 hover:text-primary transition-colors whitespace-nowrap relative group"
            >
              Events
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="text-slate-300 hover:text-accent transition-colors whitespace-nowrap relative group"
              >
                Admin
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {session ? (
              <div className="flex items-center gap-4">
                {/* Profile Link with Truncated Name */}
                <Link
                  href={`/members/profile`}
                  className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors group min-w-0 max-w-[180px]"
                  title={session.user?.name || "Profile"}
                >
                  <img
                    src={session.user?.image || "/avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-transparent group-hover:border-primary transition-colors"
                  />
                  <span className="truncate max-w-[120px]">
                    {session.user?.name}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap flex-shrink-0 hover:scale-105 transition-transform duration-200"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="btn-primary flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform duration-200"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg flex-shrink-0 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-700 pt-4 animate-slideDown">
            {/* Mobile Menu Links */}
            <Link
              href="/members"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-primary transition-colors py-2 border-l-2 border-transparent hover:border-primary hover:pl-3 transition-all duration-300"
            >
              Members
            </Link>
            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-primary transition-colors py-2 border-l-2 border-transparent hover:border-primary hover:pl-3 transition-all duration-300"
            >
              Projects
            </Link>
            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-primary transition-colors py-2 border-l-2 border-transparent hover:border-primary hover:pl-3 transition-all duration-300"
            >
              Events
            </Link>
            {canAccessAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-accent transition-colors py-2 border-l-2 border-transparent hover:border-accent hover:pl-3 transition-all duration-300"
              >
                Admin
              </Link>
            )}

            {/* Mobile User Info */}
            {session && (
              <div className="flex items-center gap-3 py-3 border-t border-slate-700 mt-2 pt-3">
                <img
                  src={session.user?.image || "/avatar.png"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {session.user?.name}
                  </p>
                  <Link
                    href={`/members/profile`}
                    onClick={() => setIsOpen(false)}
                    className="text-primary text-sm hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile Auth Buttons */}
            {session ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3 hover:scale-105 transition-transform duration-200"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  handleSignIn();
                  setIsOpen(false);
                }}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 hover:scale-105 transition-transform duration-200"
              >
                <LogIn size={16} />
                Sign In with GitHub
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}