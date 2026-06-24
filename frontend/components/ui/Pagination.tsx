import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between gap-4 border-t border-slate-700 pt-6">
      <div className="text-sm text-slate-400 order-2 xs:order-1">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2 order-1 xs:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-3 xs:py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
        >
          <ChevronLeft size={16} />
          <span className="hidden xs:inline">Previous</span>
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-3 xs:py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}