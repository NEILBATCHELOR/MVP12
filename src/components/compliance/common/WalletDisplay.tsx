import React from "react";
import { CheckCircle as CircleCheck, Clock as CircleClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletDisplayProps {
  address: string;
  isActivated?: boolean;
  className?: string;
}

export const WalletDisplay: React.FC<WalletDisplayProps> = ({
  address,
  isActivated = false,
  className,
}) => {
  // Format address for display - show first 6 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-sm">{formatAddress(address)}</span>
      {isActivated ? (
        <CircleCheck className="h-4 w-4 text-green-500" />
      ) : (
        <CircleClock className="h-4 w-4 text-amber-500" />
      )}
    </div>
  );
};