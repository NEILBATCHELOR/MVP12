import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  InfoIcon,
  FileCode,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ContractRiskCheckProps {
  contractAddress: string;
  network: string;
}

interface CodeFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  line?: number;
  impact: string;
  recommendation: string;
}

interface AuditStatus {
  audited: boolean;
  auditedBy?: string[];
  auditDate?: string;
  auditLink?: string;
}

interface ContractRiskResult {
  score: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  verified: boolean;
  openSource: boolean;
  audit: AuditStatus;
  findings: CodeFinding[];
  deployedTime: string;
  lastActivity: string;
  totalTransactions: number;
  totalValue: string;
}

export const ContractRiskCheck: React.FC<ContractRiskCheckProps> = ({
  contractAddress,
  network,
}) => {
  const [loading, setLoading] = useState(true);
  const [riskResult, setRiskResult] = useState<ContractRiskResult | null>(null);

  useEffect(() => {
    const checkContractRisk = async () => {
      if (!contractAddress) return;
      
      setLoading(true);
      try {
        // Simulate API call to risk assessment service
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock contract risk assessment result
        const result: ContractRiskResult = {
          score: 65,
          riskLevel: "medium",
          verified: true,
          openSource: true,
          audit: {
            audited: true,
            auditedBy: ["CertiK", "Open Zeppelin"],
            auditDate: "2023-05-15",
            auditLink: "https://example.com/audit-report",
          },
          findings: [
            {
              id: "reentrancy-1",
              severity: "high",
              description: "Potential reentrancy vulnerability in withdrawal function",
              line: 142,
              impact: "Could allow attackers to drain funds",
              recommendation: "Implement checks-effects-interactions pattern",
            },
            {
              id: "access-control-1",
              severity: "medium",
              description: "Insufficient access control on administrative functions",
              line: 87,
              impact: "Unauthorized users might gain elevated privileges",
              recommendation: "Implement role-based access control",
            },
            {
              id: "optimization-1",
              severity: "low",
              description: "Gas optimization possible in loop execution",
              line: 216,
              impact: "Higher transaction costs than necessary",
              recommendation: "Optimize storage reads in loops",
            },
            {
              id: "best-practice-1",
              severity: "info",
              description: "Contract uses outdated Solidity version",
              impact: "Missing newer safety features and optimizations",
              recommendation: "Update to latest stable Solidity version",
            },
          ],
          deployedTime: "2023-02-10T14:30:00Z",
          lastActivity: "2023-10-25T09:15:42Z",
          totalTransactions: 8754,
          totalValue: "$2.5M",
        };
        
        setRiskResult(result);
      } catch (error) {
        console.error("Error checking contract risk:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkContractRisk();
  }, [contractAddress, network]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Analyzing smart contract security...</p>
      </div>
    );
  }

  if (!riskResult) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to perform contract security check. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-amber-600 bg-amber-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      case "info":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      case "low":
        return <InfoIcon className="h-4 w-4" />;
      case "info":
        return <InfoIcon className="h-4 w-4" />;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };

  const scoreColor = 
    riskResult.riskLevel === "low" 
      ? "text-green-600" 
      : riskResult.riskLevel === "medium" 
        ? "text-amber-600" 
        : riskResult.riskLevel === "high"
          ? "text-orange-600"
          : "text-red-600";

  const scoreBackground = 
    riskResult.riskLevel === "low" 
      ? "bg-green-100" 
      : riskResult.riskLevel === "medium" 
        ? "bg-amber-100" 
        : riskResult.riskLevel === "high"
          ? "bg-orange-100"
          : "bg-red-100";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Contract Security Score</h3>
          <p className="text-sm text-muted-foreground">
            For {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)} on {network}
          </p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor} flex items-center`}>
          <div className={`${scoreBackground} rounded-full p-2 mr-2`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          {riskResult.score}/100
        </div>
      </div>

      <Progress
        value={riskResult.score}
        className={`h-2 ${
          riskResult.riskLevel === "low"
            ? "bg-green-100"
            : riskResult.riskLevel === "medium"
            ? "bg-amber-100"
            : riskResult.riskLevel === "high"
            ? "bg-orange-100"
            : "bg-red-100"
        }`}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Contract Overview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified:</span>
              <span className="font-medium flex items-center">
                {riskResult.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-1" />
                )}
                {riskResult.verified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Open Source:</span>
              <span className="font-medium flex items-center">
                {riskResult.openSource ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-1" />
                )}
                {riskResult.openSource ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audited:</span>
              <span className="font-medium flex items-center">
                {riskResult.audit.audited ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-1" />
                )}
                {riskResult.audit.audited ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deployed:</span>
              <span className="font-medium">
                {new Date(riskResult.deployedTime).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Activity:</span>
              <span className="font-medium">
                {new Date(riskResult.lastActivity).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Activity & Usage</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Transactions:</span>
              <span className="font-medium">{riskResult.totalTransactions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">{riskResult.totalValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Critical Issues:</span>
              <span className="font-medium">{riskResult.findings.filter(f => f.severity === "critical").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">High Issues:</span>
              <span className="font-medium">{riskResult.findings.filter(f => f.severity === "high").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medium Issues:</span>
              <span className="font-medium">{riskResult.findings.filter(f => f.severity === "medium").length}</span>
            </div>
          </div>
        </div>
      </div>

      {riskResult.audit.audited && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Audited Contract</AlertTitle>
          <AlertDescription>
            This contract has been audited by{" "}
            {riskResult.audit.auditedBy?.join(", ")} on{" "}
            {new Date(riskResult.audit.auditDate || "").toLocaleDateString()}.
            {riskResult.audit.auditLink && (
              <Button
                variant="link"
                className="p-0 h-auto text-green-800 underline"
                onClick={() => window.open(riskResult.audit.auditLink, "_blank")}
              >
                View Audit Report
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-lg font-medium mb-4">Security Findings</h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskResult.findings.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell>
                  <Badge
                    className={`${getSeverityColor(finding.severity)} border-none flex items-center space-x-1`}
                  >
                    {getSeverityIcon(finding.severity)}
                    <span className="capitalize ml-1">{finding.severity}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {finding.description}
                  {finding.line && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Line: {finding.line}
                    </div>
                  )}
                </TableCell>
                <TableCell>{finding.impact}</TableCell>
                <TableCell>{finding.recommendation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Alert>
        <FileCode className="h-4 w-4" />
        <AlertTitle>Recommendations</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li>Review and address all high and critical severity issues</li>
            <li>Consider conducting additional audits if making significant changes</li>
            <li>Monitor contract for unusual activity patterns</li>
            <li>Consider implementing an emergency pause mechanism</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};