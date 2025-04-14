import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Check, Clock, AlertTriangle, Shield } from "lucide-react";
import { getAllApprovers } from "@/lib/api/approvalApi";
import { Approver } from "@/types/centralModels";

interface ApproverListProps {
  requestId?: string;
  approvers?: Approver[];
  requiredApprovals?: number;
  onSelectApprover?: (approverId: string) => void;
}

const ApproverList = ({
  requestId,
  approvers = [],
  requiredApprovals = 3,
  onSelectApprover = () => {},
}: ApproverListProps) => {
  const [allApprovers, setAllApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApprovers = async () => {
      if (approvers.length > 0) {
        setAllApprovers(approvers);
        setLoading(false);
        return;
      }

      try {
        const data = await getAllApprovers();
        setAllApprovers(data);
      } catch (error) {
        console.error("Error loading approvers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovers();
  }, [approvers]);

  // Format timestamp to readable format
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate approval progress
  const approvedCount = allApprovers.filter(
    (approver) => approver.approved,
  ).length;
  const progressPercentage = (approvedCount / requiredApprovals) * 100;

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Approval Guardians
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {approvedCount} of {requiredApprovals} Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Approval Progress
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${progressPercentage > 100 ? 100 : progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p>Loading approvers...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allApprovers.map((approver) => (
              <div
                key={approver.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => onSelectApprover(approver.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={approver.avatarUrl} alt={approver.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{approver.name}</p>
                    <p className="text-xs text-gray-500">{approver.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {approver.approved ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approved{" "}
                      {approver.timestamp &&
                        `on ${formatTimestamp(approver.timestamp)}`}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-600 border-gray-200"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval threshold indicator */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {approvedCount >= requiredApprovals
                ? "Approval threshold met"
                : `${requiredApprovals - approvedCount} more approval${requiredApprovals - approvedCount !== 1 ? "s" : ""} needed`}
            </span>
            <Badge
              variant={
                approvedCount >= requiredApprovals ? "default" : "outline"
              }
              className={
                approvedCount >= requiredApprovals
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }
            >
              {approvedCount >= requiredApprovals
                ? "Ready for Processing"
                : "In Progress"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApproverList;
