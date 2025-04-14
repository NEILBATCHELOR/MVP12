import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  InfoIcon,
  LockKeyhole,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface WalletRiskCheckProps {
  walletAddress: string;
  network: string;
}

interface RiskResult {
  score: number;
  level: "low" | "medium" | "high";
  checks: {
    id: string;
    name: string;
    passed: boolean;
    impact: "low" | "medium" | "high";
    description: string;
  }[];
}

export const WalletRiskCheck: React.FC<WalletRiskCheckProps> = ({
  walletAddress,
  network,
}) => {
  const [loading, setLoading] = useState(true);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);

  useEffect(() => {
    const checkWalletRisk = async () => {
      if (!walletAddress) return;
      
      setLoading(true);
      try {
        // Simulate API call to risk assessment service
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock risk assessment result
        const result: RiskResult = {
          score: 87, // Out of 100
          level: "low",
          checks: [
            {
              id: "entropy",
              name: "Private Key Entropy",
              passed: true,
              impact: "high",
              description: "Private key has sufficient randomness and entropy",
            },
            {
              id: "backup",
              name: "Key Backup",
              passed: true,
              impact: "high",
              description: "User confirmed key backup",
            },
            {
              id: "exposure",
              name: "Key Exposure",
              passed: true,
              impact: "high",
              description: "No evidence of private key exposure",
            },
            {
              id: "smart_contract",
              name: "Smart Contract Wallet",
              passed: false,
              impact: "medium",
              description: "This is a basic EOA wallet without smart contract security features",
            },
            {
              id: "multisig",
              name: "MultiSig Protection",
              passed: false,
              impact: "medium",
              description: "Wallet does not have multi-signature protection",
            },
          ],
        };
        
        setRiskResult(result);
      } catch (error) {
        console.error("Error checking wallet risk:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkWalletRisk();
  }, [walletAddress, network]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Analyzing wallet security...</p>
      </div>
    );
  }

  if (!riskResult) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to perform security check. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const scoreColor = 
    riskResult.level === "low" 
      ? "text-green-600" 
      : riskResult.level === "medium" 
        ? "text-amber-600" 
        : "text-red-600";

  const scoreBackground = 
    riskResult.level === "low" 
      ? "bg-green-100" 
      : riskResult.level === "medium" 
        ? "bg-amber-100" 
        : "bg-red-100";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Security Score</h3>
          <p className="text-sm text-muted-foreground">
            Based on wallet configuration and best practices
          </p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor} flex items-center`}>
          <div className={`${scoreBackground} rounded-full p-2 mr-2`}>
            <Shield className="h-5 w-5" />
          </div>
          {riskResult.score}/100
        </div>
      </div>

      <Progress
        value={riskResult.score}
        className={`h-2 ${
          riskResult.level === "low"
            ? "bg-green-100"
            : riskResult.level === "medium"
            ? "bg-amber-100"
            : "bg-red-100"
        }`}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Security Checks</h3>
          <Badge variant={riskResult.level === "low" ? "default" : "outline"} className={
            riskResult.level === "low" 
              ? "bg-green-100 text-green-800 hover:bg-green-100" 
              : riskResult.level === "medium" 
                ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                : "bg-red-100 text-red-800 hover:bg-red-100"
          }>
            {riskResult.level === "low" ? "Low Risk" : riskResult.level === "medium" ? "Medium Risk" : "High Risk"}
          </Badge>
        </div>

        <div className="space-y-3">
          {riskResult.checks.map((check) => (
            <div
              key={check.id}
              className="p-3 border rounded-lg flex items-start justify-between"
            >
              <div className="flex items-start space-x-3">
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <InfoIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">{check.name}</div>
                  <p className="text-sm text-muted-foreground">
                    {check.description}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={
                check.impact === "low" 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : check.impact === "medium" 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-red-50 text-red-700 border-red-200"
              }>
                {check.impact} impact
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Alert>
        <LockKeyhole className="h-4 w-4" />
        <AlertTitle>Security Recommendations</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li>Consider using a hardware wallet for significant amounts</li>
            <li>Enable multi-factor authentication where available</li>
            <li>Regularly review connected applications and permissions</li>
            <li>Use a unique password for wallet recovery</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};