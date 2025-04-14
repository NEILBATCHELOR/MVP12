import React, { useState } from "react";
import {
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  Users,
  Download,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RedemptionRequest } from "@/lib/api/approvalApi";

interface RedemptionRequestListProps {
  requests?: RedemptionRequest[];
  onViewDetails?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "secondary";
    case "Approved":
      return "default";
    case "Processing":
      return "secondary";
    case "Completed":
      return "default";
    case "Rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

const RedemptionRequestList = ({
  requests = [
    {
      id: "1",
      requestDate: "2023-06-15",
      tokenAmount: 5000,
      tokenType: "ERC-20",
      redemptionType: "Standard",
      status: "Pending",
      sourceWalletAddress: "0x1a2b3c4d5e6f7g8h9i0j",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j",
      conversionRate: 0.85,
      investorName: "John Smith",
      investorId: "INV-78901",
      isBulkRedemption: false,
      approvers: [],
      requiredApprovals: 2
    },
    {
      id: "2",
      requestDate: "2023-06-10",
      tokenAmount: 10000,
      tokenType: "ERC-721",
      redemptionType: "Express",
      status: "Approved",
      sourceWalletAddress: "0x9i8h7g6f5e4d3c2b1a0",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j",
      conversionRate: 1.2,
      investorName: "Sarah Johnson",
      investorId: "INV-45678",
      isBulkRedemption: false,
      approvers: [],
      requiredApprovals: 2
    },
    {
      id: "3",
      requestDate: "2023-06-05",
      tokenAmount: 7500,
      tokenType: "ERC-1155",
      redemptionType: "Interval",
      status: "Completed",
      sourceWalletAddress: "0x2b3c4d5e6f7g8h9i0j1a",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j",
      conversionRate: 0.95,
      isBulkRedemption: true,
      investorCount: 3,
      approvers: [],
      requiredApprovals: 2
    },
    {
      id: "4",
      requestDate: "2023-06-01",
      tokenAmount: 3000,
      tokenType: "ERC-1400",
      redemptionType: "Standard",
      status: "Rejected",
      sourceWalletAddress: "0x8h9i0j1a2b3c4d5e6f7g",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j",
      conversionRate: 0.75,
      investorName: "Michael Brown",
      investorId: "INV-23456",
      isBulkRedemption: false,
      approvers: [],
      requiredApprovals: 2
    },
    {
      id: "5",
      requestDate: "2023-05-28",
      tokenAmount: 12000,
      tokenType: "ERC-4626",
      redemptionType: "Express",
      status: "Processing",
      sourceWalletAddress: "0x7g6f5e4d3c2b1a0j9i8h",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j",
      conversionRate: 1.05,
      isBulkRedemption: true,
      investorCount: 5,
      approvers: [],
      requiredApprovals: 2
    },
  ],
  onViewDetails = (id) => console.log(`View details for request ${id}`),
}: RedemptionRequestListProps) => {
  const [sortColumn, setSortColumn] = useState<string>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter requests based on selected filters
  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType =
      typeFilter === "all" || request.redemptionType === typeFilter;
    return matchesStatus && matchesType;
  });

  // Sort filtered requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[sortColumn as keyof RedemptionRequest];
    const bValue = b[sortColumn as keyof RedemptionRequest];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Redemption Requests
        </h2>
        <div className="flex space-x-2">
          <Select
            defaultValue="all"
            onValueChange={setStatusFilter}
            value={statusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue="all"
            onValueChange={setTypeFilter}
            value={typeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Express">Express</SelectItem>
              <SelectItem value="Interval">Interval</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-md border min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("id")}
                    className="flex items-center"
                  >
                    ID <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("requestDate")}
                    className="flex items-center"
                  >
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tokenAmount")}
                    className="flex items-center"
                  >
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tokenType")}
                    className="flex items-center"
                  >
                    Token <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center"
                  >
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">Investor</TableHead>
                <TableHead className="w-[120px]">Source Wallet</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {request.tokenAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">TOKENS</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{request.tokenType}</div>
                    <div className="text-xs text-gray-500">
                      {request.redemptionType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(request.status)}
                      className="whitespace-nowrap"
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.isBulkRedemption ? (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm font-medium">
                          {request.investorCount} investors
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium">
                          {request.investorName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.investorId}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {`${request.sourceWalletAddress.substring(0, 6)}...${request.sourceWalletAddress.substring(request.sourceWalletAddress.length - 4)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(request.id)}
                        aria-label={`View details for request ${request.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewDetails(request.id)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {request.status === "Pending" && (
                            <DropdownMenuItem>Approve Request</DropdownMenuItem>
                          )}
                          {request.status === "Approved" && (
                            <DropdownMenuItem>Process Request</DropdownMenuItem>
                          )}
                          {request.status !== "Completed" && (
                            <DropdownMenuItem className="text-red-600">
                              Reject Request
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              // Get the request and pass it to the export utility
                              const requestToExport = requests.find(
                                (r) => r.id === request.id,
                              );
                              if (requestToExport) {
                                import("@/utils/exportUtils").then(
                                  ({ redemptionRequestToCsv, downloadCsv }) => {
                                    const csv =
                                      redemptionRequestToCsv(requestToExport as import("@/lib/api/approvalApi").RedemptionRequest);
                                    downloadCsv(
                                      csv,
                                      `redemption-${requestToExport.id}.csv`,
                                    );
                                  },
                                );
                              }
                            }}
                          >
                            Export Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {sortedRequests.length} of {requests.length} requests
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              import("@/utils/exportUtils").then(
                ({ redemptionRequestsToCsv, downloadCsv }) => {
                  const csv = redemptionRequestsToCsv(sortedRequests as import("@/lib/api/approvalApi").RedemptionRequest[]);
                  downloadCsv(
                    csv,
                    `redemption-requests-${new Date().toISOString().split("T")[0]}.csv`,
                  );
                },
              );
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RedemptionRequestList;
