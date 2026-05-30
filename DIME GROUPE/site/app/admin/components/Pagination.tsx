"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "élément(s)",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between glass glass-strong rounded-xl p-4">
      <div className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
        Page {currentPage} sur {totalPages} • {startItem}-{endItem} sur {totalItems} {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
        >
          ← Précédent
        </button>
        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
          let page: number;
          if (totalPages <= 10) {
            page = i + 1;
          } else if (currentPage <= 5) {
            page = i + 1;
          } else if (currentPage >= totalPages - 4) {
            page = totalPages - 9 + i;
          } else {
            page = currentPage - 5 + i;
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? "bg-[var(--royal-blue)]/20 text-[var(--royal-blue)] font-semibold"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}


