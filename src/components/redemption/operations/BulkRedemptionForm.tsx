import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Wallet, Trash2, Plus, FileText, Upload } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Investor {
  id: string;
  name: string;
  walletAddress: string;
  destinationWalletAddress?: string;
  selected: boolean;
  tokenAmount?: number;
}

const formSchema = z.object({
  tokenType: z.string().min(1, { message: "Token type is required" }),
  redemptionType: z.string().min(1, { message: "Redemption type is required" }),
  conversionRate: z.string().min(1, { message: "Conversion rate is required" }),
  notes: z.string().optional(),
  selectedInvestors: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        walletAddress: z.string(),
        destinationWalletAddress: z
          .string()
          .min(42, { message: "Valid destination wallet address is required" }),
        selected: z.boolean(),
        tokenAmount: z.number().optional(),
      }),
    )
    .min(1, { message: "At least one investor must be selected" }),
});

type BulkRedemptionFormValues = z.infer<typeof formSchema>;

interface BulkRedemptionFormProps {
  onSubmit?: (values: BulkRedemptionFormValues) => void;
  isLoading?: boolean;
}

const BulkRedemptionForm = ({
  onSubmit = () => {},
  isLoading = false,
}: BulkRedemptionFormProps) => {
  // Mock data for available investors
  const [availableInvestors, setAvailableInvestors] = useState<Investor[]>([
    {
      id: "INV-12345",
      name: "Jane Doe",
      walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 1000,
    },
    {
      id: "INV-23456",
      name: "Robert Johnson",
      walletAddress: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 2500,
    },
    {
      id: "INV-34567",
      name: "Sarah Williams",
      walletAddress: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 5000,
    },
    {
      id: "INV-45678",
      name: "Michael Brown",
      walletAddress: "0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 3000,
    },
    {
      id: "INV-56789",
      name: "Emily Davis",
      walletAddress: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 7500,
    },
    {
      id: "INV-67890",
      name: "David Miller",
      walletAddress: "0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 4000,
    },
    {
      id: "INV-78901",
      name: "Jennifer Wilson",
      walletAddress: "0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f",
      destinationWalletAddress: "",
      selected: false,
      tokenAmount: 6000,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<BulkRedemptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenType: "",
      redemptionType: "",
      conversionRate: "",
      notes: "",
      selectedInvestors: [],
    },
  });

  const handleSelectAll = () => {
    const updatedInvestors = availableInvestors.map((investor) => ({
      ...investor,
      selected: true,
    }));
    setAvailableInvestors(updatedInvestors);
    form.setValue(
      "selectedInvestors",
      updatedInvestors.filter((i) => i.selected),
    );
  };

  const handleDeselectAll = () => {
    const updatedInvestors = availableInvestors.map((investor) => ({
      ...investor,
      selected: false,
    }));
    setAvailableInvestors(updatedInvestors);
    form.setValue("selectedInvestors", []);
  };

  const handleToggleInvestor = (id: string) => {
    const updatedInvestors = availableInvestors.map((investor) =>
      investor.id === id
        ? { ...investor, selected: !investor.selected }
        : investor,
    );
    setAvailableInvestors(updatedInvestors);
    form.setValue(
      "selectedInvestors",
      updatedInvestors.filter((i) => i.selected),
    );
  };

  const filteredInvestors = availableInvestors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedCount = availableInvestors.filter((i) => i.selected).length;
  const totalTokenAmount = availableInvestors
    .filter((i) => i.selected)
    .reduce((sum, investor) => sum + (investor.tokenAmount || 0), 0);

  const generateRandomWalletAddress = (investorId: string) => {
    const randomAddr = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")}`;

    const updatedInvestors = availableInvestors.map((investor) =>
      investor.id === investorId
        ? { ...investor, destinationWalletAddress: randomAddr }
        : investor,
    );
    setAvailableInvestors(updatedInvestors);
    form.setValue(
      "selectedInvestors",
      updatedInvestors.filter((i) => i.selected),
    );
  };

  const handleSubmit = (values: BulkRedemptionFormValues) => {
    // Add selected investors to the form values
    const selectedInvestors = availableInvestors.filter((i) => i.selected);
    const formValues = {
      ...values,
      selectedInvestors,
    };
    onSubmit(formValues);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Bulk Redemption Request
        </CardTitle>
        <CardDescription>
          Create a redemption request for multiple investors at once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Redemption Details</h3>

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
                            <SelectItem value="ERC-721">
                              ERC-721 (NFT)
                            </SelectItem>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="standard">
                              Standard (T0)
                            </SelectItem>
                            <SelectItem value="express">
                              Express (4hr)
                            </SelectItem>
                            <SelectItem value="scheduled">
                              Scheduled (Next Interval Window)
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                          Enter the conversion rate from token to USDC (e.g.,
                          1:0.5 means 1 token = 0.5 USDC).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-800">
                    Bulk Redemption Summary
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">
                        Selected Investors:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">
                        Total Token Amount:
                      </span>
                      <span className="text-sm font-medium">
                        {totalTokenAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">
                        Estimated USDC Value:
                      </span>
                      <span className="text-sm font-medium">
                        {form.watch("conversionRate")
                          ? (
                              totalTokenAmount *
                              parseFloat(form.watch("conversionRate"))
                            ).toLocaleString() + " USDC"
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Investors</h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Search investors by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                </div>

                <div className="border rounded-md">
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                      {filteredInvestors.length > 0 ? (
                        filteredInvestors.map((investor) => (
                          <div
                            key={investor.id}
                            className="p-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={investor.selected}
                                onCheckedChange={() =>
                                  handleToggleInvestor(investor.id)
                                }
                                id={`investor-${investor.id}`}
                              />
                              <div>
                                <label
                                  htmlFor={`investor-${investor.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {investor.name}
                                </label>
                                <p className="text-xs text-gray-500">
                                  {investor.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="mb-1">
                                {investor.tokenAmount?.toLocaleString()} Tokens
                              </Badge>
                              <div className="flex flex-col items-end">
                                <p className="text-xs font-mono text-gray-500">
                                  {investor.walletAddress.substring(0, 6)}...
                                  {investor.walletAddress.substring(
                                    investor.walletAddress.length - 4,
                                  )}
                                </p>
                                {investor.selected && (
                                  <div className="mt-2 flex items-center">
                                    <Input
                                      placeholder="Destination Address"
                                      value={investor.destinationWalletAddress}
                                      onChange={(e) => {
                                        const updatedInvestors =
                                          availableInvestors.map((inv) =>
                                            inv.id === investor.id
                                              ? {
                                                  ...inv,
                                                  destinationWalletAddress:
                                                    e.target.value,
                                                }
                                              : inv,
                                          );
                                        setAvailableInvestors(updatedInvestors);
                                        form.setValue(
                                          "selectedInvestors",
                                          updatedInvestors.filter(
                                            (i) => i.selected,
                                          ),
                                        );
                                      }}
                                      className="text-xs h-8 w-40"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="ml-1 h-8"
                                      onClick={() =>
                                        generateRandomWalletAddress(investor.id)
                                      }
                                    >
                                      Generate
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No investors found matching your search.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <p className="text-xs text-gray-500">
                    {selectedCount} of {availableInvestors.length} investors
                    selected
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading || selectedCount === 0}
        >
          {isLoading ? "Processing..." : "Submit Bulk Redemption Request"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BulkRedemptionForm;
