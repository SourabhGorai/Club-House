import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

// ─── Pagination Controls ───────────────────────────────────────────────────────
const PaginationControls = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
}) => {
  const pageSizeOptions = [
    { value: "8",  label: "8 / page"  },
    { value: "12", label: "12 / page" },
    { value: "20", label: "20 / page" },
    { value: "40", label: "40 / page" },
  ];

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(0, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  };

  const start = currentPage * pageSize + 1;
  const end   = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md px-6 py-4 border border-white/20">
      {/* Left: result range */}
      <p className="text-sm text-gray-600 whitespace-nowrap">
        Showing{" "}
        <span className="font-semibold text-gray-800">
          {totalElements === 0 ? 0 : start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-800">{totalElements}</span>{" "}
        events
      </p>

      {/* Center: page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || loading}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-all ${
              p === currentPage
                ? "text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={
              p === currentPage
                ? { background: "linear-gradient(135deg, #4CA1AF, #2C3E50)" }
                : {}
            }
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: page size */}
      <div className="w-36">
        <CustomSelect
          name="pageSize"
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          options={pageSizeOptions}
          placeholder="Per page"
        />
      </div>
    </div>
  );
};

export default PaginationControls;