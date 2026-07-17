import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import {
  Gem,
  Search,
  X,
  Plus,
  ChevronDown,
  Video,
  CalendarRange,
  CalendarClock,
  FileSignature,
  Users,
  BarChart3,
  Check,
  Edit3,
} from "lucide-react";
import AppLoader from "@/components/ui/AppLoader";
import {
  PlanGetList,
  PlanSearch,
  PlanActivate,
  PlanDeactivate,
} from "@/lib/api/Plans";
import type { Plan } from "@/lib/schemas";

const featureCategories = [
  {
    key: "meetingFeature",
    title: "Meetings",
    icon: Video,
    color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    key: "eventFeature",
    title: "Events",
    icon: CalendarRange,
    color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    key: "calendarFeature",
    title: "Calendar",
    icon: CalendarClock,
    color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    key: "proposalFeature",
    title: "Proposals",
    icon: FileSignature,
    color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  },
  {
    key: "accountFeature",
    title: "Account & Invites",
    icon: Users,
    color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
  },
  {
    key: "pollFeature",
    title: "Polls & Q&As",
    icon: BarChart3,
    color: "text-pink-500 bg-pink-500/10 dark:bg-pink-500/20",
  },
];

const fieldLabels: Record<string, string> = {
  numberAllowed: "Number Allowed",
  canRecord: "Recording Support",
  numberOfParticipants: "Max Participants",
  numberOfForms: "Number of Forms",
  allowPaidEvent: "Paid Events Support",
  numberOfSynchronization: "Calendar Syncs",
  numberOfAppointmentSlots: "Appointment Slots",
  numberOfProposalsReceived: "Proposals Received",
  canQueryProposalSearch: "Proposal Search Queries",
  numberOfInvites: "Invites Allowed",
  numberOfSessions: "Active Sessions Limit",
  numberOfPolls: "Polls Allowed",
  numberOfPollVotes: "Votes Per Poll Limit",
  numberOfQuestionAndAnswerSessions: "Q&A Sessions",
  numberOfQuestionsSent: "Questions Limit",
};

export default function Plans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [selectedPlanForDrawer, setSelectedPlanForDrawer] = useState<Plan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowCreateDropdown(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Fetch plans
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      if (activeSearchTerm.trim()) {
        return await PlanSearch(activeSearchTerm, page - 1, itemsPerPage);
      }
      return await PlanGetList(page - 1, itemsPerPage);
    },
  });

  const plans = data?.content || [];
  const totalPages = data?.totalPages || 1;

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isActive) {
        return await PlanDeactivate(id);
      } else {
        return await PlanActivate(id);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive
          ? "Plan deactivated successfully"
          : "Plan activated successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      // If active drawer plan's status changed, update drawer state
      if (selectedPlanForDrawer && selectedPlanForDrawer.id === variables.id) {
        setSelectedPlanForDrawer((prev) =>
          prev ? { ...prev, isActive: !variables.isActive } : null
        );
      }
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Action failed. Please try again.");
    },
  });

  const handleToggleActive = (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleActiveMutation.mutate({ id: plan.id, isActive: plan.isActive ?? false });
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const handleOpenDrawer = (plan: Plan) => {
    setSelectedPlanForDrawer(plan);
    setIsDrawerOpen(true);
    // Open first category by default if available
    const firstCat = featureCategories.find((cat) => plan.features?.[cat.key]);
    setOpenAccordion(firstCat ? firstCat.key : null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedPlanForDrawer(null), 300); // Wait for transition
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-300 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscription Plans
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateDropdown(!showCreateDropdown);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md shadow-blue-500/10 text-sm w-fit"
            >
              <Plus size={18} />
              Create Plan
              <ChevronDown size={14} className="ml-1" />
            </button>

            {showCreateDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0b1739] border border-gray-100 dark:border-gray-800 rounded-lg shadow-xl py-1 z-20">
                <button
                  onClick={() => navigate("/plan-creation?type=Personal")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Personal Plan
                </button>
                <button
                  onClick={() => navigate("/plan-creation?type=Business")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Business Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-64 bg-white dark:bg-[#0b1739] text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0 flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20">
            <AppLoader fullScreen={false} />
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-dashed border-red-300 dark:border-red-800/50 rounded-2xl bg-white dark:bg-[#0b1739] p-6">
            <p className="text-red-500 font-semibold text-lg">Error loading plans</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto font-mono whitespace-pre-wrap text-left bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              {error instanceof Error ? error.message : String(error)}
              {typeof error === 'object' && 'response' in (error as any) && (
                <>
                  {"\n\nResponse status: "}
                  {(error as any).response?.status}
                  {"\nData: "}
                  {JSON.stringify((error as any).response?.data, null, 2)}
                </>
              )}
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0b1739]">
            <Gem className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No plans found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              We couldn't find any plans matching your search query or criteria.
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-[#0b1739] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-200 flex flex-col overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${plan.type?.toLowerCase() === "business"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                      >
                        {plan.type || "N/A"}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${plan.isActive
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400"
                            }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={(e) => handleToggleActive(plan, e)}
                          disabled={toggleActiveMutation.isPending}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${plan.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                            } ${toggleActiveMutation.isPending
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${plan.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-950 dark:text-white line-clamp-1">
                      {plan.name || "Unnamed Plan"}
                    </h3>
                  </div>

                  {/* Card Body (Prices) */}
                  <div className="p-6 py-5 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-3">
                      Pricing Tiers
                    </p>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                          Local (NGN)
                        </span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ₦{(plan.priceNaira ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                          Global (USD)
                        </span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ${(plan.priceUsd ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-5">
                      <span className="font-medium text-gray-500 dark:text-gray-500">
                        Created:
                      </span>{" "}
                      {plan.createdOn || plan.createdAt ? new Date(plan.createdOn || plan.createdAt || "").toLocaleDateString() : "N/A"}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 bg-gray-50/60 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenDrawer(plan)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                      View Features
                    </button>
                    <button
                      onClick={() => navigate(`/plan-creation?id=${plan.id}`)}
                      className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                      title="Edit Plan"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="px-3 py-1 rounded text-sm bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300">
                {page} of {totalPages}
              </span>

              <div className="flex gap-2 flex-wrap justify-center">
                {totalPages > 1 &&
                  renderPagination().map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof p === "number" && setPage(p)}
                      disabled={p === "..."}
                      className={`min-w-[40px] px-3 py-1 rounded text-sm transition ${p === page
                        ? "bg-blue-600 text-white"
                        : p === "..."
                          ? "text-gray-400 dark:text-gray-500 cursor-default bg-transparent"
                          : "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Per page:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Side Slide-out Drawer */}
      {selectedPlanForDrawer && (
        <>
          {/* Drawer Overlay */}
          <div
            onClick={handleCloseDrawer}
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 z-45 ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          />

          {/* Drawer Body */}
          <div
            className={`fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-[#0b1739] shadow-2xl border-l border-gray-100 dark:border-gray-850 z-50 flex flex-col transition-transform duration-300 ease-out transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Plan Details
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedPlanForDrawer.name}
                </h2>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Basic Overview Box */}
              <div className="bg-gray-50 dark:bg-gray-800/35 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
                <h3 className="text-xs font-semibold uppercase text-gray-450 dark:text-gray-400 mb-3 tracking-wider">
                  Package Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tier Level
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {selectedPlanForDrawer.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`font-semibold ${selectedPlanForDrawer.isActive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500"
                        }`}
                    >
                      {selectedPlanForDrawer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Local Price
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₦{(selectedPlanForDrawer.priceNaira ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Global Price
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(selectedPlanForDrawer.priceUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Sections Accordion */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-450 dark:text-gray-400 mb-3 tracking-wider">
                  Nested Feature Limits
                </h3>

                <div className="space-y-3">
                  {featureCategories.map((cat) => {
                    const featureData = selectedPlanForDrawer.features?.[cat.key];
                    if (!featureData || Object.keys(featureData).length === 0) {
                      return null;
                    }

                    const CatIcon = cat.icon;
                    const isOpen = openAccordion === cat.key;

                    return (
                      <div
                        key={cat.key}
                        className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden"
                      >
                        {/* Accordion Trigger */}
                        <button
                          onClick={() =>
                            setOpenAccordion(isOpen ? null : cat.key)
                          }
                          className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cat.color}`}>
                              <CatIcon size={16} />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {cat.title}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {/* Accordion Content */}
                        {isOpen && (
                          <div className="p-4 bg-white dark:bg-transparent border-t border-gray-150 dark:border-gray-850 space-y-3">
                            {Object.entries(featureData).map(([field, val]) => {
                              const label = fieldLabels[field] || field;

                              return (
                                <div
                                  key={field}
                                  className="flex items-center justify-between text-sm py-1 border-b border-dashed border-gray-100 dark:border-gray-850/30 last:border-b-0"
                                >
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {label}
                                  </span>

                                  {typeof val === "boolean" ? (
                                    val ? (
                                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                        <Check size={12} />
                                        Enabled
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/40 px-2 py-0.5 rounded-full">
                                        Disabled
                                      </span>
                                    )
                                  ) : (
                                    <span className="font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                                      {val}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10 flex gap-3">
              <button
                onClick={() => {
                  handleCloseDrawer();
                  navigate(`/plan-creation?id=${selectedPlanForDrawer.id}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Edit3 size={15} />
                Edit Plan Config
              </button>
              <button
                onClick={handleCloseDrawer}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
