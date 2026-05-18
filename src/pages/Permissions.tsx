/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Plus, X } from "lucide-react";
import {
  GetPermissions,
  SearchPermissions,
  CreatePermission,
  UpdatePermission,
} from "@/lib/api/PermissionEndpoint";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Permission, PermissionPayload } from "@/lib/schemas";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

const emptyForm: PermissionPayload = {
  name: "",
  description: "",
  module: "",
  endpoint: "",
  method: "GET",
  planFeature: "",
  isGeneral: false,
};

const Permissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [form, setForm] = useState<PermissionPayload>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PermissionPayload, string>>>({});

  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["permissions", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm
        ? await SearchPermissions(activeSearchTerm, page - 1, itemsPerPage)
        : await GetPermissions(page - 1, itemsPerPage);
      return { permissions: response.content, totalElements: response.totalElements };
    },
  });

  const permissions = data?.permissions || [];
  const totalCount = data?.totalElements || 0;

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPermission(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (permission: Permission) => {
    setModalMode("edit");
    setSelectedPermission(permission);
    setForm({
      name: permission.name,
      description: permission.description,
      module: permission.module,
      endpoint: permission.endpoint,
      method: permission.method,
      planFeature: permission.planFeature,
      isGeneral: permission.isGeneral,
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PermissionPayload, string>> = {};
    if (!form.name.trim()) newErrors.name = "Permission name is required.";
    if (!form.module.trim()) newErrors.module = "Module is required.";
    if (!form.endpoint.trim()) newErrors.endpoint = "Endpoint is required.";
    if (!form.method.trim()) newErrors.method = "Method is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (modalMode === "create") {
        return await CreatePermission(form);
      } else if (selectedPermission) {
        return await UpdatePermission(selectedPermission.id, form);
      }
    },
    onSuccess: (response) => {
      toast.success(
        `Permission "${response?.name}" ${modalMode === "create" ? "created" : "updated"} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      handleCloseModal();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to save permission.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    submitMutation.mutate();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setSelectedPermission(null);
    setErrors({});
  };

  const handleExport = () => {
    if (permissions.length === 0) return;
    const exportData = permissions.map((p) => ({
      Name: p.name,
      Module: p.module,
      Method: p.method,
      Endpoint: p.endpoint,
      Description: p.description,
      "Plan Feature": p.planFeature,
      General: p.isGeneral ? "Yes" : "No",
      "Date Created": new Date(p.createdOn).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Permissions");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Permissions.xlsx");
  };

  const updateField = (field: keyof PermissionPayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (v) => <span className="text-gray-900 dark:text-gray-100 font-medium">{v}</span>,
    },
    {
      key: "module",
      label: "Module",
      render: (v) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          {v}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (v) => {
        const colors: Record<string, string> = {
          GET: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
          POST: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
          PUT: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
          DELETE: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
          PATCH: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[v] || ""}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "endpoint",
      label: "Endpoint",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{v}</span>
      ),
    },
    {
      key: "isGeneral",
      label: "General",
      render: (v) => (
        <span
          className={`text-xs font-semibold ${
            v ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {v ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Created",
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const renderActions = (row: Permission) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openEditModal(row);
      }}
      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      Edit
    </button>
  );

  const isSubmitLoading = submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Permissions
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
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

          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Permission
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={permissions}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setPage(1);
          }}
          renderActions={renderActions}
          loading={loading}
        />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div
            className="relative w-full max-w-2xl mx-4 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] sticky top-0 z-10">
              <h3 className="text-white font-semibold text-lg">
                {modalMode === "edit" ? "Edit Permission" : "Add New Permission"}
              </h3>
              <button
                className="text-white hover:text-gray-200 text-2xl leading-none"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. view_dashboard"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Module <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DASHBOARD"
                    value={form.module}
                    onChange={(e) => updateField("module", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      errors.module
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {errors.module && <p className="text-red-500 text-sm mt-1">{errors.module}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) => updateField("method", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      errors.method
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  >
                    {HTTP_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Endpoint <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /api/v1/dashboard"
                    value={form.endpoint}
                    onChange={(e) => updateField("endpoint", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      errors.endpoint
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {errors.endpoint && (
                    <p className="text-red-500 text-sm mt-1">{errors.endpoint}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Plan Feature
                </label>
                <input
                  type="text"
                  placeholder="e.g. BASIC"
                  value={form.planFeature}
                  onChange={(e) => updateField("planFeature", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what this permission allows"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isGeneral"
                  checked={form.isGeneral}
                  onChange={(e) => updateField("isGeneral", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isGeneral"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  General Permission
                </label>
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
    </div>
  );
};

export default Permissions;
