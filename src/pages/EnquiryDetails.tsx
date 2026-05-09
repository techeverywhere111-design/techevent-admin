import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetEnquiryById, MarkAsTreated, MarkAsNotTreated } from "@/lib/api/EnquiriesEndpoint";
import { toast } from "react-toastify";

const EnquiryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: enquiry, isLoading, error } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: () => GetEnquiryById(id!),
    enabled: !!id,
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
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
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

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="font-semibold text-gray-900 dark:text-white">{enquiry.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
            <p className="font-semibold text-gray-900 dark:text-white">{enquiry.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Business Name</p>
            <p className="font-semibold text-gray-900 dark:text-white">{enquiry.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subject</p>
            <p className="font-semibold text-gray-900 dark:text-white">{enquiry.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <div className="relative">
              <select
                value={enquiry.isTreated ? "Treated" : "Not Treated"}
                onChange={(e) => updateStatusMutation.mutate(e.target.value as any)}
                className="appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Not Treated">Not Treated</option>
                <option value="Treated">Treated</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl min-h-[200px]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Message</p>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {enquiry.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetails;
