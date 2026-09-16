import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, ShieldX } from "lucide-react";
import AppLoader from "./AppLoader";

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
  currentPage?: number;
  renderActions?: (row: any) => React.ReactNode;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
  isUnauthorized?: boolean;
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
          className={`fixed w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] ${positionAbove ? "" : ""
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
  currentPage: propCurrentPage,
  renderActions,
  onPageChange,
  onPerPageChange,
  loading = false,
  isUnauthorized = false,
}) => {
  const [internalPage, setInternalPage] = useState(propCurrentPage ?? 1);

  useEffect(() => {
    if (propCurrentPage !== undefined) {
      setInternalPage(propCurrentPage);
    }
  }, [propCurrentPage]);

  const currentPage = propCurrentPage !== undefined ? propCurrentPage : internalPage;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(itemsPerPage);

  // Update perPage when itemsPerPage prop changes
  useEffect(() => {
    setPerPage(itemsPerPage);
  }, [itemsPerPage]);

  const totalPages = totalCount
    ? Math.ceil(totalCount / perPage)
    : Math.ceil(data.length / perPage);

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentData = totalCount ? data : data.slice(startIndex, endIndex);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setInternalPage(page);
      onPageChange?.(page);
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setInternalPage(1); // Reset to first page when changing items per page
    onPerPageChange?.(newPerPage); // Call parent callback
    onPageChange?.(1);
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

  const getAvailablePerPageOptions = () => {
    const options = [10, 20, 30, 50];

    // Always show all options, but ensure current perPage is included
    if (!options.includes(perPage)) {
      options.push(perPage);
      options.sort((a, b) => a - b);
    }

    return options;
  };

  return (
    <div className="relative min-w-0 w-full overflow-hidden rounded-lg bg-white shadow-sm transition-colors duration-300 dark:bg-gray-800">
      <div className="table-scrollbar w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <table className="min-w-[900px] w-full table-auto">
          <thead className="bg-blue-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 break-words whitespace-normal"
                >
                  {column.label}
                </th>
              ))}
              {renderActions && <th className="px-6 py-3"></th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="py-12"
                >
                  <AppLoader fullScreen={false} />
                </td>
              </tr>
            ) : isUnauthorized ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-red-500 font-medium">
                    <ShieldX size={32} />
                    <span>This user is not authorized to view this table</span>
                  </div>
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="max-w-xs break-words whitespace-normal px-6 py-4 text-sm text-gray-900 dark:text-gray-100 md:max-w-sm"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-right">
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
      </div>

      {/* Always show footer if there is data and pagination/per-page controls are relevant */}
      {data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="px-3 py-1 rounded text-sm bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300">
            {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2 flex-wrap justify-center">
            {totalPages > 1 &&
              renderPagination().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`min-w-[40px] px-3 py-1 rounded text-sm transition ${page === currentPage
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Per page:
            </span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getAvailablePerPageOptions().map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
