/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  totalCount?: number;
  itemsPerPage?: number;
  renderActions?: (row: any) => React.ReactNode;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

const ActionDropdown: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
}> = ({ children, isOpen, toggle }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [positionAbove, setPositionAbove] = useState(false);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 150; // Approximate dropdown height
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Position above if not enough space below
      setPositionAbove(
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
      );
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <div
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="cursor-pointer px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
      >
        <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={`fixed w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] ${
            positionAbove ? "" : ""
          }`}
          style={{
            top: positionAbove
              ? `${buttonRef.current!.getBoundingClientRect().top - 10}px`
              : `${buttonRef.current!.getBoundingClientRect().bottom + 8}px`,
            left: `${buttonRef.current!.getBoundingClientRect().right - 160}px`,
            transform: positionAbove ? "translateY(-100%)" : "none",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const Table: React.FC<TableProps> = ({
  columns,
  data,
  totalCount,
  itemsPerPage = 10,
  renderActions,
  onPageChange,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalPages = totalCount
    ? Math.ceil(totalCount / itemsPerPage)
    : Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = totalCount ? data : data.slice(startIndex, endIndex);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm relative transition-colors duration-300">
      <div className="overflow-x-auto overflow-y-visible relative">
        <table className="w-full">
          <thead className="bg-blue-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {column.label}
                </th>
              ))}
              {renderActions && <th className="px-6 py-3"></th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 relative">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="text-center py-8 text-blue-600 dark:text-blue-300"
                >
                  Loading data...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition relative"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-right relative">
                      <ActionDropdown
                        isOpen={openMenuId === row.id}
                        toggle={() =>
                          setOpenMenuId(openMenuId === row.id ? null : row.id)
                        }
                      >
                        {renderActions(row)}
                      </ActionDropdown>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              {renderPagination().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`min-w-[40px] px-3 py-1 rounded text-sm transition ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : page === "..."
                      ? "text-gray-400 dark:text-gray-500 cursor-default bg-transparent"
                      : "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
