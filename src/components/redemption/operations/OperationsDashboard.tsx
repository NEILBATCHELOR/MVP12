import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  Settings,
  PlusCircle,
} from "lucide-react";
import ProjectManager from "./ProjectManager";
import RedemptionWindowManager from "./RedemptionWindowManager";
import ApprovalQueue from "./ApprovalQueue";
import ManualRedemptionForm from "./ManualRedemptionForm";
import { RedemptionRequest } from "@/lib/api/approvalApi";
import { Separator } from "@/components/ui/separator";

interface OperationsDashboardProps {
  onBack?: () => void;
}

const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  onBack = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for pending approvals
  const pendingApprovals: RedemptionRequest[] = [
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

  // Mock data for upcoming windows
  const upcomingWindows = [
    {
      id: "RW-001",
      projectName: "Green Energy Fund",
      windowName: "Q2 2023 Redemption",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    },
    {
      id: "RW-002",
      projectName: "Real Estate Trust",
      windowName: "June 2023 Redemption",
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
    },
  ];

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="windows">Redemption Windows</TabsTrigger>
          <TabsTrigger value="manual">Manual Redemption</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {pendingApprovals.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Requests awaiting your approval
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab("approvals")}
                >
                  View Approval Queue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upcoming Windows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {upcomingWindows.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Redemption windows opening soon
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab("windows")}
                >
                  Manage Windows
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("manual")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Manual Redemption
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("windows")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Redemption Window
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("projects")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No pending approvals
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((request) => {
                      const approvedCount = request.approvers.filter(
                        (a) => a.approved,
                      ).length;
                      return (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{request.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {request.investorName} •{" "}
                                {request.tokenAmount.toLocaleString()}{" "}
                                {request.tokenType}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {approvedCount}/{request.requiredApprovals}{" "}
                              Approvals
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Requested on{" "}
                              {new Date(
                                request.requestDate,
                              ).toLocaleDateString()}
                            </span>
                            <Button size="sm">Review</Button>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("approvals")}
                    >
                      View All Pending Approvals
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
                            <h3 className="font-medium">{window.windowName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {window.projectName}
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
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(window.startDate)} -{" "}
                            {formatDate(window.endDate)}
                          </span>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("windows")}
                    >
                      View All Redemption Windows
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalQueue />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectManager />
        </TabsContent>

        <TabsContent value="windows">
          <RedemptionWindowManager />
        </TabsContent>

        <TabsContent value="manual">
          <ManualRedemptionForm />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Operations Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Settings Coming Soon
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This section will allow configuration of global redemption
                  rules, approval workflows, and other operational settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationsDashboard;
