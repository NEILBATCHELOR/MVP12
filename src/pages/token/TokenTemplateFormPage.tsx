import React from "react";
import { useParams, useLocation } from "react-router-dom";
import TokenTemplateForm from "@/components/tokens/TokenTemplateForm";
import TokenManagerNavigation from "@/components/tokens/TokenManagerNavigation";

const TokenTemplateFormPage: React.FC = () => {
  const { projectId, templateId } = useParams<{ projectId: string; templateId: string }>();
  const location = useLocation();
  
  // Determine if we're in edit mode based on the URL pattern
  const isEdit = location.pathname.includes('/edit');
  
  return (
    <div className="h-full flex flex-col">
      <TokenManagerNavigation />
      <div className="flex-1 p-6 overflow-auto">
        <TokenTemplateForm 
          projectId={projectId!} 
          templateId={isEdit ? templateId : undefined} 
          isEdit={isEdit} 
        />
      </div>
    </div>
  );
};

export default TokenTemplateFormPage; 