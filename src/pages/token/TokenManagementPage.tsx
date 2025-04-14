import React from "react";
import { useParams } from "react-router-dom";
import TokenList from "@/components/tokens/TokenList";
import TokenManagerNavigation from "@/components/tokens/TokenManagerNavigation";

const TokenManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <div className="h-full flex flex-col">
      <TokenManagerNavigation />
      <div className="flex-1 p-6 overflow-auto">
        <TokenList projectId={projectId!} />
      </div>
    </div>
  );
};

export default TokenManagementPage; 