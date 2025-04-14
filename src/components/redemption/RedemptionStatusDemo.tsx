import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusTracker from "./StatusTracker";
import { updateRedemptionStatus } from "@/lib/api/approvalApi";

interface RedemptionStatusDemoProps {
  requestId?: string;
}

const RedemptionStatusDemo: React.FC<RedemptionStatusDemoProps> = ({
  requestId = "RDM-12345",
}) => {
  const [status, setStatus] = useState<string>("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Update the status in the API
      await updateRedemptionStatus(requestId, newStatus as any);
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Redemption Status Demo</CardTitle>
        <CardDescription>
          This demo allows you to simulate status changes to test real-time
          updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusTracker requestId={requestId} currentStatus={status as any} />

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
          <div className="w-full sm:w-1/3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => handleStatusChange(status)}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          In a real application, status changes would be triggered by backend
          processes and approvals.
        </p>
      </CardFooter>
    </Card>
  );
};

export default RedemptionStatusDemo;
