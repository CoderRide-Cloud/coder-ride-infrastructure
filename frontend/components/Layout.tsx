'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import { ReactNode, useState, useEffect, useRef } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [navbarStyle, setNavbarStyle] = useState('translate-y-0');
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ignore if already processing
      if (isScrolling.current) return;
      
      isScrolling.current = true;

      requestAnimationFrame(() => {
        // Scrolling down - hide with smooth animation
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setNavbarStyle('-translate-y-full transition-transform duration-500 ease-in-out');
        } 
        // Scrolling up - show immediately with snappy animation
        else if (currentScrollY < lastScrollY.current) {
          setNavbarStyle('translate-y-0 transition-transform duration-200 ease-out');
        }
        // At top - ensure navbar is visible
        else if (currentScrollY <= 100) {
          setNavbarStyle('translate-y-0 transition-transform duration-300 ease-out');
        }

        lastScrollY.current = currentScrollY;
        isScrolling.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar navbarStyle={navbarStyle} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}