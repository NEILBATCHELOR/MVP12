import React from "react";
import { Separator } from "@/components/ui/separator";
import { TokenSetupSection } from "./ERC1400/TokenSetupSection";
import { PartitionSection } from "./ERC1400/PartitionSection";
import { InvestorSection } from "./ERC1400/InvestorSection";
import { TransferSection } from "./ERC1400/TransferSection";
import { EquityConfig } from "./ERC1400/EquityConfig";
import { DebtConfig } from "./ERC1400/DebtConfig";
import { DerivativeConfig } from "./ERC1400/DerivativeConfig";
import { FundConfig } from "./ERC1400/FundConfig";
import { REITConfig } from "./ERC1400/REITConfig";
import { OtherConfig } from "./ERC1400/OtherConfig";

interface ERC1400ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC1400Config: React.FC<ERC1400ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  // Render security-type specific configuration based on selection
  const renderSecurityTypeConfig = () => {
    switch (tokenForm.metadata?.securityType) {
      case "equity":
        return (
          <EquityConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />
        );
      case "debt":
        return <DebtConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />;
      case "derivative":
        return (
          <DerivativeConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />
        );
      case "fund":
        return <FundConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />;
      case "reit":
        return <REITConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />;
      case "other":
        return (
          <OtherConfig tokenForm={tokenForm} setTokenForm={setTokenForm} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      {/* 1️⃣ Token Setup Panel */}
      <TokenSetupSection
        tokenForm={tokenForm}
        handleInputChange={handleInputChange}
        setTokenForm={setTokenForm}
      />

      <Separator />

      {/* 2️⃣ Partitions & Tranches Panel */}
      <PartitionSection tokenForm={tokenForm} setTokenForm={setTokenForm} />

      <Separator />

      {/* 3️⃣ Investor Verification & Compliance Panel */}
      <InvestorSection tokenForm={tokenForm} setTokenForm={setTokenForm} />

      <Separator />

      {/* 4️⃣ Transfer & Compliance Panel */}
      <TransferSection tokenForm={tokenForm} setTokenForm={setTokenForm} />

      {/* Render security-type specific configuration */}
      {tokenForm.metadata?.securityType && (
        <>
          <Separator />
          {renderSecurityTypeConfig()}
        </>
      )}
    </div>
  );
};

export default ERC1400Config;
