import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeftRight, 
  ChevronRight, 
  Wallet, 
  QrCode, 
  ArrowUpCircle,
  ChevronDown, 
  BarChart3, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { TransferGasSettings } from "./components/transfer/TransferGasSettings";
import { TransferConfirmation } from "./components/transfer/TransferConfirmation";
import { QrCodeScanner } from "./components/transfer/QrCodeScanner";
import { RecentAddresses } from "./components/transfer/RecentAddresses";

// Schema for the transfer form
const transferSchema = z.object({
  fromWallet: z.string().min(1, "Please select a wallet"),
  toAddress: z.string().min(42, "Invalid wallet address").max(44, "Invalid wallet address"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  asset: z.string().min(1, "Please select an asset"),
  gasOption: z.enum(["slow", "standard", "fast"]),
});

type TransferFormValues = z.infer<typeof transferSchema>;

// Transfer page states
type TransferState = "input" | "confirmation" | "processing" | "success" | "error";

const TransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallets, selectedWallet } = useWallet();
  
  const [transferState, setTransferState] = useState<TransferState>("input");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // Form for transfer
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWallet: selectedWallet?.id || "",
      toAddress: "",
      amount: "",
      asset: "ETH",
      gasOption: "standard",
    },
  });

  // Handle form submission
  const onSubmit = async (values: TransferFormValues) => {
    // First, transition to confirmation state
    setTransferState("confirmation");
  };

  // Handle transfer confirmation
  const handleConfirmTransfer = async () => {
    try {
      // Simulate transaction processing
      setTransferState("processing");
      
      // In a real app, this would call the wallet service to submit the transaction
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Set mock transaction hash
      setTransactionHash("0x3d016d979f9e5a9f96ed9e4eb0c6cd16e3731e89562f92d4623a21030c5c7f1a");
      
      // Show success
      setTransferState("success");
      
      toast({
        title: "Transaction Submitted",
        description: "Your transfer has been submitted to the network",
      });
    } catch (error) {
      setTransferState("error");
      
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to submit transaction",
      });
    }
  };

  // Handle QR code scanning
  const handleQrScan = (address: string) => {
    form.setValue("toAddress", address);
    setShowQrScanner(false);
  };

  // Function to handle back button click based on state
  const handleBack = () => {
    if (transferState === "confirmation") {
      setTransferState("input");
    } else if (transferState === "success" || transferState === "error") {
      // Reset the form and go back to input state
      form.reset();
      setTransferState("input");
    } else {
      navigate("/wallet/dashboard");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={handleBack} className="mr-4">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transfer Assets</h1>
            <p className="text-muted-foreground">Send tokens across multiple blockchains</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-8">
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>
                {transferState === "input" && "Transfer Details"}
                {transferState === "confirmation" && "Confirm Transfer"}
                {transferState === "processing" && "Processing Transaction"}
                {transferState === "success" && "Transaction Successful"}
                {transferState === "error" && "Transaction Failed"}
              </CardTitle>
              <CardDescription>
                {transferState === "input" && "Send assets to another wallet address"}
                {transferState === "confirmation" && "Verify the transfer details before confirming"}
                {transferState === "processing" && "Your transaction is being processed"}
                {transferState === "success" && "Your transfer has been completed"}
                {transferState === "error" && "There was an error processing your transaction"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transferState === "input" && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fromWallet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Wallet</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a wallet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                  <div className="flex items-center">
                                    <span className="mr-2">{wallet.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {wallet.network}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the wallet to send from
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="toAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Address</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="0x..." {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowQrScanner(true)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormDescription>
                            Enter the recipient's wallet address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="asset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an asset" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                                <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                                <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                                <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
                                <SelectItem value="LINK">Chainlink (LINK)</SelectItem>
                                <SelectItem value="UNI">Uniswap (UNI)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <TransferGasSettings form={form} />

                    <div className="pt-4">
                      <Button type="submit" className="w-full">
                        Continue to Review
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {transferState === "confirmation" && (
                <TransferConfirmation
                  formData={{
                    fromWallet: form.getValues().fromWallet || "",
                    toAddress: form.getValues().toAddress || "",
                    amount: form.getValues().amount || "",
                    asset: form.getValues().asset || "",
                    gasOption: form.getValues().gasOption || "standard",
                  }}
                  onConfirm={handleConfirmTransfer}
                  onBack={() => setTransferState("input")}
                />
              )}

              {transferState === "processing" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin mb-4">
                    <Loader2 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Processing Your Transaction</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Your transfer is being processed on the blockchain.
                    This may take a few moments.
                  </p>
                  <Progress value={60} className="w-full max-w-md mb-4" />
                  <p className="text-sm text-muted-foreground">Waiting for network confirmation...</p>
                </div>
              )}

              {transferState === "success" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Transfer Successful!</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Your transfer has been successfully submitted to the network.
                  </p>
                  
                  <div className="w-full max-w-md bg-muted p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <span className="font-mono text-sm">{transactionHash?.substring(0, 10)}...{transactionHash?.substring(transactionHash.length - 8)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-mono text-sm">{wallets.find(w => w.id === form.getValues().fromWallet)?.address.substring(0, 6)}...{wallets.find(w => w.id === form.getValues().fromWallet)?.address.substring(wallets.find(w => w.id === form.getValues().fromWallet)?.address.length! - 4)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-mono text-sm">{form.getValues().toAddress.substring(0, 6)}...{form.getValues().toAddress.substring(form.getValues().toAddress.length - 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>{form.getValues().amount} {form.getValues().asset}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate("/wallet/dashboard")}>
                      Back to Dashboard
                    </Button>
                    <Button onClick={() => setTransferState("input")}>
                      New Transfer
                    </Button>
                  </div>
                </div>
              )}

              {transferState === "error" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-red-100 p-3 rounded-full mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Transaction Failed</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    There was an error processing your transaction.
                    Please try again or contact support.
                  </p>
                  
                  <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error Details</AlertTitle>
                    <AlertDescription>
                      The transaction was rejected due to insufficient funds for gas * price + value.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate("/wallet/dashboard")}>
                      Cancel
                    </Button>
                    <Button onClick={() => setTransferState("input")}>
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {transferState === "input" && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedWallet && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center mb-2">
                          <Wallet className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="font-medium">{selectedWallet.name}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          ${parseFloat(selectedWallet.balance || "0").toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedWallet.address.substring(0, 6)}...{selectedWallet.address.substring(selectedWallet.address.length - 4)}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-blue-700 text-xs font-medium">ETH</span>
                          </div>
                          <span>Ethereum</span>
                        </div>
                        <span className="font-medium">3.542 ETH</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <span className="text-green-700 text-xs font-medium">USDC</span>
                          </div>
                          <span>USD Coin</span>
                        </div>
                        <span className="font-medium">5,230.45 USDC</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <span className="text-purple-700 text-xs font-medium">MATIC</span>
                          </div>
                          <span>Polygon</span>
                        </div>
                        <span className="font-medium">1,253.78 MATIC</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/wallet/dashboard?tab=tokens")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View All Assets
                  </Button>
                </CardFooter>
              </Card>

              <RecentAddresses 
                onSelectAddress={(address) => form.setValue("toAddress", address)}
              />
            </>
          )}

          {(transferState === "confirmation" || transferState === "processing") && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="font-medium">0.0023 ETH ($4.15)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Total</span>
                    <span className="font-medium">{parseFloat(form.getValues().amount) + 0.0023} ETH</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <span className="text-muted-foreground">Estimated Confirmation Time</span>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">~2 minutes</span>
                    </div>
                  </div>
                  
                  <Alert variant="default" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Triple-check the recipient address before confirming. Blockchain transactions cannot be reversed.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showQrScanner && (
        <QrCodeScanner
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
};

// This is a placeholder component for ChevronLeft
// In a real implementation, you would import this from Lucide
const ChevronLeft = ChevronRight;

export default TransferPage;