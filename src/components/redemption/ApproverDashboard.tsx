import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Check,
  Clock,
  AlertTriangle,
  User,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  getPendingApprovalsForApprover,
  getApprovalHistoryForApprover,
  approveRedemptionRequest,
  rejectRedemptionRequest,
  RedemptionRequest,
} from "@/lib/api/approvalApi";

interface ApproverDashboardProps {
  approverId: string;
  approverName?: string;
  approverRole?: string;
  approverAvatar?: string;
}

const ApproverDashboard = ({
  approverId = "1", // Default to Jane Cooper (Fund Manager)
  approverName = "Jane Cooper",
  approverRole = "Fund Manager",
  approverAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=jane",
}: ApproverDashboardProps) => {
  const { addNotification } = useNotifications();
  const [pendingApprovals, setPendingApprovals] = useState<RedemptionRequest[]>(
    [],
  );
  const [approvalHistory, setApprovalHistory] = useState<RedemptionRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] =
    useState<RedemptionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pending, history] = await Promise.all([
          getPendingApprovalsForApprover(approverId),
          getApprovalHistoryForApprover(approverId),
        ]);
        setPendingApprovals(pending);
        setApprovalHistory(history);
      } catch (error: any) {
        console.error("Error loading approver data:", error);
        addNotification({
          title: "Error Loading Data",
          description:
            "There was a problem loading your approval requests. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [approverId]);

  // Handle approval
  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const result = await approveRedemptionRequest(
        selectedRequest.id,
        approverId,
      );
      if (result) {
        // Update local state
        setPendingApprovals((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id),
        );
        setApprovalHistory((prev) => [result, ...prev]);

        // Approval notifications disabled to reduce distractions
      }
    } catch (error: any) {
      console.error("Error approving request:", error);
      addNotification({
        title: "Approval Failed",
        description:
          "There was a problem approving the request. Please try again.",
      });
    } finally {
      setIsApproveDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    try {
      const result = await rejectRedemptionRequest(
        selectedRequest.id,
        approverId,
        rejectionReason,
      );
      if (result) {
        // Update local state
        setPendingApprovals((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id),
        );

        // Rejection notification disabled to reduce distractions
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      addNotification({
        title: "Rejection Failed",
        description:
          "There was a problem rejecting the request. Please try again.",
      });
    } finally {
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort requests
  const filteredPendingRequests = pendingApprovals
    .filter((request) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.id.toLowerCase().includes(searchLower) ||
        request.investorName?.toLowerCase().includes(searchLower) ||
        false ||
        request.investorId?.toLowerCase().includes(searchLower) ||
        false
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof RedemptionRequest];
      const bValue = b[sortField as keyof RedemptionRequest];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const filteredHistoryRequests = approvalHistory
    .filter((request) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.id.toLowerCase().includes(searchLower) ||
        request.investorName?.toLowerCase().includes(searchLower) ||
        false ||
        request.investorId?.toLowerCase().includes(searchLower) ||
        false
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof RedemptionRequest];
      const bValue = b[sortField as keyof RedemptionRequest];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={approverAvatar} alt={approverName} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{approverName}</h1>
            <p className="text-gray-500">{approverRole} Dashboard</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-blue-600 bg-blue-50 border-blue-200"
        >
          {pendingApprovals.length} Pending Approvals
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Approval History ({approvalHistory.length})
          </TabsTrigger>
        </TabsList>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ID, investor name, or investor ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading pending approvals...</p>
            </div>
          ) : filteredPendingRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                No Pending Approvals
              </h3>
              <p className="text-gray-500 mt-1">
                You have no redemption requests waiting for your approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPendingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{request.id}</CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          Pending
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested: {formatDate(request.requestDate)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-500">
                          Investor
                        </Label>
                        <p className="font-medium">
                          {request.investorName || "Multiple Investors"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.investorId ||
                            (request.isBulkRedemption
                              ? `${request.investorCount} investors`
                              : "")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Amount</Label>
                        <p className="font-medium">
                          {request.tokenAmount.toLocaleString()} Tokens
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.tokenType} • {request.redemptionType}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">
                          Approvals
                        </Label>
                        <p className="font-medium">
                          {request.approvers.filter((a) => a.approved).length}{" "}
                          of {request.requiredApprovals} Required
                        </p>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(request.approvers.filter((a) => a.approved).length / request.requiredApprovals) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-end space-x-3">
                      <AlertDialog
                        open={
                          isRejectDialogOpen &&
                          selectedRequest?.id === request.id
                        }
                        onOpenChange={(open) => {
                          setIsRejectDialogOpen(open);
                          if (!open) setSelectedRequest(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setSelectedRequest(request)}
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
                              Reason for Rejection
                            </Label>
                            <Textarea
                              id="rejection-reason"
                              placeholder="Please provide a reason for rejecting this request"
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                              className="min-h-[100px]"
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleReject}
                              disabled={!rejectionReason.trim()}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Reject Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Dialog
                        open={
                          isApproveDialogOpen &&
                          selectedRequest?.id === request.id
                        }
                        onOpenChange={(open) => {
                          setIsApproveDialogOpen(open);
                          if (!open) setSelectedRequest(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedRequest(request)}>
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Approve Redemption Request
                            </DialogTitle>
                            <DialogDescription>
                              Please review the details below before approving
                              this redemption request.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Request ID
                                </Label>
                                <p className="font-medium">{request.id}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Request Date
                                </Label>
                                <p className="font-medium">
                                  {formatDate(request.requestDate)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Investor
                                </Label>
                                <p className="font-medium">
                                  {request.investorName || "Multiple Investors"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Amount
                                </Label>
                                <p className="font-medium">
                                  {request.tokenAmount.toLocaleString()} Tokens
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Token Type
                                </Label>
                                <p className="font-medium">
                                  {request.tokenType}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">
                                  Redemption Type
                                </Label>
                                <p className="font-medium">
                                  {request.redemptionType}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Source Wallet
                              </Label>
                              <p className="font-mono text-sm truncate">
                                {request.sourceWalletAddress}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsApproveDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleApprove}>
                              Confirm Approval
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading approval history...</p>
            </div>
          ) : filteredHistoryRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                No Approval History
              </h3>
              <p className="text-gray-500 mt-1">
                You haven't approved any redemption requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistoryRequests.map((request) => {
                // Find this approver's approval
                const myApproval = request.approvers.find(
                  (a) => a.id === approverId,
                );

                return (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 pb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">
                            {request.id}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={
                              request.status === "Approved"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : request.status === "Processing"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : request.status === "Completed"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Approved:{" "}
                          {myApproval?.timestamp
                            ? formatDate(myApproval.timestamp)
                            : "Unknown"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">
                            Investor
                          </Label>
                          <p className="font-medium">
                            {request.investorName || "Multiple Investors"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.investorId ||
                              (request.isBulkRedemption
                                ? `${request.investorCount} investors`
                                : "")}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">
                            Amount
                          </Label>
                          <p className="font-medium">
                            {request.tokenAmount.toLocaleString()} Tokens
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.tokenType} • {request.redemptionType}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">
                            Approvals
                          </Label>
                          <p className="font-medium">
                            {request.approvers.filter((a) => a.approved).length}{" "}
                            of {request.requiredApprovals} Required
                          </p>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${(request.approvers.filter((a) => a.approved).length / request.requiredApprovals) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApproverDashboard;
