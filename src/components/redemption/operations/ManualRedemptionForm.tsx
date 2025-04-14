import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, AlertCircle, Check, Search } from "lucide-react";

// Types
interface Investor {
  id: string;
  name: string;
  walletAddress: string;
  kycStatus: "approved" | "pending" | "rejected";
  holdings: Array<{
    projectId: string;
    tokenAmount: number;
  }>;
}

interface Project {
  id: string;
  name: string;
  tokenSymbol: string;
  tokenType: string;
  issuanceDate: string;
  status: "active" | "completed" | "paused";
  hasOpenWindow: boolean;
}

// Form schema
const manualRedemptionSchema = z.object({
  investorId: z.string({
    required_error: "Investor is required",
  }),
  projectId: z.string({
    required_error: "Project is required",
  }),
  tokenAmount: z
    .string()
    .min(1, { message: "Token amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Token amount must be a valid number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Token amount must be greater than 0",
    }),
  redemptionType: z.string().min(1, { message: "Redemption type is required" }),
  destinationWalletAddress: z
    .string()
    .min(1, { message: "Destination wallet address is required" })
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid Ethereum wallet address format",
    }),
  notes: z.string().optional(),
});

type ManualRedemptionFormValues = z.infer<typeof manualRedemptionSchema>;

// Mock data
const mockInvestors: Investor[] = [
  {
    id: "INV-78901",
    name: "John Smith",
    walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    kycStatus: "approved",
    holdings: [
      { projectId: "PRJ-001", tokenAmount: 5000 },
      { projectId: "PRJ-003", tokenAmount: 2500 },
    ],
  },
  {
    id: "INV-45678",
    name: "Sarah Johnson",
    walletAddress: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    kycStatus: "approved",
    holdings: [{ projectId: "PRJ-002", tokenAmount: 10000 }],
  },
  {
    id: "INV-12345",
    name: "Jane Doe",
    walletAddress: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b",
    kycStatus: "approved",
    holdings: [
      { projectId: "PRJ-001", tokenAmount: 7500 },
      { projectId: "PRJ-002", tokenAmount: 3000 },
    ],
  },
];

const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Green Energy Fund",
    tokenSymbol: "GEF",
    tokenType: "ERC-20",
    issuanceDate: "2023-01-15",
    status: "active",
    hasOpenWindow: true,
  },
  {
    id: "PRJ-002",
    name: "Real Estate Trust",
    tokenSymbol: "RET",
    tokenType: "ERC-1400",
    issuanceDate: "2023-03-22",
    status: "active",
    hasOpenWindow: false,
  },
  {
    id: "PRJ-003",
    name: "Tech Ventures Fund",
    tokenSymbol: "TVF",
    tokenType: "ERC-20",
    issuanceDate: "2022-11-05",
    status: "active",
    hasOpenWindow: true,
  },
];

interface ManualRedemptionFormProps {
  onSubmit?: (values: ManualRedemptionFormValues) => void;
  isLoading?: boolean;
}

const ManualRedemptionForm: React.FC<ManualRedemptionFormProps> = ({
  onSubmit = () => {},
  isLoading = false,
}) => {
  const [investors] = useState<Investor[]>(mockInvestors);
  const [projects] = useState<Project[]>(mockProjects);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [eligibilityStatus, setEligibilityStatus] = useState<
    "eligible" | "ineligible" | null
  >(null);

  const form = useForm<ManualRedemptionFormValues>({
    resolver: zodResolver(manualRedemptionSchema),
    defaultValues: {
      investorId: "",
      projectId: "",
      tokenAmount: "",
      redemptionType: "",
      destinationWalletAddress: "0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t", // Default issuer wallet
      notes: "",
    },
  });

  // Filter investors based on search term
  const filteredInvestors = investors.filter((investor) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      investor.name.toLowerCase().includes(searchLower) ||
      investor.id.toLowerCase().includes(searchLower)
    );
  });

  // Handle investor selection
  const handleInvestorSelect = (investorId: string) => {
    const investor = investors.find((inv) => inv.id === investorId);
    setSelectedInvestor(investor || null);
    form.setValue("investorId", investorId);

    // Reset project selection when investor changes
    form.setValue("projectId", "");
    form.setValue("tokenAmount", "");
    setEligibilityStatus(null);
  };

  // Get eligible projects for selected investor
  const getEligibleProjects = () => {
    if (!selectedInvestor) return [];

    return projects.filter((project) => {
      // Check if investor has holdings in this project
      const holding = selectedInvestor.holdings.find(
        (h) => h.projectId === project.id,
      );

      // For interval funds, also check if there's an open window
      const isEligible =
        holding && (project.hasOpenWindow || project.tokenType !== "ERC-1400");

      return isEligible;
    });
  };

  // Check eligibility when amount changes
  const checkEligibility = (amount: string, projectId: string) => {
    if (!selectedInvestor || !projectId) {
      setEligibilityStatus(null);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setEligibilityStatus(null);
      return;
    }

    // Find investor's holding for this project
    const holding = selectedInvestor.holdings.find(
      (h) => h.projectId === projectId,
    );
    if (!holding) {
      setEligibilityStatus("ineligible");
      return;
    }

    // Check if amount is within available balance
    if (numAmount > holding.tokenAmount) {
      setEligibilityStatus("ineligible");
      return;
    }

    // All checks passed
    setEligibilityStatus("eligible");
  };

  // Handle form submission
  const handleSubmit = (values: ManualRedemptionFormValues) => {
    if (eligibilityStatus !== "eligible") return;
    onSubmit(values);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Manual Redemption Request
        </CardTitle>
        <CardDescription>
          Create a redemption request on behalf of an investor. This request
          will go through the standard approval process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">1. Select Investor</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by investor name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            {filteredInvestors.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No investors found
              </div>
            ) : (
              filteredInvestors.map((investor) => (
                <div
                  key={investor.id}
                  className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedInvestor?.id === investor.id ? "bg-blue-50" : ""}`}
                  onClick={() => handleInvestorSelect(investor.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{investor.name}</h4>
                      <p className="text-sm text-gray-500">{investor.id}</p>
                    </div>
                    <Badge
                      variant={
                        investor.kycStatus === "approved"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {investor.kycStatus === "approved"
                        ? "KYC Approved"
                        : "KYC Pending"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Holdings: </span>
                    {investor.holdings.map((holding, index) => {
                      const project = projects.find(
                        (p) => p.id === holding.projectId,
                      );
                      return (
                        <span key={holding.projectId}>
                          {holding.tokenAmount.toLocaleString()}{" "}
                          {project?.tokenSymbol || ""}
                          {index < investor.holdings.length - 1 ? ", " : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedInvestor && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium mb-4">
                2. Redemption Details
              </h3>

              <div className="p-4 bg-blue-50 rounded-md mb-6">
                <h4 className="font-medium text-blue-800">Selected Investor</h4>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="font-medium">{selectedInvestor.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedInvestor.id}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvestor(null);
                      form.reset();
                      setEligibilityStatus(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-mono">
                      {selectedInvestor.walletAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset amount when project changes
                            form.setValue("tokenAmount", "");
                            setEligibilityStatus(null);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEligibleProjects().map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name} ({project.tokenSymbol})
                                {project.tokenType === "ERC-1400" &&
                                  project.hasOpenWindow &&
                                  " - Window Open"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Only projects where the investor has holdings are
                          shown
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="redemptionType"
                    render={({ field }) => (
                      <FormItem className="mt-4">
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
                              Standard (T+0)
                            </SelectItem>
                            <SelectItem value="express">
                              Express (4hr)
                            </SelectItem>
                            <SelectItem value="scheduled">
                              Scheduled (Next Window)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="tokenAmount"
                    render={({ field }) => {
                      const projectId = form.watch("projectId");
                      const holding = selectedInvestor.holdings.find(
                        (h) => h.projectId === projectId,
                      );
                      const project = projects.find((p) => p.id === projectId);

                      return (
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
                                  checkEligibility(e.target.value, projectId);
                                }}
                                className="pr-16"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-sm text-gray-500">
                                  {project?.tokenSymbol || "TOKENS"}
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          {holding && (
                            <FormDescription>
                              Available: {holding.tokenAmount.toLocaleString()}{" "}
                              {project?.tokenSymbol}
                            </FormDescription>
                          )}
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
                              {parseFloat(field.value) >
                              (holding?.tokenAmount || 0)
                                ? "Exceeds available balance"
                                : "Ineligible for redemption"}
                            </div>
                          )}
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="destinationWalletAddress"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          Destination Wallet Address (Issuer)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="0x..."
                              {...field}
                              className="pl-10"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Wallet className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          The issuer's wallet address where tokens will be sent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Additional information or reason for manual redemption"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-amber-50 rounded-md">
                <h4 className="font-medium text-amber-800">
                  Important Information
                </h4>
                <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
                  <li>
                    This manual redemption will be created on behalf of the
                    selected investor
                  </li>
                  <li>
                    The request will go through the standard approval process
                    requiring 2 of 3 approvals
                  </li>
                  <li>
                    The investor will be notified about this redemption request
                  </li>
                  <li>All actions are logged for audit purposes</li>
                </ul>
              </div>

              <CardFooter className="px-0 pt-6">
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setSelectedInvestor(null);
                      form.reset();
                      setEligibilityStatus(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || eligibilityStatus !== "eligible"}
                  >
                    {isLoading ? "Processing..." : "Submit Manual Redemption"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualRedemptionForm;
