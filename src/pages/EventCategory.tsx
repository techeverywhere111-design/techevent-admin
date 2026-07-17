/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Upload, Plus, X } from "lucide-react";
import {
  CreateEventCategory,
  GetEventCategories,
  UpdateEventCategory,
  DeleteEventCategory,
  SearchEventCategory,
} from "@/lib/api/EventManagement";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface EventCategory {
  id: string;
  name: string;
  description?: string | null;
  createdOn: string;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const EventCategory: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<EventCategory | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["eventCategories", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm
        ? await SearchEventCategory(activeSearchTerm, page - 1, itemsPerPage)
        : await GetEventCategories(page - 1, itemsPerPage);

      const items = response?.content || [];
      const total = response?.totalElements || 0;
      return { categories: items, totalCount: total };
    },
  });

  const categories = data?.categories || [];
  const totalCount = data?.totalCount || 0;

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setItemsPerPage(newPerPage);
    setPage(1);
  };

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
      description: category.description || "",
    });
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = { name: "", description: "" };

    if (!newCategory.name.trim()) {
      newErrors.name = "Please enter a category title.";
    }

    setErrors(newErrors);
    return !newErrors.name;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (modalMode === "create") {
        return await CreateEventCategory({
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
        });
      } else if (modalMode === "edit" && selectedCategory) {
        return await UpdateEventCategory(selectedCategory.id, {
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
        });
      }
    },
    onSuccess: () => {
      toast.success(modalMode === "create" ? "Category created successfully" : "Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["eventCategories"] });
      setShowModal(false);
      setNewCategory({ name: "", description: "" });
      setSelectedCategory(null);
      setErrors({ name: "", description: "" });
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save category.";
      showErrorToast(errorMessage);
    }
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    submitMutation.mutate();
  };
  
  const isSubmitLoading = submitMutation.isPending;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await DeleteEventCategory(id);
    },
    onSuccess: (response) => {
      toast.success(
        categoryToDelete?.name + " deleted successfully." ||
          response?.data?.message ||
          response?.message ||
          "Category deleted successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["eventCategories"] });
      setPage(1);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Failed to delete category");
    }
  });

  const handleDelete = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete.id);
  };
  
  const isDeleteLoading = deleteMutation.isPending;

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
        <span className="text-gray-600 dark:text-gray-300">
          {v || "-"}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Event Categories
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
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
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
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
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter category description"
                  value={newCategory.description || ""}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitLoading}
                  className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitLoading
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
                  onClick={handleDelete}
                  disabled={isDeleteLoading}
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
