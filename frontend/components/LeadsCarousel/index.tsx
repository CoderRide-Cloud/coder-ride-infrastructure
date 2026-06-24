'use client';

import { Member } from "@/lib/types";
import { useState, useEffect } from "react";
import DesktopLeadsCarousel from "./DesktopLeadsCarousel";
import MobileLeadsCarousel from "./MobileLeadsCarousel";

interface LeadsCarouselProps {
  leads: Member[];
  loading: boolean;
}

export default function LeadsCarousel({ leads, loading }: LeadsCarouselProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div>
      {isMobile ? (
        <MobileLeadsCarousel leads={leads} loading={loading} />
      ) : (
        <DesktopLeadsCarousel leads={leads} loading={loading} />
      )}
    </div>
  );
}