import React, { useState } from "react";
import DashboardHeader from "@/components/redemption/dashboard/DashboardHeader";
import RedemptionSummary from "@/components/redemption/dashboard/RedemptionSummary";
import RedemptionRequestList from "@/components/redemption/dashboard/RedemptionRequestList";
import RedemptionForm from "@/components/redemption/RedemptionForm";
import BulkRedemptionForm from "@/components/redemption/operations/BulkRedemptionForm";
import StatusTracker from "@/components/redemption/StatusTracker";
import RedemptionCalendar from "@/components/redemption/calendar/RedemptionCalendar";
import RedemptionDetails from "@/components/redemption/RedemptionDetails";
import TransactionDetailsPanel from "@/components/redemption/TransactionDetailsPanel";
import NotificationSettingsPage from "@/pages/NotificationSettingsPage";
import ApproverPortalPage from "@/pages/ApproverPortalPage";
import { NotificationToastContainer } from "@/components/redemption/notifications/NotificationToast";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  ArrowLeft,
  Users,
  Bell,
  User,
  ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import InvestorDashboard from "@/components/redemption/dashboard/InvestorDashboard";
import OperationsDashboard from "@/components/redemption/operations/OperationsDashboard";
import RoleSelection from "@/components/redemption/RoleSelection";

const RedemptionDashboard = () => {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "details"
    | "calendar"
    | "transaction"
    | "bulk-redemption"
    | "new-request"
    | "notification-settings"
    | "approver-portal"
    | "investor-dashboard"
    | "operations-dashboard"
    | "role-selection"
  >("role-selection");

  const { notifications, dismissNotification } = useNotifications();

  const handleViewDetails = (id: string) => {
    setSelectedRequestId(id);
    setCurrentView("details");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <NotificationToastContainer
        notifications={notifications.filter((n) => !n.read).slice(0, 10)}
        onDismiss={dismissNotification}
      />
      <main className="container mx-auto px-4 py-8">
        {currentView === "role-selection" && (
          <RoleSelection setCurrentView={setCurrentView} />
        )}
        {currentView === "investor-dashboard" && <InvestorDashboard />}
        {currentView === "operations-dashboard" && <OperationsDashboard />}

        {currentView === "dashboard" && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Redemption Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your token redemption requests and track their status
                </p>
              </div>
              <Button
                className="mt-4 md:mt-0"
                size="lg"
                onClick={() => setCurrentView("new-request")}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> New Redemption Request
              </Button>
            </div>

            <RedemptionSummary />
            <RedemptionRequestList onViewDetails={handleViewDetails} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Current Status</h2>
                <StatusTracker requestId="RDM-12345" currentStatus="pending" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setCurrentView("calendar")}
                  >
                    View Redemption Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setCurrentView("transaction")}
                  >
                    View Transaction History
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === "details" && selectedRequestId && (
          <RedemptionDetails
            id={selectedRequestId}
            onBack={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "calendar" && (
          <div>
            <Button variant="ghost" onClick={() => setCurrentView("dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Redemption Calendar</h1>
            <RedemptionCalendar />
          </div>
        )}

        {currentView === "transaction" && (
          <div>
            <Button variant="ghost" onClick={() => setCurrentView("dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Transaction History</h1>
            <TransactionDetailsPanel />
          </div>
        )}

        {currentView === "notification-settings" && (
          <NotificationSettingsPage
            onBack={() => setCurrentView("dashboard")}
          />
        )}
        {currentView === "approver-portal" && (
          <ApproverPortalPage onBack={() => setCurrentView("dashboard")} />
        )}
      </main>
    </div>
  );
};

export default RedemptionDashboard;
