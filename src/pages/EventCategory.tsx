/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Upload, Plus } from "lucide-react";
import {
  CreateEventCategory,
  GetEventCategories,
  UpdateEventCategory,
  DeleteEventCategory,
  SearchEventCategory,
} from "@/lib/api/EventManagement";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDebounce } from "use-debounce";

interface EventCategory {
  id: string;
  name: string;
  description: string;
  createdOn: string;
}

const EventCategory: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<EventCategory | null>(null);
  const itemsPerPage = 10;

  const fetchCategories = async (pageNumber: number = 1, query = "") => {
    try {
      setLoading(true);

      // If there is a search query, use the search endpoint
      const response = query
        ? await SearchEventCategory(query, pageNumber - 1, itemsPerPage)
        : await GetEventCategories(pageNumber - 1, itemsPerPage);

      const items = response?.content || response?.data || [];

      setCategories(items);
      setTotalCount(response?.totalElements || response?.total || items.length);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever debounced search term or page changes
  useEffect(() => {
    // always reset to page 1 when search term changes
    // if the page was changed by the user, fetching uses current page
    // but if debouncedSearchTerm changed and page is not 1, reset to 1 first
    if (debouncedSearchTerm) {
      // when a new search occurs, start from page 1
      if (page !== 1) setPage(1);
      else fetchCategories(1, debouncedSearchTerm);
    } else {
      // no search term -> fetch normal listing for current page
      fetchCategories(page, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, page]);

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  // Remove local filtering — backend handles search. pass categories directly to Table.
  // const filteredCategories = categories.filter(...);  // removed

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setNewCategory({ name: "", description: "" });
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const handleEditCategory = (category: EventCategory) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
    });
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = { name: "", description: "" };

    if (!newCategory.name.trim()) {
      newErrors.name = "Please enter a category title.";
    }
    if (!newCategory.description.trim()) {
      newErrors.description = "Please enter a category description.";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (modalMode === "create") {
        const response = await CreateEventCategory({
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
        });
        toast.success(`Category "${response.name}" created successfully!`);
      } else if (modalMode === "edit" && selectedCategory) {
        const response = await UpdateEventCategory(selectedCategory.id, {
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
        });
        toast.success(`Category "${response.name}" updated successfully!`);
      }

      setShowModal(false);
      setNewCategory({ name: "", description: "" });
      setSelectedCategory(null);
      setErrors({ name: "", description: "" });

      // refetch current view (respect search state)
      fetchCategories(page, debouncedSearchTerm);
    } catch (err: any) {
      console.error("Error saving category:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save category.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory({ name: "", description: "" });
    setSelectedCategory(null);
    setErrors({ name: "", description: "" });
  };

  const handleExport = () => {
    if (categories.length === 0) return;

    const exportData = categories.map((c) => ({
      Title: c.name,
      Description: c.description,
      "Date Created": new Date(c.createdOn).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EventCategories");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Event_Categories.xlsx");
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Title",
      render: (v) => (
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {v}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300 line-clamp-1">
          {v}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Date Created",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {new Date(v).toLocaleString()}
        </span>
      ),
    },
  ];

  const renderActions = (row: EventCategory) => {
    return (
      <>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => handleEditCategory(row), 0);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCategoryToDelete(row);
            setShowDeleteModal(true);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Delete
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Event Categories
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => {
                // immediate search: set searchTerm to itself to trigger debounce effect immediately if needed
                setSearchTerm((s) => s);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Category
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-white rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={categories}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          loading={loading}
          renderActions={renderActions}
        />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div
            className="relative w-full max-w-xl mx-4 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] dark:bg-[#081A30]">
              <h3 className="text-white font-semibold text-lg">
                {modalMode === "edit" ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                className="text-white hover:text-gray-200 text-2xl leading-none"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter category title"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter category description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading
                    ? modalMode === "edit"
                      ? "Updating..."
                      : "Creating..."
                    : modalMode === "edit"
                    ? "Save"
                    : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          <div
            className="relative w-full max-w-xl h-2/4 mx-4 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] dark:bg-[#081A30]">
              <h3 className="text-white font-semibold text-lg">
                Delete Category?
              </h3>
              <button
                className="text-white hover:text-gray-200 text-2xl leading-none"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6 items-center justify-center h-full flex flex-col">
              <p className="text-center text-gray-900 dark:text-gray-100 text-lg mb-6">
                Are you sure you want to delete category{" "}
                <span className="font-semibold">
                  "{categoryToDelete?.name}"
                </span>
                ?
              </p>

              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!categoryToDelete) return;
                    try {
                      setLoading(true);
                      const response = await DeleteEventCategory(
                        categoryToDelete.id
                      );
                      toast.success(
                        categoryToDelete?.name + " deleted successfully." ||
                          response?.data?.message ||
                          response?.message ||
                          "Category deleted successfully"
                      );
                      // refetch after delete (respect search state)
                      fetchCategories(page, debouncedSearchTerm);
                    } catch (err) {
                      toast.error("Failed to delete category");
                    } finally {
                      setLoading(false);
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }
                  }}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCategory;
