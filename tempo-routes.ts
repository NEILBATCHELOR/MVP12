import { RouteObject } from "react-router-dom";
import React from "react";

// Import storyboard components
const ConnectionTestStoryboard = React.lazy(() => import("./src/storyboards/connection-test-storyboard"));
const InvestorDashboardStoryboard = React.lazy(() => import("./src/storyboards/investor-dashboard-storyboard"));
const OperationsDashboardStoryboard = React.lazy(() => import("./src/storyboards/operations-dashboard-storyboard"));
const AppRoutesStoryboard = React.lazy(() => import("./src/storyboards/app-routes-storyboard"));
const DatabaseDebugStoryboard = React.lazy(() => import("./src/storyboards/database-debug-storyboard"));

// Define routes for Tempo storyboards
const routes: RouteObject[] = [
  {
    path: "/tempobook/storyboards/connection-test",
    element: <ConnectionTestStoryboard />
  },
  {
    path: "/tempobook/storyboards/investor-dashboard",
    element: <InvestorDashboardStoryboard />
  },
  {
    path: "/tempobook/storyboards/operations-dashboard",
    element: <OperationsDashboardStoryboard />
  },
  {
    path: "/tempobook/storyboards/app-routes",
    element: <AppRoutesStoryboard />
  },
  {
    path: "/tempobook/storyboards/database-debug",
    element: <DatabaseDebugStoryboard />
  },
  // Add catch-all route for Tempo storyboards
  {
    path: "/tempobook/*",
    element: <div>Tempo Storyboard</div>
  }
];

export default routes;