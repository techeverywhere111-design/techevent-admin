import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetEnquiryById, MarkAsTreated, MarkAsNotTreated } from "@/lib/api/EnquiriesEndpoint";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import AppLoader from "@/components/ui/AppLoader";

const EnquiryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const initialEnquiry = location.state?.enquiry;

  const { data: enquiry, isLoading, error } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: () => GetEnquiryById(id!),
    enabled: !!id,
    initialData: initialEnquiry,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: "Treated" | "Not Treated") => {
      if (status === "Treated") {
        await MarkAsTreated(id!);
      } else {
        await MarkAsNotTreated(id!);
      }
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Failed to update status");
    },
  });

  if (isLoading) {
    return <AppLoader />;
  }

  if (error || !enquiry) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading enquiry details</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  const treatedByName = (() => {
    if (enquiry?.treatedByUser) {
      const fullName = [enquiry.treatedByUser.firstName, enquiry.treatedByUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return fullName || enquiry.treatedByUser.email || null;
    }
    if (enquiry?.treatedBy) {
      return enquiry.treatedBy;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-white mb-6">
          Enquiries
        </h1>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-blue-600" />
          </button>
          <h2 className="text-lg font-medium text-[#1F2937] dark:text-white">View</h2>
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap break-all">{enquiry.name}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
            <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap break-all">{enquiry.email}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <div className="relative">
              <select
                value={enquiry.isTreated ? "Treated" : "Not Treated"}
                onChange={(e) => updateStatusMutation.mutate(e.target.value as any)}
                className="appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="Not Treated">Not Treated</option>
                <option value="Treated">Treated</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          {treatedByName && (
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Treated By</p>
              <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                {treatedByName}
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl mb-6 min-w-0 overflow-hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Subject</p>
          <p className="text-gray-900 dark:text-white font-semibold leading-relaxed whitespace-pre-wrap break-all">
            {enquiry.subject || "N/A"}
          </p>
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl min-h-[200px] min-w-0 overflow-hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Message</p>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-all">
            {enquiry.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetails;
