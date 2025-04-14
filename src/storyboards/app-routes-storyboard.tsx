import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AppRoutesStoryboard = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Application Routes</CardTitle>
        <CardDescription>
          Overview of available routes in the application
        </CardDescription>
      </CardHeader>

      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Routing Error</AlertTitle>
        <AlertDescription>
          The console shows "No routes matched location" errors. This storyboard
          helps debug route configuration.
        </AlertDescription>
      </Alert>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Main Routes</h3>
              <Separator className="mb-3" />
              <ul className="space-y-2">
                <RouteItem path="/" description="Welcome Screen" />
                <RouteItem
                  path="/dashboard"
                  description="Cap Table Dashboard"
                />
                <RouteItem path="/projects" description="Projects Home" />
                <RouteItem path="/investors" description="Investors List" />
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Project-specific Routes
              </h3>
              <Separator className="mb-3" />
              <ul className="space-y-2">
                <RouteItem
                  path="/projects/:projectId/captable"
                  description="Project Cap Table"
                />
                <RouteItem
                  path="/projects/:projectId/captable/investors"
                  description="Project Investors"
                />
                <RouteItem
                  path="/projects/:projectId/captable/subscriptions"
                  description="Project Subscriptions"
                />
                <RouteItem
                  path="/projects/:projectId/captable/allocations"
                  description="Token Allocations"
                />
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Tempo Storyboard Routes
              </h3>
              <Separator className="mb-3" />
              <ul className="space-y-2">
                <RouteItem
                  path="/tempobook/storyboards/connection-test"
                  description="Connection Test"
                />
                <RouteItem
                  path="/tempobook/storyboards/investor-dashboard"
                  description="Investor Dashboard"
                />
                <RouteItem
                  path="/tempobook/storyboards/operations-dashboard"
                  description="Operations Dashboard"
                />
              </ul>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2">
                Routing Troubleshooting
              </h3>
              <Separator className="mb-3" />
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  If you're seeing "No routes matched location" errors in the
                  console, check:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>The route path is correctly defined in App.tsx</li>
                  <li>
                    The Tempo routes are properly configured in tempo-routes.ts
                  </li>
                  <li>The VITE_TEMPO environment variable is set to true</li>
                  <li>
                    The component referenced in the route exists and is exported
                    correctly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};

const RouteItem = ({
  path,
  description,
}: {
  path: string;
  description: string;
}) => {
  return (
    <li className="p-3 bg-gray-50 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-mono text-sm text-blue-600">{path}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          View Details
        </Button>
      </div>
    </li>
  );
};

export default AppRoutesStoryboard;
