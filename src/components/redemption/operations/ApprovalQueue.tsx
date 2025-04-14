import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  ArrowUpDown,
  Check,
  X,
  Clock,
  Eye,
  AlertTriangle,
  Shield,
  User,
} from "lucide-react";
import { RedemptionRequest } from "@/lib/api/approvalApi";
import { Approver } from "@/types/centralModels";

interface ApprovalQueueProps {
  currentApproverId?: string;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  currentApproverId = "1", // Default to Jane Cooper (Fund Manager)
}) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] =
    useState<RedemptionRequest | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for pending approvals
  const pendingRequests: RedemptionRequest[] = [
    {
      id: "RDM-12345",
      requestDate: "2023-06-15T10:30:00Z",
      tokenAmount: 5000,
      tokenType: "ERC-20",
      redemptionType: "Standard",
      status: "Pending",
      sourceWalletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t",
      conversionRate: 0.85,
      investorName: "John Smith",
      investorId: "INV-78901",
      approvers: [
        {
          id: "1",
          name: "Jane Cooper",
          role: "Fund Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=jane",
          approved: false,
        },
        {
          id: "2",
          name: "Robert Fox",
          role: "Compliance Officer",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=robert",
          approved: false,
        },
        {
          id: "3",
          name: "Esther Howard",
          role: "Treasury Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=esther",
          approved: false,
        },
      ],
      requiredApprovals: 2,
    },
    {
      id: "RDM-67890",
      requestDate: "2023-06-10T14:45:00Z",
      tokenAmount: 10000,
      tokenType: "ERC-721",
      redemptionType: "Express",
      status: "Pending",
      sourceWalletAddress: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      destinationWalletAddress: "0x8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s",
      conversionRate: 1.2,
      investorName: "Sarah Johnson",
      investorId: "INV-45678",
      approvers: [
        {
          id: "1",
          name: "Jane Cooper",
          role: "Fund Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=jane",
          approved: true,
          timestamp: "2023-06-12T09:30:00Z",
        },
        {
          id: "2",
          name: "Robert Fox",
          role: "Compliance Officer",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=robert",
          approved: false,
        },
        {
          id: "3",
          name: "Esther Howard",
          role: "Treasury Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=esther",
          approved: false,
        },
      ],
      requiredApprovals: 2,
    },
  ];

  // Mock data for completed approvals
  const completedRequests: RedemptionRequest[] = [
    {
      id: "RDM-54321",
      requestDate: "2023-06-05T09:15:00Z",
      tokenAmount: 7500,
      tokenType: "ERC-20",
      redemptionType: "Standard",
      status: "Approved",
      sourceWalletAddress: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      destinationWalletAddress: "0x7a6b5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r",
      conversionRate: 0.9,
      investorName: "Michael Brown",
      investorId: "INV-23456",
      approvers: [
        {
          id: "1",
          name: "Jane Cooper",
          role: "Fund Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=jane",
          approved: true,
          timestamp: "2023-06-06T10:20:00Z",
        },
        {
          id: "2",
          name: "Robert Fox",
          role: "Compliance Officer",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=robert",
          approved: true,
          timestamp: "2023-06-06T11:45:00Z",
        },
        {
          id: "3",
          name: "Esther Howard",
          role: "Treasury Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=esther",
          approved: false,
        },
      ],
      requiredApprovals: 2,
    },
    {
      id: "RDM-78901",
      requestDate: "2023-06-01T16:45:00Z",
      tokenAmount: 12000,
      tokenType: "ERC-20",
      redemptionType: "Interval",
      status: "Rejected",
      sourceWalletAddress: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
      destinationWalletAddress: "0x5a4b3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r",
      conversionRate: 0.95,
      investorName: "Emily White",
      investorId: "INV-34567",
      approvers: [
        {
          id: "1",
          name: "Jane Cooper",
          role: "Fund Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=jane",
          approved: false,
        },
        {
          id: "2",
          name: "Robert Fox",
          role: "Compliance Officer",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=robert",
          approved: false,
        },
        {
          id: "3",
          name: "Esther Howard",
          role: "Treasury Manager",
          avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=esther",
          approved: false,
        },
      ],
      requiredApprovals: 2,
      notes: "KYC verification expired"
    },
  ];

  // Get requests based on active tab
  const getRequests = () => {
    return activeTab === "pending" ? pendingRequests : completedRequests;
  };

  // Filter and sort requests
  const filteredRequests = getRequests()
    .filter((request) => {
      // Apply status filter
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          request.id.toLowerCase().includes(searchLower) ||
          request.investorName?.toLowerCase().includes(searchLower) ||
          request.investorId?.toLowerCase().includes(searchLower) ||
          false
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortField === "requestDate") {
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "tokenAmount") {
        return sortDirection === "asc"
          ? a.tokenAmount - b.tokenAmount
          : b.tokenAmount - a.tokenAmount;
      } else if (
        sortField === "investorName" &&
        a.investorName &&
        b.investorName
      ) {
        return sortDirection === "asc"
          ? a.investorName.localeCompare(b.investorName)
          : b.investorName.localeCompare(a.investorName);
      }
      return 0;
    });

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

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would call the API to approve the request
      console.log(`Approving request ${selectedRequest.id}`);

      // Close dialog and reset state
      setIsApproveDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would call the API to reject the request
      console.log(
        `Rejecting request ${selectedRequest.id} with reason: ${rejectionReason}`,
      );

      // Close dialog and reset state
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user has already approved
  const hasCurrentUserApproved = (request: RedemptionRequest) => {
    return request.approvers.some(
      (approver) => approver.id === currentApproverId && approver.approved,
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending Approvals
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {pendingRequests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">Approval History</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, investor name, or investor ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("id")}
                        className="flex items-center"
                      >
                        ID <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("investorName")}
                        className="flex items-center"
                      >
                        Investor <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("tokenAmount")}
                        className="flex items-center"
                      >
                        Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("requestDate")}
                        className="flex items-center"
                      >
                        Date <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Approvals</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <p>No requests found</p>
                          {(searchTerm || statusFilter !== "all") && (
                            <p className="text-sm mt-1">
                              Try adjusting your filters
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => {
                      const approvedCount = request.approvers.filter(
                        (a) => a.approved,
                      ).length;
                      const progressPercentage =
                        (approvedCount / request.requiredApprovals) * 100;
                      const userApproved = hasCurrentUserApproved(request);

                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {request.investorName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.investorId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {request.tokenAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.tokenType}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(request.requestDate)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>
                                  {approvedCount}/{request.requiredApprovals}
                                </span>
                                <span className="text-gray-500">
                                  {progressPercentage >= 100
                                    ? "Complete"
                                    : `${Math.round(progressPercentage)}%`}
                                </span>
                              </div>
                              <Progress
                                value={
                                  progressPercentage > 100
                                    ? 100
                                    : progressPercentage
                                }
                                className="h-2"
                              />
                              <div className="flex -space-x-2">
                                {request.approvers.map((approver) => (
                                  <div
                                    key={approver.id}
                                    className={`w-8 h-8 rounded-full border-2 ${approver.approved ? "border-green-500" : "border-gray-200"}`}
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={approver.avatarUrl}
                                        alt={approver.name}
                                      />
                                      <AvatarFallback>
                                        {approver.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  console.log(`View details for ${request.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {activeTab === "pending" && !userApproved && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setIsApproveDialogOpen(true);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setIsRejectDialogOpen(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {activeTab === "pending" && userApproved && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}

                              {activeTab === "completed" &&
                                request.status === "Rejected" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700"
                                  >
                                    Rejected
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Redemption Request</DialogTitle>
            <DialogDescription>
              You are about to approve redemption request {selectedRequest?.id}.
              This action will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-md flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Multi-Signature Security
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  This redemption request requires{" "}
                  {selectedRequest?.requiredApprovals} separate approvals. Your
                  approval will be recorded as part of the multi-signature
                  process.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Request Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Investor:</div>
                <div>{selectedRequest?.investorName}</div>
                <div className="text-gray-500">Amount:</div>
                <div>
                  {selectedRequest?.tokenAmount.toLocaleString()}{" "}
                  {selectedRequest?.tokenType}
                </div>
                <div className="text-gray-500">Date:</div>
                <div>
                  {selectedRequest?.requestDate &&
                    formatDate(selectedRequest.requestDate)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Legal Disclaimer</h4>
              <p className="text-xs text-gray-500">
                By approving this request, you certify that you have reviewed
                all details and confirm that this redemption complies with all
                applicable regulations and fund policies. Your digital signature
                will be recorded as part of the multi-signature approval
                process.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>Confirm Approval</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Redemption Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this redemption request? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="mb-2 block">
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
    </div>
  );
};

export default ApprovalQueue;

// Label component for the rejection reason
const Label = ({
  htmlFor,
  className,
  children,
}: {
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className || ""}`}>
    {children}
  </label>
);
