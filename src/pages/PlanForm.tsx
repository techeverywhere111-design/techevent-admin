import React, { useEffect, useState, useContext } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import {
  PlanCreate,
  PlanUpdate,
  PlanGet,
  type PlanPayload,
} from "@/lib/api/Plans";

const PlanForm: React.FC = () => {
  const navigate = useNavigate();
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
  const [editing, setEditing] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    console.log("User from context:", user);
    console.log(planData);

    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("id");
    const typeParam = searchParams.get("type");

    const fallbackType =
      !typeParam && location.search.startsWith("?")
        ? location.search.replace("?", "").trim()
        : typeParam;

    if (id) {
      setEditing(true);
      setPlanId(id);
      fetchPlanData(id);
    } else if (fallbackType) {
      setPlanData((prev) => ({ ...prev, type: fallbackType }));
    }
  }, [location.search]);

  const fetchPlanData = async (id: string) => {
    try {
      setLoading(true);
      const data = await PlanGet(id);
      if (!data) throw new Error("No plan found");

      setPlanData({
        type: data.type || "",
        name: data.name || "",
        features: data.features?.length ? data.features : [""],
        priceNaira: data.priceNaira || 0,
        priceUsd: data.priceUsd || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plan details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...planData.features];
    updated[index] = value;
    setPlanData((prev) => ({ ...prev, features: updated }));
  };

  const addFeature = () => {
    setPlanData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeSingleFeature = (index: number) => {
    if (planData.features.length > 1) {
      const updated = planData.features.filter((_, i) => i !== index);
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
      toast.error("Please fix all errors before submitting.");
      return;
    }

    setLoading(true);
    const payload = {
      ...planData,
      features: planData.features.map((f) => f.trim()),
    };

    try {
      if (editing && planId) {
        console.log(payload);
        await PlanUpdate(planId, payload);
        toast.success("Plan updated successfully!");
        navigate(`/view-plans?id=${planId}`);
      } else {
        console.log("Creating plan with payload:", payload);
        const result = await PlanCreate(payload);
        toast.success("Plan created successfully!");
        navigate(`/view-plans?id=${result?.id}`);
      }

      setTimeout(() => {
        setErrors({});
        if (!editing) {
          setPlanData({
            type: planData.type,
            name: "",
            features: [""],
            priceNaira: 0,
            priceUsd: 0,
          });
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canRemove = planData.features.length > 1;

  return (
    <div className="p-8 w-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <h2 className="text-lg font-semibold mb-6">
        {editing ? "Edit Plan" : "Create Plan"}
      </h2>

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
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      className={`flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none ${
                        errors.features && (errors.features as string[])[index]
                          ? "border border-red-500"
                          : ""
                      }`}
                    />

                    {planData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSingleFeature(index)}
                        disabled={!canRemove}
                        className={`flex items-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 text-sm ${
                          canRemove
                            ? "hover:underline"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <MinusCircle className="w-4 h-4 mr-1" />
                      </button>
                    )}
                  </div>

                  {errors.features && (errors.features as string[])[index] && (
                    <p className="text-red-500 text-xs mt-1 ml-1">
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
            {loading
              ? editing
                ? "Updating..."
                : "Creating..."
              : editing
              ? "Update Plan"
              : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;
