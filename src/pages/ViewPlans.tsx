import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Gem } from "lucide-react";
import EditPlanCard from "@/components/ui/EditPlanCard";
import type { PlanResponse } from "@/lib/api/Plans";
import { PlanGet } from "@/lib/api/Plans";
import { toast } from "react-toastify";

export default function ViewPlans() {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) {
        setError("No plan ID found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PlanGet(id);
        setPlan(data);
        console.log("Fetched plan:", data);
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        setError("Failed to load plan. Please try again.");
        toast.error("Failed to load plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-wrap justify-center items-start gap-10 p-10 transition-colors duration-300">
      <EditPlanCard
        icon={getIcon(plan.type)}
        type={plan.type}
        title={plan.name}
        priceNaira={plan.priceNaira.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        priceUSD={plan.priceUsd.toLocaleString(undefined, {
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
