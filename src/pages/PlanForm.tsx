import React, { useEffect, useState, useContext } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { PlanCreate, type PlanPayload } from "@/lib/api/Plans";

const PlanForm: React.FC = () => {
  const location = useLocation();
  const { user } = useContext(AppContext);

  const [planData, setPlanData] = useState<PlanPayload>({
    type: "",
    name: "",
    features: [""],
    priceNaira: 0,
    priceUsd: 0,
  });

  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Current user:", user);
    const planType = location.search.replace("?", "");
    if (planType) {
      setPlanData((prev) => ({ ...prev, type: planType }));
    }
  }, [location.search]);

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...planData.features];
    updated[index] = value;
    setPlanData((prev) => ({ ...prev, features: updated }));
  };

  const addFeature = () => {
    setPlanData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = () => {
    if (planData.features.length > 1) {
      const updated = [...planData.features];
      updated.pop();
      setPlanData((prev) => ({ ...prev, features: updated }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string | string[]> = {};

    if (!planData.name.trim()) newErrors.name = "Plan name is required.";
    if (!planData.priceNaira || planData.priceNaira <= 0)
      newErrors.priceNaira = "Enter a valid Naira price.";
    if (!planData.priceUsd || planData.priceUsd <= 0)
      newErrors.priceUsd = "Enter a valid USD price.";

    const featureErrors: string[] = planData.features.map((f, i) =>
      !f.trim() ? `Feature ${i + 1} is required.` : ""
    );
    if (featureErrors.some((err) => err !== "")) {
      newErrors.features = featureErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("❌ Please fix all errors before submitting.");
      return;
    }

    setLoading(true);

    const payload = {
      ...planData,
      features: planData.features.map((f) => f.trim()),
    };

    try {
      const result = await PlanCreate(payload);
      toast.success("✅ Plan created successfully!");
      console.log("Created plan:", result);
      console.log(payload);

      // reset form but preserve type
      setPlanData({
        type: planData.type,
        name: "",
        features: [""],
        priceNaira: 0,
        priceUsd: 0,
      });
      setErrors({});
    } catch (error) {
      console.log(payload);
      console.error(error);
      toast.error("❌ Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canRemove = planData.features.length > 1; // always enabled once ≥2 features

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-8 w-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <h2 className="text-lg font-semibold mb-6">Plans</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        {/* Left Column */}
        <div>
          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Type</label>
            <input
              type="text"
              value={planData.type}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none"
            />
          </div>

          {/* Plan Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Plan Name</label>
            <input
              type="text"
              value={planData.name}
              onChange={(e) =>
                setPlanData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter plan name"
              className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none ${
                errors.name ? "border border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="space-y-3">
              {planData.features.map((feature, index) => (
                <div key={index}>
                  <input
                    type="text"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none ${
                      errors.features && (errors.features as string[])[index]
                        ? "border border-red-500"
                        : ""
                    }`}
                  />
                  {errors.features && (errors.features as string[])[index] && (
                    <p className="text-red-500 text-xs mt-1">
                      {(errors.features as string[])[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Feature
              </button>

              {planData.features.length > 1 && (
                <button
                  type="button"
                  onClick={removeFeature}
                  disabled={!canRemove}
                  className={`flex items-center text-red-600 dark:text-red-400 text-sm ${
                    canRemove
                      ? "hover:underline"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <MinusCircle className="w-4 h-4 mr-1" />
                  Remove Feature
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Price (₦ Naira)
            </label>
            <input
              type="number"
              value={planData.priceNaira || ""}
              onChange={(e) =>
                setPlanData((prev) => ({
                  ...prev,
                  priceNaira: Number(e.target.value),
                }))
              }
              placeholder="0.00"
              className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none ${
                errors.priceNaira ? "border border-red-500" : ""
              }`}
            />
            {errors.priceNaira && (
              <p className="text-red-500 text-xs mt-1">{errors.priceNaira}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price (US Dollar)
            </label>
            <input
              type="number"
              value={planData.priceUsd || ""}
              onChange={(e) =>
                setPlanData((prev) => ({
                  ...prev,
                  priceUsd: Number(e.target.value),
                }))
              }
              placeholder="0.00"
              className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none ${
                errors.priceUsd ? "border border-red-500" : ""
              }`}
            />
            {errors.priceUsd && (
              <p className="text-red-500 text-xs mt-1">{errors.priceUsd}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white rounded-md transition ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;
