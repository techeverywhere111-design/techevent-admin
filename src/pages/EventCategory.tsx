/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { MoreVertical, Search, Upload, Plus } from "lucide-react";
import {
  CreateEventCategory,
  GetEventCategories,
  UpdateEventCategory,
} from "@/lib/api/EventManagement";
import { toast } from "react-toastify";

interface EventCategory {
  id: string;
  name: string;
  description: string;
  createdOn: string;
}

const EventCategoryPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fetchCategories = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const response = await GetEventCategories(pageNumber - 1, itemsPerPage);
      const items = response?.content || response?.data || [];
      setCategories(items);
      setTotalCount(response?.totalElements || response?.total || items.length);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode("create");
    setNewCategory({ name: "", description: "" });
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const handleEditCategory = (category: EventCategory) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setNewCategory({ name: category.name, description: category.description });
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const handleDeleteCategory = (category: EventCategory) => {
    toast.info(`Delete "${category.name}" coming soon.`);
  };

  const handleSubmit = async () => {
    const newErrors = { name: "", description: "" };

    if (!newCategory.name.trim())
      newErrors.name = "Please enter a category title.";
    if (!newCategory.description.trim())
      newErrors.description = "Please enter a category description.";

    setErrors(newErrors);
    if (newErrors.name || newErrors.description) return;

    try {
      setLoading(true);
      setShowModal(false);
      if (modalMode === "create") {
        const response = await CreateEventCategory({
          name: newCategory.name,
          description: newCategory.description,
        });
        toast.success(`Category "${response.name}" created successfully!`);
      } else if (modalMode === "edit" && selectedCategory) {
        const response = await UpdateEventCategory(selectedCategory.id, {
          name: newCategory.name,
          description: newCategory.description,
        });
        toast.success(`Category "${response.name}" updated successfully!`);
      }

      setShowModal(false);
      setNewCategory({ name: "", description: "" });
      setErrors({ name: "", description: "" });
      fetchCategories(page);
    } catch (err: any) {
      console.error("Error saving category:", err);
      toast.error(err?.response?.data?.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Title",
      render: (v) => (
        <span className="text-gray-900 dark:text-gray-100">{v}</span>
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

  const renderActions = (row: EventCategory) => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {openMenuId === row.id && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-[9999] w-40">
          <button
            onClick={() => {
              handleEditCategory(row);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Edit
          </button>
          <button
            onClick={() => {
              handleDeleteCategory(row);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Event Categories
          </h1>
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => handleSearchInputChange(searchTerm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-900 text-blue-100 dark:text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Category
            </button>
            <button
              onClick={() => toast.info("Export coming soon")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-white rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredCategories}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          loading={loading}
          renderActions={renderActions}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-blue-100/20 backdrop-blur-sm dark:bg-blue-900/30"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative w-1/3 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between px-4 py-4 bg-[#0B1E36] dark:bg-blue-900">
              <h3 className="text-white font-semibold text-lg">
                {modalMode === "edit" ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                className="text-white font-bold text-lg"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Title
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
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter category description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {loading
                    ? modalMode === "edit"
                      ? "Updating..."
                      : "Adding..."
                    : modalMode === "edit"
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCategoryPage;
