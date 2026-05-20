/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PlanCreate, PlanUpdate, PlanGet } from "@/lib/api/Plans";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FeatureKeys = keyof typeof initialFeatures;

type FeatureData = {
  enabled: boolean;
  errors?: Record<string, string>;
  [key: string]: any;
};

const initialFeatures = {
  meetingFeature: {
    enabled: false,
    numberAllowed: "",
    canRecord: false,
    numberOfParticipants: "",
    errors: {} as Record<string, string>,
  },
  eventFeature: {
    enabled: false,
    numberAllowed: "",
    numberOfForms: "",
    allowPaidEvent: false,
    errors: {} as Record<string, string>,
  },
  calendarFeature: {
    enabled: false,
    numberOfSynchronization: "",
    numberOfAppointmentSlots: "",
    errors: {} as Record<string, string>,
  },
  proposalFeature: {
    enabled: false,
    numberOfProposalsReceived: "",
    canQueryProposalSearch: false,
    errors: {} as Record<string, string>,
  },
  accountFeature: {
    enabled: false,
    numberOfInvites: "",
    numberOfSessions: "",
    errors: {} as Record<string, string>,
  },
  pollFeature: {
    enabled: false,
    numberOfPolls: "",
    numberOfPollVotes: "",
    numberOfQuestionAndAnswerSessions: "",
    numberOfQuestionsSent: "",
    errors: {} as Record<string, string>,
  },
};

export default function CreatePlanRedesign() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectAll, setSelectAll] = useState(false);
  const [features, setFeatures] =
    useState<typeof initialFeatures>(initialFeatures);
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [priceErrors, setPriceErrors] = useState({ naira: "", usd: "" });
  const [nameError, setNameError] = useState("");
  // const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
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
    } else if (fallbackType) {
      setPlanType(fallbackType);
    }
  }, [location.search]);

  const { data: fetchedPlan, isLoading: queryLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      if (!planId) throw new Error("No plan ID");
      return await PlanGet(planId);
    },
    enabled: !!planId,
  });

  useEffect(() => {
    if (fetchedPlan) {
      const data = fetchedPlan;
      setPlanType(data.type || "");
      setPlanName(data.name || "");
      setPriceNaira(data.priceNaira?.toString() || "");
      setPriceUSD(data.priceUsd?.toString() || "");

      if (data.features) {
        const updatedFeatures = { ...initialFeatures };
        Object.keys(data.features).forEach((key) => {
          if (key in updatedFeatures) {
            const featureKey = key as FeatureKeys;
            const apiFeature = data.features[key] as Record<string, any>;
            const feature = updatedFeatures[featureKey] as Record<string, any>;

            feature.enabled = true;
            Object.keys(apiFeature).forEach((field) => {
              if (
                field in feature &&
                field !== "enabled" &&
                field !== "errors"
              ) {
                const value = apiFeature[field];
                feature[field] =
                  typeof value === "number" ? value.toString() : value;
              }
            });
          }
        });
        setFeatures(updatedFeatures);
      }
    }
  }, [fetchedPlan]);

  const toggleSelectAll = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    const updated = { ...features };
    (Object.keys(updated) as FeatureKeys[]).forEach((key) => {
      updated[key].enabled = newVal;
      if (!newVal) updated[key].errors = {};
    });
    setFeatures(updated);
  };

  const toggleFeature = (cat: FeatureKeys) => {
    const updated = { ...features };
    updated[cat].enabled = !updated[cat].enabled;
    if (!updated[cat].enabled) updated[cat].errors = {};
    setFeatures(updated);
  };

  const updateField = (
    cat: FeatureKeys,
    field: string,
    value: string | boolean,
  ) => {
    const updated = { ...features };
    const feature = updated[cat] as Record<string, any>;
    feature[field] = value;

    if (
      updated[cat].enabled &&
      typeof value === "string" &&
      value.trim() === ""
    ) {
      if (!feature.errors) feature.errors = {};
      feature.errors[field] = "This field is required";
    } else {
      if (feature.errors && feature.errors[field]) {
        delete feature.errors[field];
      }
    }

    setFeatures(updated);
  };

  const validatePrice = () => {
    const errors = { naira: "", usd: "" };
    if (priceNaira.trim() === "") errors.naira = "Price is required";
    if (priceUSD.trim() === "") errors.usd = "Price is required";
    setPriceErrors(errors);
    return errors.naira === "" && errors.usd === "";
  };

  const validateName = () => {
    if (planName.trim() === "") {
      setNameError("Plan name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateFeatures = () => {
    const updated = { ...features };
    let hasErrors = false;

    (Object.keys(updated) as FeatureKeys[]).forEach((key) => {
      const feature = updated[key] as Record<string, any>;
      if (feature.enabled) {
        Object.keys(feature)
          .filter((k) => k !== "enabled" && k !== "errors")
          .forEach((field) => {
            if (
              typeof feature[field] === "string" &&
              feature[field].trim() === ""
            ) {
              if (!feature.errors) feature.errors = {};
              feature.errors[field] = "This field is required";
              hasErrors = true;
            }
          });
      }
    });

    setFeatures(updated);
    return !hasErrors;
  };

  const buildPayload = () => {
    const featuresPayload: any = {};

    (Object.keys(features) as FeatureKeys[]).forEach((key) => {
      const feature = features[key] as Record<string, any>;
      if (feature.enabled) {
        const featureData: any = {};
        Object.keys(feature)
          .filter((k) => k !== "enabled" && k !== "errors")
          .forEach((field) => {
            const value = feature[field];
            if (typeof value === "string" && value.trim() !== "") {
              featureData[field] = isNaN(Number(value)) ? value : Number(value);
            } else if (typeof value === "boolean") {
              featureData[field] = value;
            }
          });
        featuresPayload[key] = featureData;
      }
    });

    return {
      type: planType,
      name: planName.trim(),
      features: featuresPayload,
      priceNaira: Number(priceNaira),
      priceUsd: Number(priceUSD),
    };
  };

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editing && planId) {
        await PlanUpdate(planId, payload);
        return { isEdit: true, id: planId };
      } else {
        const result = await PlanCreate(payload);
        return { isEdit: false, id: result?.id };
      }
    },
    onSuccess: (result) => {
      toast.success(
        result.isEdit
          ? "Plan updated successfully!"
          : "Plan created successfully!",
      );
      if (!result.isEdit) {
        setPlanName("");
        setFeatures(initialFeatures);
        setPriceNaira("");
        setPriceUSD("");
        setNameError("");
        setPriceErrors({ naira: "", usd: "" });
        setSelectAll(false);
      }
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      navigate(`/view-plans?id=${result.id}`);
    },
    onError: () => {
      toast.error("Operation failed. Please try again.");
    },
  });

  const handleSubmit = () => {
    const nameValid = validateName();
    const priceValid = validatePrice();
    const featuresValid = validateFeatures();

    if (!nameValid || !priceValid || !featuresValid) {
      toast.error("Please fix all errors before submitting.");
      return;
    }

    const payload = buildPayload();
    submitMutation.mutate(payload);
  };

  const isSubmitLoading = submitMutation.isPending;

  if (queryLoading && editing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading plan data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {editing ? "Edit Plan" : "Create Plan"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <input
                type="text"
                value={planType}
                readOnly
                className="w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg p-3 text-sm outline-none text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                placeholder="Enter plan name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className={`w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-500 rounded-lg p-3 text-sm outline-none border ${
                  nameError
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              />
              {nameError && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {nameError}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (Naira)
              </label>
              <input
                type="number"
                placeholder=""
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                className={`w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-500 rounded-lg p-3 text-sm outline-none border ${
                  priceErrors.naira
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              />
              {priceErrors.naira && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {priceErrors.naira}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price (US Dollar)
            </label>
            <input
              type="number"
              placeholder=""
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              className={`w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-500 rounded-lg p-3 text-sm outline-none border ${
                priceErrors.usd
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            />
            {priceErrors.usd && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {priceErrors.usd}
              </p>
            )}
          </div>
          <div></div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-semibold text-gray-800 dark:text-white">
            Features
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            Select all
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {Object.entries(features).map(([key, value]) => (
            <FeatureCard
              key={key}
              title={key.replace(/Feature$/, "")}
              enabled={value.enabled}
              toggle={() => toggleFeature(key as FeatureKeys)}
              fields={Object.keys(value)
                .filter((k) => k !== "enabled" && k !== "errors")
                .map((k) => ({
                  label: k
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
                  key: k,
                  type:
                    typeof (value as Record<string, any>)[k] === "boolean"
                      ? "checkbox"
                      : undefined,
                }))}
              data={value as FeatureData}
              update={updateField}
              cat={key as FeatureKeys}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitLoading}
          className={`mt-12 px-8 py-3 rounded-lg float-right transition-colors text-white ${
            isSubmitLoading
              ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          {isSubmitLoading
            ? editing
              ? "Updating..."
              : "Creating..."
            : editing
              ? "Update"
              : "Create"}
        </button>
      </div>
    </div>
  );
}

type Field = { label: string; key: string; type?: "checkbox" };

interface FeatureCardProps {
  title: string;
  enabled: boolean;
  toggle: () => void;
  fields: Field[];
  data: FeatureData;
  update: (cat: FeatureKeys, field: string, value: string | boolean) => void;
  cat: FeatureKeys;
}

function FeatureCard({
  title,
  enabled,
  toggle,
  fields,
  data,
  update,
  cat,
}: FeatureCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
          {title}
        </h3>
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggle}
          className="cursor-pointer dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {f.label}
            </label>
            {f.type === "checkbox" ? (
              <input
                type="checkbox"
                disabled={!enabled}
                checked={data[f.key]}
                onChange={(e) => update(cat, f.key, e.target.checked)}
                className="cursor-pointer disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
              />
            ) : (
              <>
                <input
                  type="number"
                  placeholder=""
                  disabled={!enabled}
                  value={data[f.key]}
                  onChange={(e) => update(cat, f.key, e.target.value)}
                  className={`w-full bg-white dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-500 rounded-lg p-2 text-sm border ${
                    data.errors?.[f.key]
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-200 dark:border-gray-600"
                  } disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed outline-none focus:border-blue-500 dark:focus:border-blue-400`}
                />
                {data.errors?.[f.key] && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {data.errors[f.key]}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
