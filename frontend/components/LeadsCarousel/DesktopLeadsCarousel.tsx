import { Member } from "@/lib/types";
import MemberCard from "@/components/MemberCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DesktopLeadsCarouselProps {
  leads: Member[];
  loading: boolean;
}

export default function DesktopLeadsCarousel({ leads, loading }: DesktopLeadsCarouselProps) {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const AUTO_SCROLL_INTERVAL = 3000;

  // Sort leads: user ID 1 first, then others
  const sortedLeads = [...leads].sort((a, b) => {
    if (a.user.id === 1) return -1;
    if (b.user.id === 1) return 1;
    return 0;
  });

  useEffect(() => {
    if (!isAutoScrolling || sortedLeads.length <= 1) return;

    autoScrollRef.current = setInterval(() => {
      setCurrentLeadIndex((prev) => (prev + 1) % sortedLeads.length);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, sortedLeads.length]);

  const nextLead = () => {
    setIsAutoScrolling(false);
    setCurrentLeadIndex((prev) => (prev + 1) % sortedLeads.length);
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  const prevLead = () => {
    setIsAutoScrolling(false);
    setCurrentLeadIndex((prev) => (prev - 1 + sortedLeads.length) % sortedLeads.length);
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  const getCardTransform = (index: number) => {
    const totalCards = sortedLeads.length;
    const adjustedIndex = (index - currentLeadIndex + totalCards) % totalCards;

    // Increased spacing for better spread
    if (adjustedIndex === 0) {
      // Center card - focused
      return "translateX(0) scale(1) rotateY(0)";
    } else if (adjustedIndex === 1) {
      // Right card - increased from 140px to 200px
      return `translateX(200px) scale(0.9) rotateY(-12deg)`;
    } else if (adjustedIndex === 2) {
      // Far right card - increased from 240px to 320px
      return `translateX(320px) scale(0.8) rotateY(-18deg)`;
    } else if (adjustedIndex === totalCards - 1) {
      // Left card - increased from 140px to 200px
      return `translateX(-200px) scale(0.9) rotateY(12deg)`;
    } else if (adjustedIndex === totalCards - 2) {
      // Far left card - increased from 240px to 320px
      return `translateX(-320px) scale(0.8) rotateY(18deg)`;
    } else {
      // Hidden cards - moved further out
      return "translateX(600px) scale(0.7) opacity-0";
    }
  };

  const getCardOpacity = (index: number) => {
    const totalCards = sortedLeads.length;
    const adjustedIndex = (index - currentLeadIndex + totalCards) % totalCards;
    
    // Adjusted opacity for better visual hierarchy
    if (adjustedIndex === 0) return 1; // Center - full opacity
    if (adjustedIndex === 1 || adjustedIndex === totalCards - 1) return 0.9; // Adjacent - slightly dimmed
    if (adjustedIndex === 2 || adjustedIndex === totalCards - 2) return 0.7; // Far sides - more dimmed
    return 0; // Hidden
  };

  const getCardZIndex = (index: number) => {
    const totalCards = sortedLeads.length;
    const adjustedIndex = (index - currentLeadIndex + totalCards) % totalCards;

    if (adjustedIndex === 0) return 50;
    if (adjustedIndex === 1 || adjustedIndex === totalCards - 1) return 40;
    if (adjustedIndex === 2 || adjustedIndex === totalCards - 2) return 30;
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-8 h-96">
        {/* Far left loading card */}
        <div className="w-48 h-80 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-70" />
        {/* Left loading card */}
        <div className="w-52 h-84 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-80" />
        {/* Center loading card */}
        <div className="w-56 h-88 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
        {/* Right loading card */}
        <div className="w-52 h-84 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-80" />
        {/* Far right loading card */}
        <div className="w-48 h-80 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-70" />
      </div>
    );
  }

  if (sortedLeads.length === 0) {
    return (
      <div className="card p-12 text-center h-96 flex items-center justify-center">
        <div>
          <p className="text-slate-400 text-lg">No leads available yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Our community leaders will be featured here soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div 
        className="relative h-[420px] flex items-center justify-center perspective-1000 overflow-visible"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        {sortedLeads.map((member, index) => {
          const totalCards = sortedLeads.length;
          const adjustedIndex = (index - currentLeadIndex + totalCards) % totalCards;
          const isCenter = adjustedIndex === 0;
          const isLeftSide = adjustedIndex === totalCards - 1 || adjustedIndex === totalCards - 2;
          const isRightSide = adjustedIndex === 1 || adjustedIndex === 2;

          return (
            <div
              key={member.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer"
              style={{
                transform: getCardTransform(index),
                zIndex: getCardZIndex(index),
                transformStyle: "preserve-3d",
                opacity: getCardOpacity(index),
              }}
              onMouseEnter={() => {
                if (isLeftSide) setShowLeftButton(true);
                if (isRightSide) setShowRightButton(true);
              }}
              onMouseLeave={() => {
                setShowLeftButton(false);
                setShowRightButton(false);
              }}
              onClick={() => {
                if (!isCenter) {
                  setIsAutoScrolling(false);
                  setCurrentLeadIndex(index);
                  setTimeout(() => setIsAutoScrolling(true), 5000);
                }
              }}
            >
              {/* Adjust card sizes based on position */}
              <div className={`transition-all duration-700 ${
                isCenter ? 'w-64' : 
                (adjustedIndex === 1 || adjustedIndex === totalCards - 1) ? 'w-60' : 'w-56'
              }`}>
                <div className={`
                  relative transition-all duration-300 h-96
                  ${
                    isCenter
                      ? "shadow-2xl shadow-accent/25 hover:shadow-accent/35"
                      : "shadow-xl shadow-slate-900/60 hover:shadow-slate-800/70"
                  }
                  ${isCenter ? "hover:scale-105" : "hover:scale-102"}
                `}>
                  <MemberCard member={member} />
                  {/* Overlay for non-center cards */}
                  {!isCenter && (
                    <div className={`absolute inset-0 rounded-xl pointer-events-none ${
                      adjustedIndex === 1 || adjustedIndex === totalCards - 1 
                        ? 'bg-slate-900/30' 
                        : 'bg-slate-900/40'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows - Show on side hover */}
        {sortedLeads.length > 1 && (
          <>
            <div 
              className={`absolute left-0 top-0 h-full w-1/3 flex items-center justify-start pl-8 transition-opacity duration-300 ${
                showLeftButton ? 'opacity-100' : 'opacity-0'
              }`}
              onMouseEnter={() => setShowLeftButton(true)                                                                         }
              onMouseLeave={() => setShowLeftButton(false)}
            >
              <button
                onClick={prevLead}
                className="p-4 bg-slate-800/90 hover:bg-slate-700/95 border border-slate-600 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm group shadow-2xl"
              >
                <ChevronLeft
                  size={28}
                  className="text-white group-hover:text-accent transition-colors"
                />
              </button>
            </div>

            <div 
              className={`absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-8 transition-opacity duration-300 ${
                showRightButton ? 'opacity-100' : 'opacity-0'
              }`}
              onMouseEnter={() => setShowRightButton(true)}
              onMouseLeave={() => setShowRightButton(false)}
            >
              <button
                onClick={nextLead}
                className="p-4 bg-slate-800/90 hover:bg-slate-700/95 border border-slate-600 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm group shadow-2xl"
              >
                <ChevronRight
                  size={28}
                  className="text-white group-hover:text-accent transition-colors"
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {sortedLeads.length > 1 && (
        <div className="flex justify-center mt-16 space-x-3">
          {sortedLeads.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoScrolling(false);
                setCurrentLeadIndex(index);
                setTimeout(() => setIsAutoScrolling(true), 5000);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentLeadIndex
                  ? "bg-accent scale-125 shadow-lg shadow-accent/50"
                  : "bg-slate-600 hover:bg-slate-400 hover:scale-110"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}