import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, Check } from "lucide-react";
// import { useWeb3 } from "@/context/Web3Context";

interface WalletConnectProps {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  onConnect?: (address: string) => void;
}

const WalletConnect = ({
  size = "default",
  variant = "default",
  onConnect = () => {},
}: WalletConnectProps) => {
  // Mock web3 state for demo purposes
  const account = null;
  const active = false;
  const error = null;
  const connect = async () => {
    console.log("Connecting wallet...");
    return Promise.resolve();
  };
  const disconnect = () => {
    console.log("Disconnecting wallet...");
  };
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (active) {
      disconnect();
      return;
    }

    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  return (
    <Button
      onClick={handleConnect}
      variant={variant}
      size={size}
      disabled={isConnecting}
      className="flex items-center"
    >
      {isConnecting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Connecting...
        </>
      ) : active && account ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {formatAddress(account)}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};

export default WalletConnect;
