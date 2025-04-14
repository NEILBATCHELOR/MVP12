import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

const SummaryCard = ({
  title = "Summary",
  value = "0",
  change = "0%",
  isPositive = true,
  icon,
}: SummaryCardProps) => {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 p-1.5 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RedemptionSummaryProps {
  totalRequests?: number;
  pendingApprovals?: number;
  completedRedemptions?: number;
  processingRedemptions?: number;
}

const RedemptionSummary = ({
  totalRequests = 24,
  pendingApprovals = 8,
  completedRedemptions = 12,
  processingRedemptions = 4,
}: RedemptionSummaryProps) => {
  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Redemption Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Requests"
          value={totalRequests}
          change="12%"
          isPositive={true}
          icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          title="Pending Approvals"
          value={pendingApprovals}
          change="5%"
          isPositive={false}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
        <SummaryCard
          title="Completed"
          value={completedRedemptions}
          change="8%"
          isPositive={true}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          title="Processing"
          value={processingRedemptions}
          change="2%"
          isPositive={true}
          icon={<Clock className="h-5 w-5 text-purple-600" />}
        />
      </div>
    </div>
  );
};

export default RedemptionSummary;
