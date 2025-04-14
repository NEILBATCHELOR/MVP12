import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coins, FileText, Settings, LayoutGrid } from "lucide-react";

interface TokenManagerNavigationProps {
  projectId?: string;
}

const TokenManagerNavigation: React.FC<TokenManagerNavigationProps> = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  
  // Use projectId from props or from URL params
  const currentProjectId = propProjectId || paramProjectId;

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/token-management")) return "management";
    if (path.includes("/token-templates")) return "templates";
    if (path.includes("/token-admin")) return "admin";
    return "builder"; // default
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Token Management</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to={`/projects/${currentProjectId}/captable/overview`}>
                Back to Project
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs value={getActiveTab()} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="builder" asChild>
              <Link to={`/projects/${currentProjectId}/tokens`} className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span>Token Builder</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="management" asChild>
              <Link to={`/projects/${currentProjectId}/token-management`} className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span>Token Management</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="templates" asChild>
              <Link to={`/projects/${currentProjectId}/token-templates`} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Token Templates</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="admin" asChild>
              <Link to={`/projects/${currentProjectId}/token-admin`} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Token Admin</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenManagerNavigation; 