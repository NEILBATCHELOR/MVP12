import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Upload, 
  Edit, 
  Download, 
  ListFilter, 
  Trash,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import TokenAllocationTable from "./TokenAllocationTable";
import AllocationConfirmationDialog from "./AllocationConfirmationDialog";
import TokenAllocationForm from "./TokenAllocationForm";
import TokenAllocationUploadDialog from "./TokenAllocationUploadDialog";
import TokenAllocationExportDialog from "./TokenAllocationExportDialog";
import BulkStatusUpdateDialog from "./BulkStatusUpdateDialog";
import { getTokensByStatus } from "@/lib/services/tokenService";
import { TokenStatus } from "@/types/centralModels";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Tag } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TokenAllocationManagerProps {
  projectId: string;
  projectName?: string;
}

// Add this schema for the bulk token type update
const bulkTokenTypeSchema = z.object({
  token_type: z.string().min(1, { message: "Token type is required" }),
});

const TokenAllocationManager = ({
  projectId,
  projectName = "Project",
}: TokenAllocationManagerProps) => {
  const [activeTab, setActiveTab] = useState("allocations");
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAllocationIds, setSelectedAllocationIds] = useState<string[]>(
    [],
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isAllocationFormOpen, setIsAllocationFormOpen] = useState(false);
  const [isAllocationUploadOpen, setIsAllocationUploadOpen] = useState(false);
  const [isAllocationExportOpen, setIsAllocationExportOpen] = useState(false);
  const [isBulkStatusUpdateOpen, setIsBulkStatusUpdateOpen] = useState(false);
  const [isBulkTokenTypeUpdateOpen, setIsBulkTokenTypeUpdateOpen] = useState(false);
  const [isEditAllocationOpen, setIsEditAllocationOpen] = useState(false);
  const [currentEditAllocation, setCurrentEditAllocation] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const { toast } = useToast();
  const [isSelectActionOpen, setIsSelectActionOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchAllocations();
      fetchAllocationTokens();
    }
  }, [projectId]);

  // Fetch tokens with eligible statuses for allocation
  const fetchAllocationTokens = async () => {
    try {
      // Get tokens with eligible statuses
      const eligibleStatuses = [
        TokenStatus.APPROVED,
        TokenStatus.READY_TO_MINT,
        TokenStatus.MINTED,
        TokenStatus.DEPLOYED
      ];
      
      const tokens = await getTokensByStatus(projectId, eligibleStatuses);
      
      console.log("Available tokens for allocation:", tokens);
      
      // Transform tokens for the dropdown
      const formattedTokens = tokens.map(token => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        type: `${token.name} (${token.symbol}) - ${token.standard}`,
        standard: token.standard,
        status: token.status
      }));
      
      setAvailableTokens(formattedTokens);
    } catch (err) {
      console.error("Error fetching allocation tokens:", err);
    }
  };

  const fetchAllocations = async () => {
    try {
      setIsLoading(true);

      // Query token_allocations table directly
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
          allocation_date,
          notes,
          subscriptions!inner(currency, fiat_amount, confirmed, allocated, subscription_id),
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId);

      if (error) throw error;

      // Transform data for the table
      const transformedAllocations =
        data?.map((allocation) => {
          return {
            id: allocation.id,
            investorId: allocation.investor_id,
            investorName: allocation.investors.name,
            investorEmail: allocation.investors.email,
            walletAddress: allocation.investors.wallet_address,
            tokenType: allocation.token_type,
            subscriptionId: allocation.subscriptions.subscription_id,
            currency: allocation.subscriptions.currency,
            fiatAmount: allocation.subscriptions.fiat_amount || 0,
            subscribedAmount: allocation.subscriptions.fiat_amount || 0,
            allocatedAmount: allocation.token_amount || 0,
            confirmed: allocation.subscriptions.confirmed || false,
            allocated: allocation.subscriptions.allocated || false,
            allocationConfirmed: allocation.allocation_date ? true : false,
            distributed: allocation.distributed || false,
          };
        }) || [];

      setAllocations(transformedAllocations);

      // No need to calculate token summaries anymore
    } catch (err) {
      console.error("Error fetching allocations:", err);
      toast({
        title: "Error",
        description: "Failed to load allocation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed calculateTokenSummaries function as it's now in TokenMintingManager

  // Filter allocations based on search query
  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      allocation.investorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.investorEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.tokenType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle allocation selection
  const handleSelectId = (id: string) => {
    setSelectedAllocationIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedAllocationIds(filteredAllocations.map((a) => a.id));
    } else {
      setSelectedAllocationIds([]);
    }
  };

  // Handle update allocation
  const handleUpdateAllocation = async (
    id: string,
    amount: number,
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => {
    try {
      // Set loading state for this specific allocation
      setAllocations(prev => 
        prev.map(a => a.id === id ? { ...a, isUpdating: true } : a)
      );

      // Find the allocation
      const allocation = allocations.find((a) => a.id === id);
      if (!allocation) {
        throw new Error("Allocation not found");
      }

      // Update token allocation amount
      const updates: Record<string, any> = {
        token_amount: amount,
        updated_at: new Date().toISOString(),
      };

      // If amount is 0, we're deleting the allocation
      if (amount === 0) {
        const { error } = await supabase
          .from("token_allocations")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        // Remove from local state
        setAllocations(prev => prev.filter(a => a.id !== id));
        
        toast({
          title: "Allocation Deleted",
          description: "Token allocation has been deleted successfully.",
        });
      } else {
        // Check if we're confirming or unconfirming based on current state
        // If currently unconfirmed and in the confirm dropdown action, set allocation_date
        if (!allocation.allocationConfirmed && allocation.allocatedAmount === amount) {
          updates.allocation_date = new Date().toISOString();
        }
        
        // If currently confirmed and in the unconfirm dropdown action, clear allocation_date
        if (allocation.allocationConfirmed && allocation.allocatedAmount === amount) {
          updates.allocation_date = null;
        }

        const { error } = await supabase
          .from("token_allocations")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        
        // Update only the relevant allocation
        setAllocations(prev => 
          prev.map(a => {
            if (a.id === id) {
              // Create updated allocation based on the operation
              let updatedAllocation = { ...a, isUpdating: false, allocatedAmount: amount };
              
              // If confirming
              if (!a.allocationConfirmed && a.allocatedAmount === amount) {
                updatedAllocation.allocationConfirmed = true;
              }
              
              // If unconfirming
              if (a.allocationConfirmed && a.allocatedAmount === amount) {
                updatedAllocation.allocationConfirmed = false;
              }
              
              return updatedAllocation;
            }
            return a;
          })
        );

        toast({
          title: "Allocation Updated",
          description: "Token allocation has been updated successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error updating allocation:", err);
      
      // Clear loading state on error
      setAllocations(prev => 
        prev.map(a => a.id === id ? { ...a, isUpdating: false } : a)
      );
      
      const errorMessage = "Failed to update allocation. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Handle confirm allocations
  const handleConfirmAllocations = async () => {
    try {
      const now = new Date().toISOString();

      // Update token_allocations to set allocation_date (which marks them as confirmed)
      const { error: updateError } = await supabase
        .from("token_allocations")
        .update({
          allocation_date: now,
          updated_at: now,
        })
        .in("id", selectedAllocationIds);

      if (updateError) throw updateError;

      // Update local state
      setAllocations((prev) =>
        prev.map((a) =>
          selectedAllocationIds.includes(a.id)
            ? { ...a, allocationConfirmed: true }
            : a,
        ),
      );

      // No need to recalculate token summaries

      toast({
        title: "Allocations Confirmed",
        description: `${selectedAllocationIds.length} allocations have been confirmed.`,
      });

      // Clear selection
      setSelectedAllocationIds([]);
      setIsConfirmDialogOpen(false);

      // Refresh allocations to ensure UI is up to date
      fetchAllocations();
    } catch (err) {
      console.error("Error confirming allocations:", err);
      toast({
        title: "Error",
        description: "Failed to confirm allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Removed handleMintTokens function as it's now in TokenMintingManager

  // Handle export token allocations
  const handleExportAllocations = async (options: any) => {
    try {
      setIsLoading(true);

      // Select allocations to export
      const allocationsToExport =
        options.exportType === "selected"
          ? allocations.filter((a) => selectedAllocationIds.includes(a.id))
          : allocations;

      // Prepare data for export
      const exportData = allocationsToExport.map((allocation) => {
        const data: Record<string, any> = {
          allocation_id: allocation.id,
          token_type: allocation.tokenType,
          token_amount: allocation.allocatedAmount,
          allocation_date: allocation.allocationConfirmed
            ? new Date(allocation.allocationDate).toLocaleDateString()
            : "",
          distributed: allocation.distributed ? "Yes" : "No",
        };

        // Include investor details if requested
        if (options.includeInvestorDetails) {
          data.investor_name = allocation.investorName;
          data.investor_email = allocation.investorEmail;
          data.wallet_address = allocation.walletAddress || "";
        }

        // Include subscription details if requested
        if (options.includeSubscriptionDetails) {
          data.subscription_id = allocation.subscriptionId;
          data.currency = allocation.currency;
          data.fiat_amount = allocation.fiatAmount;
        }

        // Include status fields if requested
        if (options.includeStatus) {
          data.subscription_confirmed = allocation.confirmed ? "Yes" : "No";
          data.allocation_confirmed = allocation.allocationConfirmed
            ? "Yes"
            : "No";
          data.distributed = allocation.distributed ? "Yes" : "No";
        }

        // Include token details if requested
        if (options.includeTokenDetails) {
          const tokenParts = allocation.tokenType.split(' - ');
          const nameSymbolPart = tokenParts[0] || '';
          const standardPart = tokenParts[1] || '';
          
          // Extract name and symbol from format "Name (Symbol)"
          const nameSymbolMatch = nameSymbolPart.match(/(.+) \((.+)\)/);
          if (nameSymbolMatch) {
            data.token_name = nameSymbolMatch[1];
            data.token_symbol = nameSymbolMatch[2];
          } else {
            data.token_name = nameSymbolPart;
            data.token_symbol = "";
          }
          
          data.token_standard = standardPart;
        }

        return data;
      });

      if (exportData.length === 0) {
        toast({
          title: "No Data",
          description: "No allocations to export",
          variant: "destructive",
        });
        return;
      }

      // Create headers based on selected options
      const headers = ["Token Type", "Allocated Amount"];

      if (options.includeInvestorDetails) {
        headers.push("Investor Name", "Investor Email", "Wallet Address");
      }

      if (options.includeSubscriptionDetails) {
        headers.push("Subscription ID", "Currency", "Subscription Amount");
      }

      if (options.includeStatus) {
        headers.push("Confirmed", "Distributed");
      }

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...exportData.map((data) => {
          const row = [
            `"${data.token_type}"`,
            data.token_amount,
          ];

          if (options.includeInvestorDetails) {
            row.push(
              `"${data.investor_name}"`,
              `"${data.investor_email}"`,
              `"${data.wallet_address}"`,
            );
          }

          if (options.includeSubscriptionDetails) {
            row.push(
              `"${data.subscription_id}"`,
              `"${data.currency}"`,
              data.fiat_amount,
            );
          }

          if (options.includeStatus) {
            row.push(
              data.subscription_confirmed,
              data.distributed,
            );
          }

          return row.join(",");
        }),
      ].join("\n");

      // Create and download the file
      if (options.fileFormat === "csv") {
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `token_allocations_export_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For Excel, we'd normally use a library like xlsx
        // For simplicity, we'll just use CSV with an .xlsx extension
        const blob = new Blob([csvContent], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `token_allocations_export_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Success",
        description: `${exportData.length} token allocations exported successfully`,
      });
    } catch (err) {
      console.error("Error exporting token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to export token allocations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete allocation
  const handleDeleteAllocation = async (id: string) => {
    try {
      // Delete the allocation from the database
      const { error } = await supabase
        .from("token_allocations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setAllocations((prev) => prev.filter((a) => a.id !== id));

      toast({
        title: "Allocation Deleted",
        description: "Token allocation has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting allocation:", err);
      toast({
        title: "Error",
        description: "Failed to delete allocation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding token allocations
  const handleAddTokenAllocations = async (allocationData: any) => {
    try {
      const { subscription_id, investor_id, project_id, allocations, notes } =
        allocationData;

      // Get subscription details to check amount
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("fiat_amount")
          .eq("id", subscription_id)
          .single();

      if (subscriptionError) throw subscriptionError;

      const hasValidAmount =
        subscriptionData && subscriptionData.fiat_amount > 0;
      const now = new Date().toISOString();

      // Create token allocations for each token type
      for (const allocation of allocations) {
        const { data, error } = await supabase
          .from("token_allocations")
          .insert({
            investor_id,
            subscription_id,
            project_id,
            token_type: allocation.token_type,
            token_amount: allocation.token_amount,
            notes,
            // Auto-confirm if there's a valid subscription amount
            allocation_date: hasValidAmount ? now : null,
            created_at: now,
            updated_at: now,
          });

        if (error) throw error;
      }

      // Update subscription to mark as allocated
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ allocated: true, updated_at: new Date().toISOString() })
        .eq("id", subscription_id);

      if (updateError) throw updateError;

      // Refresh allocations
      fetchAllocations();

      toast({
        title: "Success",
        description: `${allocations.length} token allocation(s) added successfully`,
      });

      setIsAllocationFormOpen(false);
    } catch (err) {
      console.error("Error adding token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to add token allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk upload of token allocations
  const handleUploadTokenAllocations = async (allocationsData: any[]) => {
    try {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is required. Please select a project first.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const now = new Date().toISOString();
      let successCount = 0;

      for (const allocation of allocationsData) {
        try {
          // Get subscription details
          const { data: subscriptionData, error: subscriptionError } =
            await supabase
              .from("subscriptions")
              .select("id, investor_id")
              .eq("subscription_id", allocation.subscription_id)
              .eq("project_id", projectId)
              .single();

          if (subscriptionError) {
            console.error(
              `Subscription not found: ${allocation.subscription_id}`,
            );
            continue;
          }

          // Create token allocation
          const { error: insertError } = await supabase
            .from("token_allocations")
            .insert({
              subscription_id: subscriptionData.id,
              investor_id: subscriptionData.investor_id,
              project_id: projectId,
              token_type: allocation.token_type,
              token_amount: allocation.token_amount,
              created_at: now,
              updated_at: now,
            });

          if (insertError) {
            console.error("Error inserting allocation:", insertError);
            continue;
          }

          // Update subscription to mark as allocated
          await supabase
            .from("subscriptions")
            .update({ allocated: true, updated_at: now })
            .eq("id", subscriptionData.id);

          successCount++;
        } catch (err) {
          console.error("Error processing allocation:", err);
        }
      }

      toast({
        title: "Success",
        description: `${successCount} of ${allocationsData.length} token allocations uploaded successfully`,
      });
      setIsAllocationUploadOpen(false);

      // Refresh allocations
      fetchAllocations();
    } catch (err) {
      console.error("Error uploading token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to upload token allocations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to handle editing an allocation
  const handleEditAllocation = (allocation: any) => {
    setCurrentEditAllocation(allocation);
    setIsEditAllocationOpen(true);
  };

  // Update allocation token type
  const handleUpdateTokenType = async (id: string, tokenType: string) => {
    try {
      console.log("Attempting to update token type:", { id, tokenType });
      
      // Validate token type format to match constraint
      if (!tokenType || !tokenType.includes('(') || !tokenType.includes(')')) {
        toast({
          title: "Invalid token type",
          description: "Token type must be in the format 'Name (Symbol) - Standard'",
          variant: "destructive",
        });
        return;
      }
      
      // Update token allocation type in database
      const { error } = await supabase
        .from("token_allocations")
        .update({
          token_type: tokenType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating token type:", error);
        
        if (error.code === '23514') {
          toast({
            title: "Invalid token type format",
            description: "The token type format doesn't meet database constraints. Use the dropdown to select a valid option.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update token type. Database error: " + error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Update local state
      setAllocations(prev =>
        prev.map(a => {
          if (a.id === id) {
            return { ...a, tokenType };
          }
          return a;
        })
      );

      toast({
        title: "Allocation Updated",
        description: "Token type has been updated successfully.",
      });
      
      setIsEditAllocationOpen(false);
    } catch (err) {
      console.error("Error updating token type:", err);
      toast({
        title: "Error",
        description: "Failed to update token type. Please ensure the token type is valid.",
        variant: "destructive",
      });
    }
  };

  // Add new function to handle bulk token type updates
  const handleBulkTokenTypeUpdate = async (tokenType: string) => {
    try {
      if (!projectId || selectedAllocationIds.length === 0) return;

      setIsLoading(true);
      const now = new Date().toISOString();
      
      // Track which allocations are being updated
      setAllocations(prev => 
        prev.map(a => selectedAllocationIds.includes(a.id) ? { ...a, isUpdating: true } : a)
      );

      // Update token_type for all selected allocations
      const { error } = await supabase
        .from("token_allocations")
        .update({
          token_type: tokenType,
          updated_at: now
        })
        .in("id", selectedAllocationIds);

      if (error) {
        console.error("Error updating token types:", error);
        throw error;
      }

      // Update local state
      setAllocations(prev =>
        prev.map(a => {
          if (selectedAllocationIds.includes(a.id)) {
            return { ...a, tokenType, isUpdating: false };
          }
          return a;
        })
      );

      toast({
        title: "Success",
        description: `Updated token type for ${selectedAllocationIds.length} allocations`,
      });

      // Clear selection
      setSelectedAllocationIds([]);
      setIsBulkTokenTypeUpdateOpen(false);
    } catch (err) {
      console.error("Error updating token types:", err);
      
      // Clear updating state
      setAllocations(prev => 
        prev.map(a => selectedAllocationIds.includes(a.id) ? { ...a, isUpdating: false } : a)
      );
      
      toast({
        title: "Error",
        description: "Failed to update token types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      if (!projectId || selectedAllocationIds.length === 0) return;

      // Delete all selected allocations
      const { error } = await supabase
        .from("token_allocations")
        .delete()
        .in("id", selectedAllocationIds);

      if (error) throw error;

      // Update local state
      setAllocations((prev) =>
        prev.filter((a) => !selectedAllocationIds.includes(a.id))
      );

      toast({
        title: "Success",
        description: `${selectedAllocationIds.length} allocations deleted successfully`,
      });

      // Clear selection
      setSelectedAllocationIds([]);
      setIsBulkDeleteOpen(false);
    } catch (err) {
      console.error("Error deleting allocations:", err);
      toast({
        title: "Error",
        description: "Failed to delete allocations",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{projectName} Token Allocations</h1>
          {isLoading && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search allocations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAllocations}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAllocationUploadOpen(true)}
            disabled={!projectId}
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAllocationExportOpen(true)}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAllocationFormOpen(true)}
            disabled={!projectId}
          >
            <Plus className="h-4 w-4" />
            <span>Add Allocation</span>
          </Button>
          {selectedAllocationIds.length > 0 && (
            <DropdownMenu modal={false} open={isSelectActionOpen} onOpenChange={setIsSelectActionOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>Bulk Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" forceMount>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => {
                    setIsBulkStatusUpdateOpen(true);
                    setIsSelectActionOpen(false);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setIsBulkTokenTypeUpdateOpen(true);
                    setIsSelectActionOpen(false);
                  }}>
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Update Token Type</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setIsBulkDeleteOpen(true);
                      setIsSelectActionOpen(false);
                    }}
                    className="text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete Allocations</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div>
        <TokenAllocationTable
          allocations={filteredAllocations}
          selectedIds={selectedAllocationIds}
          onSelectId={handleSelectId}
          onSelectAll={handleSelectAll}
          onUpdateAllocation={handleUpdateAllocation}
          onEditAllocation={handleEditAllocation}
          loading={isLoading}
        />
      </div>

      {/* Allocation Confirmation Dialog */}
      <AllocationConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        selectedInvestorIds={selectedAllocationIds}
        onConfirm={handleConfirmAllocations}
        projectId={projectId}
        allocations={filteredAllocations
          .filter((allocation) => selectedAllocationIds.includes(allocation.id))
          .map((allocation) => ({
            investorId: allocation.investorId,
            investorName: allocation.investorName,
            tokenType: allocation.tokenType,
            amount: allocation.allocatedAmount,
          }))}
      />

      {/* Token Allocation Upload Dialog */}
      <TokenAllocationUploadDialog
        open={isAllocationUploadOpen}
        onOpenChange={setIsAllocationUploadOpen}
        onUploadComplete={handleUploadTokenAllocations}
        projectId={projectId}
      />

      {/* Token Allocation Export Dialog */}
      <TokenAllocationExportDialog
        open={isAllocationExportOpen}
        onOpenChange={setIsAllocationExportOpen}
        onExport={handleExportAllocations}
        selectedCount={selectedAllocationIds.length}
        totalCount={filteredAllocations.length}
      />

      {/* Token Allocation Form */}
      <TokenAllocationForm
        open={isAllocationFormOpen}
        onOpenChange={setIsAllocationFormOpen}
        onSubmit={handleAddTokenAllocations}
        projectId={projectId}
      />

      {/* Bulk Status Update Dialog */}
      <BulkStatusUpdateDialog
        open={isBulkStatusUpdateOpen}
        onOpenChange={setIsBulkStatusUpdateOpen}
        title="Update Allocation Status"
        description="Change the status of selected allocations"
        selectedCount={selectedAllocationIds.length}
        statusOptions={[
          { value: "confirmed", label: "Confirmed" },
          { value: "unconfirmed", label: "Unconfirmed" },
          { value: "distributed", label: "Distributed" },
          { value: "not_distributed", label: "Not Distributed" },
        ]}
        onConfirm={async (newStatus) => {
          try {
            if (!projectId || selectedAllocationIds.length === 0) return;

            const now = new Date().toISOString();
            const updates: Record<string, any> = { updated_at: now };

            if (newStatus === "confirmed") {
              updates.allocation_date = now;
            } else if (newStatus === "unconfirmed") {
              updates.allocation_date = null;
            } else if (newStatus === "distributed") {
              updates.distributed = true;
              updates.distribution_date = now;
            } else if (newStatus === "not_distributed") {
              updates.distributed = false;
              updates.distribution_date = null;
            }

            // Update all selected allocations
            const { error } = await supabase
              .from("token_allocations")
              .update(updates)
              .in("id", selectedAllocationIds);

            if (error) throw error;

            // Update local state
            setAllocations((prev) =>
              prev.map((a) => {
                if (selectedAllocationIds.includes(a.id)) {
                  const updated = { ...a };

                  if (newStatus === "confirmed") {
                    updated.allocationConfirmed = true;
                  } else if (newStatus === "unconfirmed") {
                    updated.allocationConfirmed = false;
                  } else if (newStatus === "distributed") {
                    updated.distributed = true;
                  } else if (newStatus === "not_distributed") {
                    updated.distributed = false;
                  }

                  return updated;
                }
                return a;
              }),
            );

            toast({
              title: "Success",
              description: `${selectedAllocationIds.length} allocations updated to ${newStatus}`,
            });

            // Clear selection
            setSelectedAllocationIds([]);
          } catch (err) {
            console.error("Error updating allocation status:", err);
            toast({
              title: "Error",
              description: "Failed to update allocation status",
              variant: "destructive",
            });
            throw err; // Re-throw to be caught by the dialog
          }
        }}
      />

      {/* Bulk Token Type Update Dialog */}
      <BulkTokenTypeUpdateDialog
        open={isBulkTokenTypeUpdateOpen}
        onOpenChange={setIsBulkTokenTypeUpdateOpen}
        availableTokens={availableTokens}
        onSubmit={handleBulkTokenTypeUpdate}
        selectedCount={selectedAllocationIds.length}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog 
        open={isBulkDeleteOpen} 
        onOpenChange={(open) => {
          setIsBulkDeleteOpen(open);
          // Give time for animation to complete before re-enabling focus
          if (!open) {
            setTimeout(() => {
              const bulkActionsButton = document.querySelector('[aria-haspopup="menu"]');
              if (bulkActionsButton instanceof HTMLElement) {
                bulkActionsButton.focus();
              }
            }, 100);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Allocations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedAllocationIds.length} allocation{selectedAllocationIds.length !== 1 && 's'}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedAllocationIds.length} Allocation{selectedAllocationIds.length !== 1 && 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Token Allocation Dialog */}
      <EditTokenAllocationDialog
        open={isEditAllocationOpen}
        onOpenChange={setIsEditAllocationOpen}
        allocation={currentEditAllocation}
        availableTokens={availableTokens}
        onSubmit={(tokenType) => {
          if (currentEditAllocation) {
            handleUpdateTokenType(currentEditAllocation.id, tokenType);
          }
        }}
      />
    </div>
  );
};

// Add a new component for bulk token type updates
interface BulkTokenTypeUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTokens: any[];
  onSubmit: (tokenType: string) => void;
  selectedCount: number;
}

const BulkTokenTypeUpdateDialog = ({
  open,
  onOpenChange,
  availableTokens,
  onSubmit,
  selectedCount,
}: BulkTokenTypeUpdateDialogProps) => {
  const form = useForm<z.infer<typeof bulkTokenTypeSchema>>({
    resolver: zodResolver(bulkTokenTypeSchema),
    defaultValues: {
      token_type: "",
    },
  });

  // Only show available tokens that match the right format
  const filteredTokens = availableTokens.filter(token => 
    token.type && token.type.includes('(') && token.type.includes(')')
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    
    // Reset form when dialog is closed
    if (!open) {
      form.reset();
      // Improve focus management
      setTimeout(() => {
        const bulkActionsButton = document.querySelector('[aria-haspopup="menu"]');
        if (bulkActionsButton instanceof HTMLElement) {
          bulkActionsButton.focus();
        }
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Token Types</DialogTitle>
          <DialogDescription>
            Update the token type for {selectedCount} selected allocation{selectedCount !== 1 && 's'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => {
            onSubmit(data.token_type);
            // Don't close the dialog here - let the onSubmit handler do it
          })} className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h4 className="font-medium">Update Information</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You are about to update the token type for {selectedCount} allocation{selectedCount !== 1 && 's'}.
                  This action cannot be undone.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="token_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Token Type</FormLabel>
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
                        {filteredTokens.map((token) => (
                          <SelectItem key={token.id} value={token.type}>
                            {token.type} ({token.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update {selectedCount} Allocation{selectedCount !== 1 && 's'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Add new component for editing token allocation
interface EditTokenAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: any;
  availableTokens: any[];
  onSubmit: (tokenType: string) => void;
}

const editAllocationSchema = z.object({
  token_type: z.string().min(1, { message: "Token type is required" }),
});

const EditTokenAllocationDialog = ({
  open,
  onOpenChange,
  allocation,
  availableTokens,
  onSubmit,
}: EditTokenAllocationDialogProps) => {
  const form = useForm<z.infer<typeof editAllocationSchema>>({
    resolver: zodResolver(editAllocationSchema),
    defaultValues: {
      token_type: allocation?.tokenType || "",
    },
  });
  
  // Reset form when allocation changes
  React.useEffect(() => {
    if (allocation) {
      form.reset({
        token_type: allocation.tokenType,
      });
    }
  }, [allocation, form]);

  if (!allocation) return null;

  // Only show available tokens that match the right format
  const filteredTokens = availableTokens.filter(token => 
    token.type && token.type.includes('(') && token.type.includes(')')
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    
    // Reset form when dialog is closed
    if (!open) {
      // Focus management - find the relevant row in the table
      setTimeout(() => {
        const row = document.querySelector(`[data-allocation-id="${allocation.id}"]`);
        if (row instanceof HTMLElement) {
          const actionButton = row.querySelector('button');
          if (actionButton instanceof HTMLElement) {
            actionButton.focus();
          }
        }
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Token Allocation</DialogTitle>
          <DialogDescription>
            Update the token type for {allocation?.investorName}'s allocation
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => {
            onSubmit(data.token_type);
            // The calling component will close the dialog
          })} className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h4 className="font-medium">Allocation Details</h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-500">Investor:</p>
                    <p>{allocation?.investorName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount:</p>
                    <p>{allocation?.allocatedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Subscription:</p>
                    <p>{allocation?.currency} {allocation?.fiatAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Type:</p>
                    <p className="font-mono">{allocation?.tokenType}</p>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="token_type"
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
                        {filteredTokens.map((token) => (
                          <SelectItem key={token.id} value={token.type}>
                            {token.type} ({token.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TokenAllocationManager;
