import React from "react";
import { Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PlanCard from "@/components/ui/PlanCard";

interface Plan {
  title: string;
  icon: LucideIcon;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const plans: Plan[] = [
    { title: "Personal", icon: Gem },
    { title: "Business", icon: Gem },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Plans</h2>
      <div className="flex flex-wrap gap-6">
        {plans.map((plan, index) => (
          <PlanCard
            key={index}
            icon={plan.icon}
            title={plan.title}
            buttonText="Create Plan"
            onClick={() => navigate(`/plan-creation?${plan.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Plans;
