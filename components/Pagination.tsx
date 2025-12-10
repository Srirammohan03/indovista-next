"use client";

import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  const pages: number[] = [];
  const maxToShow = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + maxToShow - 1);
  if (end - start < maxToShow - 1) {
    start = Math.max(1, end - maxToShow + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
      <div className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-medium">
          {(page - 1) * pageSize + 1}
        </span>{" "}
        –{" "}
        <span className="font-medium">
          {Math.min(page * pageSize, total)}
        </span>{" "}
        of <span className="font-medium">{total}</span> entries
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`px-2 py-1 text-xs rounded border ${
              p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
