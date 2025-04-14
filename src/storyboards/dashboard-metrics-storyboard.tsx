import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardMetricsStoryboard() {
  return (
    <div className="w-full h-full">
      <Dashboard />
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-md text-sm">
        <p>
          <strong>Dashboard Metrics:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Investors: Total investor record count</li>
          <li>Subscriptions: Total subscriptions for project</li>
          <li>Allocations: Token allocations where distributed = FALSE</li>
          <li>Distributions: Token allocations where distributed = TRUE</li>
        </ul>
      </div>
    </div>
  );
}
