import React from "react";
import { useParams } from "react-router-dom";
import TokenDetail from "@/components/tokens/TokenDetail";
import TokenManagerNavigation from "@/components/tokens/TokenManagerNavigation";

const TokenDetailPage: React.FC = () => {
  const { projectId, tokenId } = useParams<{ projectId: string; tokenId: string }>();
  
  return (
    <div className="h-full flex flex-col">
      <TokenManagerNavigation />
      <div className="flex-1 p-6 overflow-auto">
        <TokenDetail tokenId={tokenId!} />
      </div>
    </div>
  );
};

export default TokenDetailPage; 