import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Calendar as CalendarIcon,
  Search,
  ArrowUpDown,
  Eye,
  PlusCircle,
  Clock,
  FileText,
  Calendar,
  Wallet,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import RedemptionForm from "@/components/redemption/RedemptionForm";
import StatusTracker from "@/components/redemption/StatusTracker";
import RedemptionCalendar from "@/components/redemption/calendar/RedemptionCalendar";

interface InvestorDashboardProps {
  investorId?: string;
  investorName?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  notificationCount?: number;
  notifications?: any[];
}

const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  investorId = "INV-78901",
  investorName = "John Smith",
  notificationCount = 0,
  notifications = [],
  className,
  onClick,
  disabled,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showNewRedemptionForm, setShowNewRedemptionForm] = useState(false);

  // Mock data for investor holdings
  const investorHoldings = [
    {
      projectId: "PRJ-001",
      projectName: "Green Energy Fund",
      tokenSymbol: "GEF",
      tokenType: "ERC-20",
      balance: 5000,
      value: 4750, // In USDC
      conversionRate: 0.95,
      hasOpenWindow: true,
      nextWindowDate: addDays(new Date(), 5),
    },
    {
      projectId: "PRJ-003",
      projectName: "Tech Ventures Fund",
      tokenSymbol: "TVF",
      tokenType: "ERC-20",
      balance: 2500,
      value: 2550, // In USDC
      conversionRate: 1.02,
      hasOpenWindow: true,
      nextWindowDate: null,
    },
  ];

  // Mock data for redemption requests
  const redemptionRequests = [
    {
      id: "RDM-12345",
      projectId: "PRJ-001",
      projectName: "Green Energy Fund",
      tokenSymbol: "GEF",
      requestDate: "2023-06-15T10:30:00Z",
      tokenAmount: 1000,
      usdcAmount: 950,
      status: "pending",
      approvalProgress: 1, // Out of 3
      requiredApprovals: 2,
    },
    {
      id: "RDM-23456",
      projectId: "PRJ-003",
      projectName: "Tech Ventures Fund",
      tokenSymbol: "TVF",
      requestDate: "2023-06-10T14:45:00Z",
      tokenAmount: 500,
      usdcAmount: 510,
      status: "approved",
      approvalProgress: 2, // Out of 3
      requiredApprovals: 2,
    },
    {
      id: "RDM-34567",
      projectId: "PRJ-001",
      projectName: "Green Energy Fund",
      tokenSymbol: "GEF",
      requestDate: "2023-05-20T09:15:00Z",
      tokenAmount: 2000,
      usdcAmount: 1900,
      status: "completed",
      approvalProgress: 3, // Out of 3
      requiredApprovals: 2,
      completionDate: "2023-05-25T16:30:00Z",
      transactionHash: "0xabcdef1234567890abcdef1234567890",
    },
  ];

  // Mock data for upcoming redemption windows
  const upcomingWindows = [
    {
      id: "RW-001",
      projectId: "PRJ-001",
      projectName: "Green Energy Fund",
      tokenSymbol: "GEF",
      windowName: "Q2 2023 Redemption",
      startDate: addDays(new Date(), 5),
      endDate: addDays(new Date(), 12),
      navUpdateDate: addDays(new Date(), 3),
      eligibilityStartDate: new Date(),
      eligibilityEndDate: addDays(new Date(), 4),
      status: "upcoming",
    },
  ];

  // Filter and sort redemption requests
  const filteredRequests = redemptionRequests
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
          request.projectName.toLowerCase().includes(searchLower) ||
          request.tokenSymbol.toLowerCase().includes(searchLower) ||
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
      } else if (sortField === "projectName") {
        return sortDirection === "asc"
          ? a.projectName.localeCompare(b.projectName)
          : b.projectName.localeCompare(a.projectName);
      } else if (sortField === "status") {
        return sortDirection === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-50 text-blue-700">Approved</Badge>;
      case "processing":
        return (
          <Badge className="bg-purple-50 text-purple-700">Processing</Badge>
        );
      case "completed":
        return <Badge className="bg-green-50 text-green-700">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-50 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle new redemption form submission
  const handleRedemptionSubmit = (values: any) => {
    console.log("Redemption submitted:", values);
    setShowNewRedemptionForm(false);
    // In a real app, this would call an API to create a new redemption request
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {investorName}</p>
        </div>
        {!showNewRedemptionForm && (
          <Button onClick={() => setShowNewRedemptionForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Redemption Request
          </Button>
        )}
      </div>

      {showNewRedemptionForm ? (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>New Redemption Request</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewRedemptionForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RedemptionForm
              investorHoldings={investorHoldings}
              onSubmit={handleRedemptionSubmit}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
            <TabsTrigger value="calendar">Redemption Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    $
                    {investorHoldings
                      .reduce((sum, holding) => sum + holding.value, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Across {investorHoldings.length} projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending Redemptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    $
                    {redemptionRequests
                      .filter(
                        (req) =>
                          req.status === "pending" || req.status === "approved",
                      )
                      .reduce((sum, req) => sum + req.usdcAmount, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {
                      redemptionRequests.filter(
                        (req) =>
                          req.status === "pending" || req.status === "approved",
                      ).length
                    }{" "}
                    requests in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Next Redemption Window
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingWindows.length > 0 ? (
                    <>
                      <div className="text-xl font-medium">
                        {upcomingWindows[0].projectName}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Opens {formatDate(upcomingWindows[0].startDate)}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setActiveTab("calendar")}
                      >
                        View Calendar
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-xl font-medium">
                        No upcoming windows
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Check back later for updates
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">
                          Value (USDC)
                        </TableHead>
                        <TableHead>Redemption Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investorHoldings.map((holding) => (
                        <TableRow key={holding.projectId}>
                          <TableCell className="font-medium">
                            {holding.projectName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {holding.tokenType}
                              </Badge>
                              <span>{holding.tokenSymbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {holding.balance.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${holding.value.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {holding.hasOpenWindow ? (
                              <Badge className="bg-green-50 text-green-700">
                                Window Open
                              </Badge>
                            ) : holding.nextWindowDate ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm">
                                  Opens {formatDate(holding.nextWindowDate)}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50">
                                Standard Redemption
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowNewRedemptionForm(true);
                                // In a real app, we would pre-select this project
                              }}
                              disabled={
                                !holding.hasOpenWindow &&
                                holding.nextWindowDate !== null
                              }
                            >
                              Redeem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Redemption Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {redemptionRequests.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No redemption requests yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {redemptionRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {request.projectName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {request.tokenAmount.toLocaleString()}{" "}
                                {request.tokenSymbol} • $
                                {request.usdcAmount.toLocaleString()}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Requested on {formatDate(request.requestDate)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveTab("redemptions")}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("redemptions")}
                      >
                        View All Redemption Requests
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Redemption Windows</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingWindows.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No upcoming redemption windows
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingWindows.map((window) => (
                        <div key={window.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {window.windowName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {window.projectName} ({window.tokenSymbol})
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700"
                            >
                              Upcoming
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Eligibility Period:
                              </span>
                              <span>
                                {formatDate(window.eligibilityStartDate)} -{" "}
                                {formatDate(window.eligibilityEndDate)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Redemption Window:
                              </span>
                              <span>
                                {formatDate(window.startDate)} -{" "}
                                {formatDate(window.endDate)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">NAV Update:</span>
                              <span>{formatDate(window.navUpdateDate)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("calendar")}
                      >
                        View Redemption Calendar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>My Redemption Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, project, or token"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <RedemptionCalendar />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default InvestorDashboard;
