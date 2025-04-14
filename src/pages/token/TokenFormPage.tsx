import React from "react";
import { useParams, useLocation } from "react-router-dom";
import TokenForm from "@/components/tokens/TokenForm";
import TokenManagerNavigation from "@/components/tokens/TokenManagerNavigation";

const TokenFormPage: React.FC = () => {
  const { projectId, tokenId } = useParams<{ projectId: string; tokenId: string }>();
  const location = useLocation();
  
  // Determine if we're in edit mode based on the URL pattern
  const isEdit = location.pathname.includes('/edit');
  
  return (
    <div className="h-full flex flex-col">
      <TokenManagerNavigation />
      <div className="flex-1 p-6 overflow-auto">
        <TokenForm 
          projectId={projectId!} 
          tokenId={isEdit ? tokenId : undefined} 
          isEdit={isEdit} 
        />
      </div>
    </div>
  );
};

export default TokenFormPage; 