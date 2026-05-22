// import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Gem } from "lucide-react";
import EditPlanCard from "@/components/ui/EditPlanCard";
// import type { PlanResponse } from "@/lib/api/Plans";
import { PlanGet } from "@/lib/api/Plans";
// import { toast } from "react-toastify";

import { useQuery } from "@tanstack/react-query";

export default function ViewPlans() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: plan,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["plan", id],
    queryFn: async () => {
      if (!id) throw new Error("No plan ID found.");
      return await PlanGet(id);
    },
    enabled: !!id,
  });

  const error = queryError?.message || (!id ? "No plan ID found." : "");

  const getIcon = (type?: string | null) => {
    switch (type?.toLowerCase()) {
      default:
        return <Gem className="w-12 h-12 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading plan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No plan found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-wrap justify-center items-start gap-10 p-10 -pt-10 transition-colors duration-300">
      <EditPlanCard
        id={plan.id}
        isActive={plan.isActive ?? false}
        icon={getIcon(plan.type)}
        type={plan.type ?? undefined}
        title={plan.name ?? ""}
        priceNaira={(plan.priceNaira ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        priceUSD={(plan.priceUsd ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        features={plan.features}
        buttonText="Edit Plan"
        navigateTo={`/plan-creation?id=${plan.id}`}
      />
    </div>
  );
}
