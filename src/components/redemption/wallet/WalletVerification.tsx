import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Check, AlertCircle, Loader2 } from "lucide-react";
// import { useWeb3 } from "@/context/Web3Context";

interface WalletVerificationProps {
  walletAddress: string;
  onVerificationSuccess?: () => void;
}

const WalletVerification = ({
  walletAddress,
  onVerificationSuccess = () => {},
}: WalletVerificationProps) => {
  // Mock web3 state for demo purposes
  const account = null;
  const signMessage = async (message: string) => {
    console.log("Signing message:", message);
    return Promise.resolve("0x123456789abcdef");
  };
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!account || !walletAddress) return;

    // Check if the connected wallet matches the wallet address
    if (account.toLowerCase() !== walletAddress.toLowerCase()) {
      setError("Connected wallet does not match the source wallet address");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Create a verification message with a timestamp to prevent replay attacks
      const message = `Verify wallet ownership for redemption platform: ${new Date().toISOString()}`;

      // Request signature from the wallet
      const signature = await signMessage(message);

      if (signature) {
        // In a real app, you would verify this signature on the backend
        // For this demo, we'll just simulate a successful verification
        setIsVerified(true);
        onVerificationSuccess();
      } else {
        setError("Signature verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify wallet ownership");
    } finally {
      setIsVerifying(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Wallet Verification</h3>
          <p className="text-xs text-gray-500">
            Verify ownership of the source wallet address
          </p>
          <div className="flex items-center mt-2">
            <Wallet className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-mono">
              {formatAddress(walletAddress)}
            </span>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm">Verified</span>
          </div>
        ) : (
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !account || !walletAddress}
            size="sm"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>Verify Wallet</>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletVerification;
