import React from "react";
import { useParams } from "react-router-dom";
import TokenTemplateList from "@/components/tokens/TokenTemplateList";
import TokenManagerNavigation from "@/components/tokens/TokenManagerNavigation";

const TokenTemplateListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <div className="h-full flex flex-col">
      <TokenManagerNavigation />
      <div className="flex-1 p-6 overflow-auto">
        <TokenTemplateList projectId={projectId!} />
      </div>
    </div>
  );
};

export default TokenTemplateListPage; 