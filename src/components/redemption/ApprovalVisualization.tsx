import React, { useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { CheckCircle, Clock, User } from "lucide-react";

interface ApproverInfo {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  approved: boolean;
  timestamp?: string;
}

interface ApprovalVisualizationProps {
  approvers?: ApproverInfo[];
  requiredApprovals?: number;
  title?: string;
}

const ApprovalVisualization = ({
  approvers = [
    {
      id: "1",
      name: "Jane Cooper",
      role: "Fund Manager",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=jane",
      approved: true,
      timestamp: "2023-06-15T14:30:00Z",
    },
    {
      id: "2",
      name: "Robert Fox",
      role: "Compliance Officer",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=robert",
      approved: true,
      timestamp: "2023-06-15T16:45:00Z",
    },
    {
      id: "3",
      name: "Esther Howard",
      role: "Treasury Manager",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=esther",
      approved: false,
    },
    {
      id: "4",
      name: "Cameron Williamson",
      role: "Board Member",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=cameron",
      approved: false,
    },
  ],
  requiredApprovals = 3,
  title = "Multi-Signature Approval Status",
}: ApprovalVisualizationProps) => {
  const { addNotification } = useNotifications();

  // We've disabled real-time notifications to reduce distractions
  // Calculate approval progress
  const approvedCount = approvers.filter(
    (approver) => approver.approved,
  ).length;
  const progressPercentage = (approvedCount / requiredApprovals) * 100;

  // Format timestamp to readable format
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full max-w-[600px] bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Approval Progress: {approvedCount} of {requiredApprovals} required
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

        {/* Approvers list */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Approvers</h3>
          <div className="grid gap-3">
            {approvers.map((approver) => (
              <TooltipProvider key={approver.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={approver.avatarUrl}
                            alt={approver.name}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{approver.name}</p>
                          <p className="text-xs text-gray-500">
                            {approver.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {approver.approved ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
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
                  </TooltipTrigger>
                  <TooltipContent>
                    {approver.approved
                      ? `Approved on ${formatTimestamp(approver.timestamp)}`
                      : "Awaiting approval"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

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

export default ApprovalVisualization;
