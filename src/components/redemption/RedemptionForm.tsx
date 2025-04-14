import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Check, Wallet, Users } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  tokenAmount: z
    .string()
    .min(1, { message: "Token amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Token amount must be a valid number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Token amount must be greater than 0",
    })
    .refine((val) => parseFloat(val) <= 1000000, {
      message: "Token amount cannot exceed 1,000,000",
    }),
  tokenType: z.string().min(1, { message: "Token type is required" }),
  redemptionType: z.string().min(1, { message: "Redemption type is required" }),
  sourceWalletAddress: z
    .string()
    .min(1, { message: "Source wallet address is required" })
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid Ethereum wallet address format",
    }),
  destinationWalletAddress: z
    .string()
    .min(1, { message: "Destination wallet address is required" })
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid Ethereum wallet address format",
    }),
  conversionRate: z
    .string()
    .min(1, { message: "Conversion rate is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Conversion rate must be a valid number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Conversion rate must be greater than 0",
    }),
  investorName: z
    .string()
    .min(1, { message: "Investor name is required" })
    .max(100, { message: "Investor name cannot exceed 100 characters" }),
  investorId: z
    .string()
    .min(1, { message: "Investor ID is required" })
    .refine((val) => /^INV-\d{5}$/.test(val), {
      message: "Investor ID must be in format INV-XXXXX where X is a digit",
    }),
  isBulkRedemption: z.boolean().default(false),
  bulkInvestors: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Investor name is required" }),
        id: z.string().min(1, { message: "Investor ID is required" }),
      }),
    )
    .optional(),
  notes: z.string().optional(),
});

type RedemptionFormValues = z.infer<typeof formSchema>;

interface RedemptionFormProps {
  onSubmit?: (values: RedemptionFormValues) => void;
  isLoading?: boolean;
  investorHoldings?: Array<{
    projectId: string;
    projectName: string;
    tokenSymbol: string;
    tokenType: string;
    balance: number;
    value: number;
    conversionRate: number;
    hasOpenWindow: boolean;
    nextWindowDate: Date | null;
  }>;
}

const RedemptionForm = ({
  onSubmit = () => {},
  isLoading = false,
}: RedemptionFormProps) => {
  const [eligibilityStatus, setEligibilityStatus] = useState<
    "eligible" | "ineligible" | null
  >(null);

  const [isBulkRedemption, setIsBulkRedemption] = useState(false);
  const [bulkInvestors, setBulkInvestors] = useState([{ name: "", id: "" }]);

  // Get connected wallet address from DashboardHeader
  const connectedWalletAddress = "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t";

  const form = useForm<RedemptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAmount: "",
      tokenType: "",
      redemptionType: "",
      sourceWalletAddress: connectedWalletAddress,
      destinationWalletAddress: "",
      conversionRate: "",
      investorName: "",
      investorId: "",
      isBulkRedemption: false,
      bulkInvestors: [{ name: "", id: "" }],
      notes: "",
    },
  });

  const checkEligibility = (amount: string) => {
    // More comprehensive eligibility check
    const numAmount = parseFloat(amount);

    // Check if it's a valid number
    if (isNaN(numAmount)) {
      setEligibilityStatus(null);
      return false;
    }

    // Check if it's positive
    if (numAmount <= 0) {
      setEligibilityStatus("ineligible");
      return false;
    }

    // Check if it's within the allowed range
    // For this example, we'll say investors can redeem between 1 and 1000 tokens
    if (numAmount > 1000) {
      setEligibilityStatus("ineligible");
      return false;
    }

    // Check if the investor has sufficient balance (mock check)
    // In a real app, this would query the investor's actual balance
    const mockInvestorBalance = 5000; // Mock balance
    if (numAmount > mockInvestorBalance) {
      setEligibilityStatus("ineligible");
      return false;
    }

    // All checks passed
    setEligibilityStatus("eligible");
    return true;
  };

  const handleSubmit = (values: RedemptionFormValues) => {
    // Perform final validation checks before submission
    if (!checkEligibility(values.tokenAmount)) {
      return; // Don't submit if eligibility check fails
    }

    // Validate wallet addresses
    if (!/^0x[a-fA-F0-9]{40}$/.test(values.sourceWalletAddress)) {
      form.setError("sourceWalletAddress", {
        type: "manual",
        message: "Invalid Ethereum wallet address format",
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(values.destinationWalletAddress)) {
      form.setError("destinationWalletAddress", {
        type: "manual",
        message: "Invalid Ethereum wallet address format",
      });
      return;
    }

    // Validate investor ID format
    if (!/^INV-\d{5}$/.test(values.investorId)) {
      form.setError("investorId", {
        type: "manual",
        message: "Investor ID must be in format INV-XXXXX where X is a digit",
      });
      return;
    }

    // All validation passed, submit the form
    onSubmit(values);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Redemption Request</CardTitle>
        <CardDescription>
          Submit a request to redeem your tokens. All redemption requests are
          subject to approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tokenAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter amount"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            checkEligibility(e.target.value);

                            // Additional validation feedback
                            const value = e.target.value;
                            const numValue = parseFloat(value);

                            if (value && isNaN(numValue)) {
                              form.setError("tokenAmount", {
                                type: "manual",
                                message: "Token amount must be a valid number",
                              });
                            } else if (numValue <= 0) {
                              form.setError("tokenAmount", {
                                type: "manual",
                                message: "Token amount must be greater than 0",
                              });
                            } else if (numValue > 1000000) {
                              form.setError("tokenAmount", {
                                type: "manual",
                                message: "Token amount cannot exceed 1,000,000",
                              });
                            } else {
                              form.clearErrors("tokenAmount");
                            }
                          }}
                          className="pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-sm text-gray-500">TOKENS</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the number of tokens you wish to redeem.
                    </FormDescription>
                    <FormMessage />
                    {eligibilityStatus === "eligible" && (
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        Eligible for redemption
                      </div>
                    )}
                    {eligibilityStatus === "ineligible" && (
                      <div className="flex items-center mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {parseFloat(form.watch("tokenAmount") || "0") > 1000
                          ? "Exceeds maximum redemption limit of 1,000 tokens"
                          : parseFloat(form.watch("tokenAmount") || "0") <= 0
                            ? "Token amount must be greater than 0"
                            : "Insufficient balance for this redemption amount"}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ERC-20">ERC-20</SelectItem>
                        <SelectItem value="ERC-721">ERC-721 (NFT)</SelectItem>
                        <SelectItem value="ERC-1155">
                          ERC-1155 (Multi-Token)
                        </SelectItem>
                        <SelectItem value="ERC-1400">
                          ERC-1400 (Security Token)
                        </SelectItem>
                        <SelectItem value="ERC-3525">
                          ERC-3525 (Semi-Fungible)
                        </SelectItem>
                        <SelectItem value="ERC-4626">
                          ERC-4626 (Tokenized Vault)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of token you are redeeming.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="redemptionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redemption Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select redemption type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard">Standard (T0)</SelectItem>
                      <SelectItem value="express">Express (4hr)</SelectItem>
                      <SelectItem value="scheduled">
                        Scheduled (Next Interval Window)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of redemption process you prefer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="sourceWalletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Wallet Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="0x..."
                          {...field}
                          className="pl-10"
                          onChange={(e) => {
                            // Validate wallet address format as user types
                            const value = e.target.value;
                            field.onChange(value);
                            // Optional: provide immediate feedback
                            if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
                              form.setError("sourceWalletAddress", {
                                type: "manual",
                                message:
                                  "Invalid Ethereum wallet address format",
                              });
                            } else {
                              form.clearErrors("sourceWalletAddress");
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Wallet className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the investor's wallet address containing the tokens
                      to redeem.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationWalletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Wallet Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="0x..."
                          {...field}
                          className="pl-10 pr-24"
                          onChange={(e) => {
                            // Validate wallet address format as user types
                            const value = e.target.value;
                            field.onChange(value);
                            // Optional: provide immediate feedback
                            if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
                              form.setError("destinationWalletAddress", {
                                type: "manual",
                                message:
                                  "Invalid Ethereum wallet address format",
                              });
                            } else {
                              form.clearErrors("destinationWalletAddress");
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Wallet className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Generate a valid Ethereum address format
                              const randomAddr = `0x${Array.from(
                                { length: 40 },
                                () =>
                                  Math.floor(Math.random() * 16).toString(16),
                              ).join("")}`;
                              field.onChange(randomAddr);
                              // Clear any validation errors
                              form.clearErrors("destinationWalletAddress");
                            }}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the issuer's wallet address where tokens will be
                      sent.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conversionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversion Rate to USDC</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter conversion rate"
                          {...field}
                          className="pl-10"
                          type="number"
                          step="0.0001"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-sm text-gray-500">1:</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the conversion rate from your token to USDC (e.g.,
                      1:0.5 means 1 token = 0.5 USDC).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Investor Information</h3>
              </div>

              {!isBulkRedemption ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter investor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="investorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investor ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter investor ID (format: INV-XXXXX)"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              // Validate investor ID format
                              if (value && !/^INV-\d{5}$/.test(value)) {
                                form.setError("investorId", {
                                  type: "manual",
                                  message:
                                    "Investor ID must be in format INV-XXXXX",
                                });
                              } else {
                                form.clearErrors("investorId");
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="text-sm font-medium">Bulk Investors</h4>
                  <p className="text-sm text-gray-500">
                    Add multiple investors for this redemption request
                  </p>

                  {bulkInvestors.map((investor, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100"
                    >
                      <div>
                        <FormLabel className="text-xs">Investor Name</FormLabel>
                        <Input
                          placeholder="Enter investor name"
                          value={investor.name}
                          onChange={(e) => {
                            const newInvestors = [...bulkInvestors];
                            newInvestors[index].name = e.target.value;
                            setBulkInvestors(newInvestors);
                            form.setValue("bulkInvestors", newInvestors);
                          }}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormLabel className="text-xs">Investor ID</FormLabel>
                          <Input
                            placeholder="Enter investor ID"
                            value={investor.id}
                            onChange={(e) => {
                              const newInvestors = [...bulkInvestors];
                              newInvestors[index].id = e.target.value;
                              setBulkInvestors(newInvestors);
                              form.setValue("bulkInvestors", newInvestors);
                            }}
                          />
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mb-0.5"
                            onClick={() => {
                              const newInvestors = bulkInvestors.filter(
                                (_, i) => i !== index,
                              );
                              setBulkInvestors(newInvestors);
                              form.setValue("bulkInvestors", newInvestors);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInvestors = [
                        ...bulkInvestors,
                        { name: "", id: "" },
                      ];
                      setBulkInvestors(newInvestors);
                      form.setValue("bulkInvestors", newInvestors);
                    }}
                  >
                    Add Another Investor
                  </Button>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Any special instructions or notes"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add any additional information relevant to your redemption
                    request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800">
                Important Information
              </h4>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>
                  Redemption requests are processed according to the fund's
                  redemption policy
                </li>
                <li>
                  Standard redemptions typically take 7-14 business days to
                  complete
                </li>
                <li>
                  All redemptions are subject to approval by fund administrators
                </li>
                <li>
                  You will receive email notifications about the status of your
                  request
                </li>
              </ul>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading || eligibilityStatus === "ineligible"}
        >
          {isLoading ? "Processing..." : "Submit Redemption Request"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedemptionForm;
