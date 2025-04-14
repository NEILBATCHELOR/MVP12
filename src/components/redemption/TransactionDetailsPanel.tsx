import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TransactionDetail {
  label: string;
  value: string;
  copyable?: boolean;
}

interface TransactionDetailsPanelProps {
  transactionHash?: string;
  settlementDate?: string;
  confirmationDate?: string;
  blockNumber?: number;
  networkFee?: string;
  status?: "completed" | "pending" | "failed";
  additionalDetails?: TransactionDetail[];
  isOpen?: boolean;
}

const TransactionDetailsPanel = ({
  transactionHash = "0x7d2b8c6a2b3d4e5f1a2b3c4d5e6f7a8b9c0d1e2f",
  settlementDate = "2023-06-15T14:30:00Z",
  confirmationDate = "2023-06-15T14:35:22Z",
  blockNumber = 15243789,
  networkFee = "0.0025 ETH",
  status = "completed",
  additionalDetails = [
    { label: "Gas Price", value: "25 Gwei" },
    { label: "Gas Limit", value: "21,000" },
    { label: "Nonce", value: "42" },
    {
      label: "Contract Address",
      value: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      copyable: true,
    },
  ],
  isOpen = true,
}: TransactionDetailsPanelProps) => {
  const { addNotification } = useNotifications();

  // Transaction completion notifications disabled to reduce distractions
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(isOpen);

  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Transaction Details</h3>
            <span
              className={`text-sm font-medium ${getStatusColor(status)} capitalize`}
            >
              ({status})
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle transaction details</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction Hash
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">
                    {truncateHash(transactionHash)}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            copyToClipboard(transactionHash, "hash")
                          }
                        >
                          {copied === "hash" ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span className="sr-only">Copy transaction hash</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {copied === "hash" ? "Copied!" : "Copy to clipboard"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            window.open(
                              `https://etherscan.io/tx/${transactionHash}`,
                              "_blank",
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="sr-only">View on Etherscan</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on Etherscan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Settlement Date
                  </span>
                  <p className="text-sm">{formattedDate(settlementDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Confirmation Date
                  </span>
                  <p className="text-sm">{formattedDate(confirmationDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Block Number
                  </span>
                  <p className="text-sm">{blockNumber.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Network Fee
                  </span>
                  <p className="text-sm">{networkFee}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Additional Details</h4>
              <div className="space-y-2">
                {additionalDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {detail.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{detail.value}</span>
                      {detail.copyable && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  copyToClipboard(detail.value, detail.label)
                                }
                              >
                                {copied === detail.label ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                <span className="sr-only">
                                  Copy {detail.label}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {copied === detail.label
                                  ? "Copied!"
                                  : "Copy to clipboard"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TransactionDetailsPanel;
