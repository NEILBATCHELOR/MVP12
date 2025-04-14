import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Clock,
  Shield,
  User,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
} from "lucide-react";
import {
  approveRedemptionRequest,
  rejectRedemptionRequest,
} from "@/lib/api/approvalApi";

interface Approver {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  approved: boolean;
  timestamp?: string;
  signature?: string;
}

interface MultiSignatureWorkflowProps {
  requestId: string;
  approvers: Approver[];
  requiredApprovals: number;
  currentUserApproverId?: string;
  status: "Pending" | "Approved" | "Processing" | "Completed" | "Rejected";
  onApprovalChange?: (approvers: Approver[]) => void;
  readOnly?: boolean;
}

const MultiSignatureWorkflow = ({
  requestId,
  approvers = [],
  requiredApprovals = 3,
  currentUserApproverId = "",
  status = "Pending",
  onApprovalChange = () => {},
  readOnly = false,
}: MultiSignatureWorkflowProps) => {
  const { addNotification } = useNotifications();
  const [localApprovers, setLocalApprovers] = useState<Approver[]>(approvers);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalApprovers(approvers);
  }, [approvers]);

  // Calculate approval progress
  const approvedCount = localApprovers.filter((a) => a.approved).length;
  const progressPercentage = (approvedCount / requiredApprovals) * 100;

  // Format timestamp to readable format
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
  };

  // Check if current user is an approver
  const currentUserApprover = localApprovers.find(
    (a) => a.id === currentUserApproverId,
  );

  // Check if current user has already approved
  const hasCurrentUserApproved = currentUserApprover?.approved || false;

  // Handle approve action
  const handleApprove = async () => {
    if (!currentUserApproverId || hasCurrentUserApproved || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      // In a real app, this would include 2FA or other security measures
      if (showVerificationInput) {
        // Simulate verification code check
        if (verificationCode !== "123456") {
          addNotification({
            title: "Verification Failed",
            description: "Invalid verification code. Please try again.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Call API to approve the request
      const result = await approveRedemptionRequest(
        requestId,
        currentUserApproverId,
      );

      if (result) {
        // Update local state
        const updatedApprovers = localApprovers.map((approver) =>
          approver.id === currentUserApproverId
            ? {
                ...approver,
                approved: true,
                timestamp: new Date().toISOString(),
              }
            : approver,
        );

        setLocalApprovers(updatedApprovers);
        onApprovalChange(updatedApprovers);

        // Show success notification
        addNotification({
          title: "Approval Successful",
          description:
            "You have successfully approved this redemption request.",
        });

        // Check if we've reached the required approvals
        const newApprovedCount = updatedApprovers.filter(
          (a) => a.approved,
        ).length;
        if (newApprovedCount >= requiredApprovals) {
          addNotification({
            title: "Approval Threshold Met",
            description:
              "This redemption request has received all required approvals and will now be processed.",
          });
        }
      }
    } catch (error) {
      console.error("Error approving request:", error);
      addNotification({
        title: "Approval Failed",
        description:
          "There was an error processing your approval. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsApproveDialogOpen(false);
      setShowVerificationInput(false);
      setVerificationCode("");
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (
      !currentUserApproverId ||
      hasCurrentUserApproved ||
      isSubmitting ||
      !rejectionReason
    )
      return;

    setIsSubmitting(true);
    try {
      // Call API to reject the request
      const result = await rejectRedemptionRequest(
        requestId,
        currentUserApproverId,
        rejectionReason,
      );

      if (result) {
        // Show success notification
        addNotification({
          title: "Request Rejected",
          description: "You have rejected this redemption request.",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      addNotification({
        title: "Rejection Failed",
        description:
          "There was an error processing your rejection. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    }
  };

  // Request verification code
  const requestVerificationCode = () => {
    // In a real app, this would send a code via SMS or email
    setShowVerificationInput(true);
    addNotification({
      title: "Verification Code Sent",
      description:
        "A verification code has been sent to your registered email/phone. Use code 123456 for this demo.",
    });
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Multi-Signature Approval Workflow
          </CardTitle>
          <Badge
            variant={
              status === "Approved" || status === "Completed"
                ? "default"
                : "outline"
            }
            className={status === "Rejected" ? "bg-red-100 text-red-800" : ""}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Approval Progress: {approvedCount} of {requiredApprovals} required
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress
            value={progressPercentage > 100 ? 100 : progressPercentage}
            className="h-2"
          />
        </div>

        {/* Security notice */}
        <div className="p-3 bg-blue-50 rounded-md flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              Multi-Signature Security
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              This redemption request requires {requiredApprovals} separate
              approvals from authorized signers. Each approval is
              cryptographically signed and recorded on the blockchain for
              security and audit purposes.
            </p>
          </div>
        </div>

        {/* Approvers list */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Approval Guardians
          </h3>
          <div className="space-y-3">
            {localApprovers.map((approver) => (
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
                            <Check className="h-3 w-3 mr-1" />
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
                    {approver.signature && (
                      <div className="mt-1 text-xs">
                        <span className="font-mono">
                          Signature: {approver.signature.substring(0, 10)}...
                        </span>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Approval actions */}
        {!readOnly && currentUserApproverId && status === "Pending" && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">
                  {hasCurrentUserApproved
                    ? "You have approved this request"
                    : "Your approval is required"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {hasCurrentUserApproved
                    ? "Your digital signature has been recorded"
                    : "Please review the request details before approving"}
                </p>
              </div>

              {!hasCurrentUserApproved && (
                <div className="flex space-x-2">
                  <AlertDialog
                    open={isRejectDialogOpen}
                    onOpenChange={setIsRejectDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Reject Redemption Request
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this redemption
                          request? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label
                          htmlFor="rejection-reason"
                          className="mb-2 block"
                        >
                          Reason for Rejection (Required)
                        </Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Please provide a reason for rejecting this request"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          disabled={isSubmitting || !rejectionReason.trim()}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          {isSubmitting ? "Processing..." : "Reject Request"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Dialog
                    open={isApproveDialogOpen}
                    onOpenChange={setIsApproveDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Lock className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Redemption Request</DialogTitle>
                        <DialogDescription>
                          You are about to approve redemption request{" "}
                          {requestId}. This action will be recorded on the
                          blockchain.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="p-3 bg-amber-50 rounded-md flex items-start">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-800">
                              Security Verification
                            </h4>
                            <p className="text-xs text-amber-700 mt-1">
                              For security purposes, we require additional
                              verification before processing your approval.
                            </p>
                          </div>
                        </div>

                        {showVerificationInput ? (
                          <div className="space-y-2">
                            <Label htmlFor="verification-code">
                              Enter Verification Code
                            </Label>
                            <div className="flex space-x-2">
                              <input
                                id="verification-code"
                                type="text"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                                placeholder="123456"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                maxLength={6}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={requestVerificationCode}
                              >
                                Resend
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              For this demo, use code: 123456
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Button onClick={requestVerificationCode}>
                              <Shield className="h-4 w-4 mr-2" />
                              Request Verification Code
                            </Button>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Legal Disclaimer
                          </h4>
                          <p className="text-xs text-gray-500">
                            By approving this request, you certify that you have
                            reviewed all details and confirm that this
                            redemption complies with all applicable regulations
                            and fund policies. Your digital signature will be
                            recorded as part of the multi-signature approval
                            process.
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsApproveDialogOpen(false);
                            setShowVerificationInput(false);
                            setVerificationCode("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApprove}
                          disabled={
                            isSubmitting ||
                            (showVerificationInput && !verificationCode)
                          }
                        >
                          {isSubmitting ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Confirm Approval
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approval threshold indicator */}
        <div className="pt-4 border-t border-gray-200">
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

        {/* Audit trail link */}
        <div className="pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            View Approval Audit Trail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiSignatureWorkflow;
