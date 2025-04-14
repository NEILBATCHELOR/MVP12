import React, { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import realtimeService from "@/services/realtimeService";

export type RedemptionStatus =
  | "pending"
  | "approved"
  | "processing"
  | "completed";

interface StatusStep {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  icon: React.ReactNode;
}

interface StatusTrackerProps {
  requestId?: string;
  currentStatus?: RedemptionStatus;
  steps?: StatusStep[];
  progress?: number;
}

const StatusTracker = ({
  requestId,
  currentStatus: initialStatus = "pending",
  progress = 25,
  steps = [
    {
      id: "pending",
      label: "Request Pending",
      status: "completed",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: "approved",
      label: "Request Approved",
      status: "upcoming",
      icon: <Check className="h-5 w-5" />,
    },
    {
      id: "processing",
      label: "Processing",
      status: "upcoming",
      icon: <ArrowRight className="h-5 w-5" />,
    },
    {
      id: "completed",
      label: "Completed",
      status: "upcoming",
      icon: <Check className="h-5 w-5" />,
    },
  ],
}: StatusTrackerProps) => {
  const { addNotification } = useNotifications();
  const [currentStatus, setCurrentStatus] =
    useState<RedemptionStatus>(initialStatus);

  // Subscribe to real-time status updates if requestId is provided
  useEffect(() => {
    if (!requestId) return;

    // Subscribe to status changes for this redemption request
    const subscriptionId = realtimeService.subscribeToRedemptionStatus(
      requestId,
      (newStatus) => {
        // Update the local status state when we receive an update
        setCurrentStatus(newStatus as RedemptionStatus);
      },
    );

    // Clean up subscription when component unmounts
    return () => {
      realtimeService.unsubscribe(subscriptionId);
    };
  }, [requestId]);

  // We've disabled real-time status notifications to reduce distractions
  // Determine the current step based on the status
  const statusToIndex = {
    pending: 0,
    approved: 1,
    processing: 2,
    completed: 3,
  };

  const currentIndex = statusToIndex[currentStatus];

  // Update steps based on current status
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));

  // Calculate progress based on current status
  const calculatedProgress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Redemption Status</h3>

      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progress || calculatedProgress} className="h-2" />
      </div>

      {/* Status steps */}
      <div className="flex justify-between">
        {updatedSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center w-1/4">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full mb-2",
                step.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : step.status === "current"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400",
              )}
            >
              {step.icon}
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "font-medium",
                  step.status === "completed"
                    ? "text-green-600"
                    : step.status === "current"
                      ? "text-blue-600"
                      : "text-gray-400",
                )}
              >
                {step.label}
              </p>
              {step.status === "current" && (
                <span className="text-xs text-blue-600 mt-1 inline-block">
                  In progress
                </span>
              )}
            </div>

            {/* Connector line between steps */}
            {index < updatedSteps.length - 1 && (
              <div
                className="absolute hidden md:block"
                style={{
                  left: `calc(${(index + 0.5) * 25}% + 1rem)`,
                  right: `calc(${(updatedSteps.length - index - 1.5) * 25}% + 1rem)`,
                  top: "6.5rem",
                  height: "2px",
                  background:
                    step.status === "completed" ? "#10b981" : "#e5e7eb",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Status message */}
      <div className="mt-8 p-4 rounded-lg bg-gray-50">
        {currentStatus === "pending" && (
          <div className="flex items-center text-amber-600">
            <Clock className="h-5 w-5 mr-2" />
            <p>
              Your redemption request is pending approval. You will be notified
              once it's approved.
            </p>
          </div>
        )}
        {currentStatus === "approved" && (
          <div className="flex items-center text-blue-600">
            <Check className="h-5 w-5 mr-2" />
            <p>
              Your redemption request has been approved and is now being
              processed.
            </p>
          </div>
        )}
        {currentStatus === "processing" && (
          <div className="flex items-center text-purple-600">
            <ArrowRight className="h-5 w-5 mr-2" />
            <p>
              Your redemption is being processed. This may take 1-3 business
              days.
            </p>
          </div>
        )}
        {currentStatus === "completed" && (
          <div className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            <p>
              Your redemption has been completed. The funds have been
              transferred to your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTracker;
