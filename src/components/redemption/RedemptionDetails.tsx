import React, { useState, useEffect } from "react";
import { useRealtimeStatus } from "@/hooks/useRealtimeStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionHistory from "./TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Copy,
  CheckCircle,
  Users,
} from "lucide-react";
import ExportButton from "./ExportButton";

interface RedemptionDetailsProps {
  id?: string;
  status?: "pending" | "approved" | "processing" | "completed";
  amount?: number;
  tokenSymbol?: string;
  tokenType?: string;
  requestDate?: string;
  completionDate?: string;
  redemptionType?: string;
  sourceWalletAddress?: string;
  destinationWalletAddress?: string;
  conversionRate?: number;
  investorName?: string;
  investorId?: string;
  isBulkRedemption?: boolean;
  bulkInvestors?: Array<{ name: string; id: string }>;
  onBack?: () => void;
}

const RedemptionDetails = ({
  id = "RDM-12345",
  status: initialStatus = "approved",
  amount = 5000,
  tokenSymbol = "USDC",
  tokenType = "ERC-20",
  requestDate = "2023-06-15T10:30:00Z",
  completionDate = "",
  redemptionType = "Standard",
  sourceWalletAddress = "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  destinationWalletAddress = "0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t",
  conversionRate = 0.85,
  investorName = "John Smith",
  investorId = "INV-78901",
  isBulkRedemption = false,
  bulkInvestors = [
    { name: "Jane Doe", id: "INV-12345" },
    { name: "Robert Johnson", id: "INV-23456" },
    { name: "Sarah Williams", id: "INV-34567" },
  ],
  onBack = () => {},
}: RedemptionDetailsProps) => {
  // Use the real-time status hook to get live updates
  const { status, isLoading } = useRealtimeStatus(id, {
    initialStatus: initialStatus as any,
    notifyOnChange: true,
  });
  const formatDate = (dateString: string) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Mock components to replace the imported ones
  const StatusTrackerMock = ({ status }: { status?: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Status Tracker</h3>
      <div className="flex justify-between items-center">
        <div
          className={`h-2 w-full rounded-full bg-gray-200 relative overflow-hidden`}
        >
          <div
            className={`h-full ${status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
            style={{
              width:
                status === "pending"
                  ? "25%"
                  : status === "approved"
                    ? "50%"
                    : status === "processing"
                      ? "75%"
                      : "100%",
            }}
          />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span>Requested</span>
        <span>Approved</span>
        <span>Processing</span>
        <span>Completed</span>
      </div>
    </div>
  );

  const ApprovalVisualizationMock = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="font-medium">Fund Manager</p>
            <p className="text-sm text-gray-500">
              Approved on {formatDate("2023-06-16T09:15:00Z")}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="font-medium">Compliance Officer</p>
            <p className="text-sm text-gray-500">
              Approved on {formatDate("2023-06-17T14:30:00Z")}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="h-4 w-4" />
          </div>
          <div className="ml-4">
            <p className="font-medium">Treasury Department</p>
            <p className="text-sm text-gray-500">Pending approval</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TransactionDetailsPanelMock = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">
            Transaction Hash
          </h4>
          <div className="flex items-center mt-1">
            <p className="text-base font-mono truncate">
              0xabcdef1234567890abcdef1234567890
            </p>
            <Button variant="ghost" size="sm" className="ml-2">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Block Number</h4>
          <p className="text-base">12,345,678</p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Gas Used</h4>
          <p className="text-base">125,000 gwei</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Gas Price</h4>
          <p className="text-base">20 gwei</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-medium text-gray-500">Transaction Fee</h4>
        <p className="text-base">0.0025 ETH</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Redemption Request Details</h1>
        <Badge className={`ml-4 ${getStatusColor(status)} capitalize`}>
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Request ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {amount.toLocaleString()} {tokenSymbol}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Request Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(requestDate)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTrackerMock status={status} />

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Approval Process</h3>
                <ApprovalVisualizationMock />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Redemption Type
                    </h4>
                    <p className="text-base">{redemptionType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Status
                    </h4>
                    <p className="text-base capitalize">{status}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Token Type
                    </h4>
                    <p className="text-base">{tokenType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Conversion Rate
                    </h4>
                    <p className="text-base">1:{conversionRate} USDC</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Request Date
                    </h4>
                    <p className="text-base">{formatDate(requestDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Completion Date
                    </h4>
                    <p className="text-base">{formatDate(completionDate)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Source Wallet (Investor)
                  </h4>
                  <div className="flex items-center mt-1">
                    <p className="text-base font-mono truncate">
                      {sourceWalletAddress}
                    </p>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Destination Wallet (Issuer)
                  </h4>
                  <div className="flex items-center mt-1">
                    <p className="text-base font-mono truncate">
                      {destinationWalletAddress}
                    </p>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {!isBulkRedemption ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Investor Name
                      </h4>
                      <p className="text-base">{investorName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Investor ID
                      </h4>
                      <p className="text-base">{investorId}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500">
                        Bulk Redemption Investors
                      </h4>
                      <Badge variant="outline">
                        {bulkInvestors.length} Investors
                      </Badge>
                    </div>
                    <div className="mt-2 border rounded-md divide-y">
                      {bulkInvestors.map((investor, index) => (
                        <div
                          key={index}
                          className="p-2 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {investor.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {investor.id}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {(amount / bulkInvestors.length).toLocaleString()}{" "}
                            {tokenSymbol}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionDetailsPanelMock />

              {status === "completed" && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <TransactionHistory requestId={id} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Redemptions
        </Button>

        <div className="flex items-center gap-2">
          {status === "pending" && (
            <Button variant="destructive">Cancel Request</Button>
          )}

          {status === "completed" && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Redemption Complete
            </div>
          )}

          {/* Add export button */}
          <ExportButton
            request={{
              id,
              requestDate,
              tokenAmount: amount,
              tokenType,
              redemptionType,
              status: status as any,
              sourceWalletAddress,
              destinationWalletAddress,
              conversionRate,
              investorName,
              investorId,
              approvers: [],
              requiredApprovals: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RedemptionDetails;
