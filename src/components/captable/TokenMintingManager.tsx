import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  Search,
  RefreshCw,
  Coins,
  CheckCircle,
  Filter,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TokenMintingDialog from "./TokenMintingDialog";

interface TokenMintingManagerProps {
  projectId: string;
  projectName?: string;
}

interface TokenSummary {
  tokenType: string;
  totalAmount: number;
  confirmedAmount: number;
  distributedAmount: number;
  mintedAmount: number;
  remainingToMint: number;
  totalCount: number;
  confirmedCount: number;
  distributedCount: number;
  mintedCount: number;
  status: string;
  readyToMint: boolean;
  isMinted: boolean;
  isPartiallyMinted: boolean;
  allocations: any[];
}

interface MintAmount {
  tokenType: string;
  amount: number;
}

const TokenMintingManager = ({
  projectId,
  projectName = "Project",
}: TokenMintingManagerProps) => {
  const [tokenSummaries, setTokenSummaries] = useState<TokenSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);
  const [selectedTokenType, setSelectedTokenType] = useState<string | null>(
    null,
  );
  const [selectedTokenTypes, setSelectedTokenTypes] = useState<string[]>([]);
  const [mintAmounts, setMintAmounts] = useState<MintAmount[]>([]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      console.log(
        "TokenMintingManager: Fetching allocations for project ID:",
        projectId,
      );
      fetchTokenAllocations();
    } else {
      console.warn("TokenMintingManager: No project ID provided");
    }
  }, [projectId]);

  // Update token status whenever token summaries change
  useEffect(() => {
    if (tokenSummaries.length > 0) {
      updateTokenStatus();
    }
  }, [tokenSummaries]);

  // Recalculate status for all token summaries to ensure it's up to date
  const updateTokenStatus = () => {
    setTokenSummaries((prevSummaries) =>
      prevSummaries.map((summary) => {
        const isPartiallyMinted =
          summary.mintedAmount > 0 && summary.remainingToMint > 0;
        let status = "pending";

        if (summary.confirmedAmount === 0) {
          status = "pending";
        } else if (isPartiallyMinted) {
          status = "partially_minted";
        } else if (summary.mintedAmount > 0 && summary.remainingToMint <= 0) {
          status = "minted";
        } else if (summary.confirmedAmount > 0) {
          status = "ready_to_mint";
        }

        return {
          ...summary,
          status,
          readyToMint: summary.confirmedAmount > summary.mintedAmount,
          isMinted: summary.mintedAmount > 0,
          isPartiallyMinted,
        };
      }),
    );
  };

  const fetchTokenAllocations = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching token allocations for project ID:", projectId);

      // Fetch token allocations from the database
      const { data, error } = await supabase
        .from("token_allocations")
        .select(
          `
          id,
          investor_id,
          subscription_id,
          token_type,
          token_amount,
          distributed,
          distribution_date,
          distribution_tx_hash,
          allocation_date,
          minted,
          minting_date,
          minting_tx_hash,
          project_id,
          subscriptions!inner(confirmed, allocated),
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId)
        .order("allocation_date", { ascending: true });

      console.log("Token allocations query result:", { data, error });

      if (error) throw error;

      // Group allocations by token type
      const tokenGroups = (data || []).reduce(
        (acc, allocation) => {
          const tokenType = allocation.token_type || "Unassigned";
          if (!acc[tokenType]) {
            acc[tokenType] = [];
          }
          acc[tokenType].push(allocation);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      // Calculate summaries
      const summaries = Object.entries(tokenGroups).map(
        ([tokenType, allocations]) => {
          const totalAmount = allocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const confirmedAllocations = allocations.filter(
            (a) => a.subscriptions.confirmed && a.subscriptions.allocated,
          );

          const confirmedAmount = confirmedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const mintedAllocations = allocations.filter(
            (a) => a.minted === true,
          );
          const mintedAmount = mintedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const distributedAllocations = allocations.filter(
            (a) => a.distributed,
          );
          const distributedAmount = distributedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          // Calculate remaining tokens to mint
          const remainingToMint = confirmedAmount - mintedAmount;

          // Determine if partially minted
          const isPartiallyMinted = mintedAmount > 0 && remainingToMint > 0;

          // Determine status
          let status = "pending";
          if (confirmedAmount === 0) {
            status = "pending";
          } else if (isPartiallyMinted) {
            status = "partially_minted";
          } else if (mintedAmount > 0 && remainingToMint <= 0) {
            status = "minted";
          } else if (confirmedAmount > 0) {
            status = "ready_to_mint";
          }

          return {
            tokenType,
            totalAmount,
            confirmedAmount,
            distributedAmount,
            mintedAmount,
            remainingToMint,
            totalCount: allocations.length,
            confirmedCount: confirmedAllocations.length,
            distributedCount: distributedAllocations.length,
            mintedCount: mintedAllocations.length,
            status,
            readyToMint: confirmedAmount > mintedAmount,
            isMinted: mintedAmount > 0,
            isPartiallyMinted,
            allocations: allocations,
          };
        },
      );

      // Set initial summaries
      setTokenSummaries(summaries);

      // Initialize mint amounts for each token type
      const initialMintAmounts = summaries.map((summary) => ({
        tokenType: summary.tokenType,
        amount: summary.remainingToMint,
      }));
      setMintAmounts(initialMintAmounts);
    } catch (err) {
      console.error("Error fetching token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to load token allocation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter token summaries based on search query and status filter
  const filteredTokenSummaries = tokenSummaries.filter((summary) => {
    const matchesSearch = summary.tokenType
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || summary.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle mint tokens with specific amounts
  const handleMintTokens = async (tokenTypes: string[]) => {
    try {
      // In a real implementation, this would interact with a blockchain
      // For now, we'll update the database to mark tokens as minted
      const now = new Date().toISOString();
      let totalMinted = 0;

      // For each token type, update the allocations to mark them as minted
      for (const tokenType of tokenTypes) {
        const summary = tokenSummaries.find((s) => s.tokenType === tokenType);
        if (!summary) continue;

        // Get the mint amount for this token type
        const mintAmount =
          mintAmounts.find((m) => m.tokenType === tokenType)?.amount || 0;
        if (mintAmount <= 0) continue;

        // Find all confirmed but not minted allocations for this token type
        const eligibleAllocations = summary.allocations
          .filter(
            (a) =>
              a.subscriptions.confirmed &&
              a.subscriptions.allocated &&
              !a.minted,
          )
          .sort(
            (a, b) =>
              new Date(a.allocation_date).getTime() -
              new Date(b.allocation_date).getTime(),
          );

        let remainingToMint = mintAmount;
        const allocationsToMint = [];

        // Select allocations to mint up to the requested amount
        for (const allocation of eligibleAllocations) {
          if (remainingToMint <= 0) break;

          const allocationAmount = allocation.token_amount || 0;
          if (allocationAmount <= remainingToMint) {
            // Mint the entire allocation
            allocationsToMint.push(allocation.id);
            remainingToMint -= allocationAmount;
            totalMinted += allocationAmount;
          } else {
            // In a real implementation, you might need to split the allocation
            // For this demo, we'll just mint the entire allocation if more than half is needed
            if (remainingToMint > allocationAmount / 2) {
              allocationsToMint.push(allocation.id);
              totalMinted += allocationAmount;
            }
            break;
          }
        }

        if (allocationsToMint.length > 0) {
          // Update the allocations in the database to mark them as minted
          const { error } = await supabase
            .from("token_allocations")
            .update({
              minted: true,
              minting_date: now,
              minting_tx_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
              updated_at: now,
            })
            .in("id", allocationsToMint);

          if (error) throw error;
        }
      }

      toast({
        title: "Tokens Minted",
        description: `Successfully minted ${totalMinted.toLocaleString()} tokens across ${tokenTypes.length} token type(s).`,
      });

      setIsMintDialogOpen(false);
      setSelectedTokenTypes([]);
      fetchTokenAllocations(); // Refresh data after minting
    } catch (err) {
      console.error("Error minting tokens:", err);
      toast({
        title: "Error",
        description: "Failed to mint tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle token type selection for bulk minting
  const handleTokenTypeSelection = (tokenType: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTokenTypes((prev) => [...prev, tokenType]);
    } else {
      setSelectedTokenTypes((prev) =>
        prev.filter((type) => type !== tokenType),
      );
    }
  };

  // Handle mint amount change
  const handleMintAmountChange = (tokenType: string, amount: number) => {
    setMintAmounts((prev) => {
      const existing = prev.find((item) => item.tokenType === tokenType);
      if (existing) {
        return prev.map((item) =>
          item.tokenType === tokenType ? { ...item, amount } : item,
        );
      } else {
        return [...prev, { tokenType, amount }];
      }
    });
  };

  // Handle bulk mint
  const handleBulkMint = () => {
    if (selectedTokenTypes.length === 0) {
      toast({
        title: "No Tokens Selected",
        description: "Please select at least one token type to mint",
        variant: "destructive",
      });
      return;
    }
    handleMintTokens(selectedTokenTypes);
  };

  // Format number
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{projectName} Token Minting</h1>
          <p className="text-sm text-muted-foreground">
            Review and mint tokens for confirmed allocations
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search token types..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              fetchTokenAllocations();
            }}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Export data">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Filter"
            onClick={() =>
              setFilterStatus(filterStatus ? null : "ready_to_mint")
            }
            className={filterStatus ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTokenTypes.length > 0 && (
        <div className="bg-muted/20 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">
            {selectedTokenTypes.length} token type(s) selected
          </span>
          <Button onClick={handleBulkMint}>
            <Coins className="mr-2 h-4 w-4" />
            Mint Selected Tokens
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTokenSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">
                No token allocations found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokenSummaries.map((summary) => (
            <Card
              key={summary.tokenType}
              className="overflow-hidden border-l-4 border-l-primary"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`token-${summary.tokenType}`}
                      checked={selectedTokenTypes.includes(summary.tokenType)}
                      onCheckedChange={(checked) =>
                        handleTokenTypeSelection(summary.tokenType, !!checked)
                      }
                      disabled={!summary.readyToMint}
                    />
                    <CardTitle className="text-lg">
                      {summary.tokenType}
                    </CardTitle>
                  </div>
                  {summary.isPartiallyMinted ? (
                    <Badge className="bg-purple-100 text-purple-800">
                      Partially Minted
                    </Badge>
                  ) : summary.isMinted && !summary.readyToMint ? (
                    <Badge className="bg-blue-100 text-blue-800">Minted</Badge>
                  ) : summary.readyToMint ? (
                    <Badge className="bg-green-100 text-green-800">
                      Ready to Mint
                    </Badge>
                  ) : summary.confirmedAmount === 0 ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending Confirmation
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {summary.confirmedCount} of {summary.totalCount} allocations
                  confirmed ({formatNumber(summary.confirmedAmount)} of{" "}
                  {formatNumber(summary.totalAmount)} tokens)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(summary.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(summary.confirmedAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Minted</p>
                      <p className="text-xl font-medium">
                        {formatNumber(summary.mintedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Distributed
                      </p>
                      <p className="text-xl font-medium">
                        {formatNumber(summary.distributedAmount)}
                      </p>
                    </div>
                  </div>

                  {summary.readyToMint && (
                    <div className="border rounded-md p-3 bg-green-50">
                      <p className="text-sm font-medium text-green-800">
                        Available to Mint
                      </p>
                      <p className="text-xl font-bold text-green-800">
                        {formatNumber(summary.remainingToMint)}
                      </p>
                      <div className="mt-2">
                        <label
                          htmlFor={`mint-amount-${summary.tokenType}`}
                          className="text-xs text-green-800"
                        >
                          Amount to mint:
                        </label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id={`mint-amount-${summary.tokenType}`}
                            type="number"
                            min="0"
                            max={summary.remainingToMint}
                            value={
                              mintAmounts.find(
                                (m) => m.tokenType === summary.tokenType,
                              )?.amount || 0
                            }
                            onChange={(e) =>
                              handleMintAmountChange(
                                summary.tokenType,
                                Math.min(
                                  Number(e.target.value),
                                  summary.remainingToMint,
                                ),
                              )
                            }
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMintAmountChange(
                                summary.tokenType,
                                summary.remainingToMint,
                              )
                            }
                            className="text-xs"
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-2"
                    disabled={!summary.readyToMint}
                    onClick={() => {
                      setSelectedTokenType(summary.tokenType);
                      handleMintTokens([summary.tokenType]);
                    }}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    {summary.isPartiallyMinted
                      ? "Mint Additional Tokens"
                      : summary.isMinted
                        ? "Minted"
                        : "Mint Tokens"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Minting Dialog - We're handling minting directly in the cards now */}
      {/* <TokenMintingDialog
        open={isMintDialogOpen}
        onOpenChange={setIsMintDialogOpen}
        projectId={projectId}
        tokenSummaries={
          selectedTokenType
            ? filteredTokenSummaries
                .filter((summary) => summary.tokenType === selectedTokenType)
                .map((summary) => ({
                  tokenType: summary.tokenType,
                  totalAmount: summary.totalAmount,
                  status: summary.status,
                }))
            : filteredTokenSummaries.map((summary) => ({
                tokenType: summary.tokenType,
                totalAmount: summary.totalAmount,
                status: summary.status,
              }))
        }
        onMintComplete={handleMintTokens}
      /> */}
    </div>
  );
};

export default TokenMintingManager;
