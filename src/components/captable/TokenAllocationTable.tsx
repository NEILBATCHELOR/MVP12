import React, { useState, useMemo, useEffect, memo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Check, Copy, X, AlertCircle, Pencil, MoreHorizontal, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TokenAllocation } from "@/types/centralModels";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// If the imported TokenAllocation doesn't have all the fields we need,
// we can extend it here with additional fields
interface ExtendedTokenAllocation extends TokenAllocation {
  investorEmail?: string;
  subscriptionId?: string;
  currency?: string;
  fiatAmount?: number;
  walletAddress?: string;
  isUpdating?: boolean; // Added for tracking loading state
}

interface TokenAllocationProps {
  allocations: ExtendedTokenAllocation[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateAllocation: (
    id: string,
    amount: number,
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;
  onFinalizeAllocation?: (
    id: string,
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;
  onCopyAddress?: (address: string) => void;
  onEditAllocation: (allocation: ExtendedTokenAllocation) => void;
  loading?: boolean;
  error?: string;
  editable?: boolean;
}

// Format number with commas and 2 decimal places
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Format currency with symbol
const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Memoized allocation row component to prevent unnecessary re-renders
const AllocationRow = memo(({ 
  allocation, 
  isSelected, 
  onSelectId, 
  onEditAllocation, 
  onUpdateAllocation, 
  handleCopyAddress, 
  editMode, 
  setEditMode, 
  editValues, 
  setEditValues, 
  handleEdit, 
  handleSave, 
  handleCancel, 
  handleInputChange, 
  toast 
}: any) => {
  return (
    <TableRow key={allocation.id} data-allocation-id={allocation.id}>
      <TableCell>
        <div className="flex items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectId(allocation.id)}
            aria-label={`Select allocation for ${allocation.investorName}`}
            id={`select-${allocation.id}`}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{allocation.investorName}</div>
        <div className="text-sm text-muted-foreground">
          {allocation.investorEmail}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {allocation.subscriptionId?.substring(0, 12)}...
        </div>
        <div className="text-xs text-muted-foreground">
          {allocation.currency}{" "}
          {allocation.fiatAmount?.toLocaleString()}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {allocation.tokenType || "Unassigned"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {editMode[allocation.id] ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={editValues[allocation.id] || ""}
              onChange={(e) => handleInputChange(allocation.id, e.target.value)}
              className="w-24 h-8 text-right"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(allocation.id);
                if (e.key === "Escape") handleCancel(allocation.id, allocation.allocatedAmount || allocation.subscribedAmount || 0);
              }}
            />
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleSave(allocation.id)}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCancel(allocation.id, allocation.allocatedAmount || allocation.subscribedAmount || 0)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => handleEdit(allocation.id, allocation.allocatedAmount || allocation.subscribedAmount || 0)}
          >
            {formatCurrency(allocation.allocatedAmount || allocation.subscribedAmount || 0)}
          </div>
        )}
      </TableCell>
      <TableCell className="text-center">
        {allocation.isUpdating ? (
          <div className="flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : allocation.allocationConfirmed ? (
          <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">Unconfirmed</Badge>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs truncate max-w-[150px]">
        <div className="flex items-center space-x-1">
          <span className="truncate">
            {allocation.walletAddress || "Not set"}
          </span>
          {allocation.walletAddress && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1"
              title="Copy Address"
              onClick={() => handleCopyAddress(allocation.walletAddress || "")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              disabled={allocation.isUpdating}
            >
              <span className="sr-only">Open menu</span>
              {allocation.isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount>
            <DropdownMenuItem 
              onClick={() => onEditAllocation(allocation)}
              disabled={allocation.isUpdating}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Token Type
            </DropdownMenuItem>
            {!allocation.allocationConfirmed && (
              <DropdownMenuItem
                onClick={() => {
                  onUpdateAllocation(
                    allocation.id,
                    allocation.allocatedAmount,
                    () => {
                      toast({
                        title: "Allocation confirmed",
                        description: "Token allocation has been confirmed successfully",
                      });
                    },
                    (error) => {
                      toast({
                        title: "Error confirming allocation",
                        description: error,
                        variant: "destructive",
                      });
                    }
                  );
                }}
                disabled={allocation.isUpdating}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm Allocation
              </DropdownMenuItem>
            )}
            {allocation.allocationConfirmed && (
              <DropdownMenuItem
                onClick={() => {
                  // For unconfirming, we need to update the backend to set allocation_date to null
                  // We'll use the existing amount but trigger an update to allocation_date via the manager
                  onUpdateAllocation(
                    allocation.id,
                    allocation.allocatedAmount,
                    () => {
                      toast({
                        title: "Allocation unconfirmed",
                        description: "Token allocation has been unconfirmed successfully",
                      });
                    },
                    (error) => {
                      toast({
                        title: "Error unconfirming allocation",
                        description: error,
                        variant: "destructive",
                      });
                    }
                  );
                }}
                disabled={allocation.isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Unconfirm Allocation
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onUpdateAllocation(
                  allocation.id,
                  0,
                  () => {
                    toast({
                      title: "Allocation deleted",
                      description: "Token allocation has been deleted successfully",
                    });
                  },
                  (error) => {
                    toast({
                      title: "Error deleting allocation",
                      description: error,
                      variant: "destructive",
                    });
                  }
                );
              }}
              className="text-red-600"
              disabled={allocation.isUpdating}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Allocation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

AllocationRow.displayName = "AllocationRow";

const TokenAllocationTable: React.FC<TokenAllocationProps> = ({
  allocations,
  selectedIds,
  onSelectId,
  onSelectAll,
  onUpdateAllocation,
  onFinalizeAllocation,
  onCopyAddress,
  onEditAllocation,
  loading = false,
  error,
  editable = true,
}) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});

  // Group allocations by token type - optimized with useMemo
  const groupedAllocations = useMemo<Record<string, ExtendedTokenAllocation[]>>(() => {
    const grouped: Record<string, ExtendedTokenAllocation[]> = {};
    
    allocations.forEach((allocation) => {
      const tokenType = allocation.tokenType || "Unknown";
      if (!grouped[tokenType]) {
        grouped[tokenType] = [];
      }
      grouped[tokenType].push(allocation);
    });
    
    return grouped;
  }, [allocations]);

  // Calculate totals for each token type - optimized with useMemo
  const tokenTypeTotals = useMemo(() => {
    const totals: Record<string, { allocated: number; subscribed: number }> = {};
    
    Object.entries(groupedAllocations).forEach(([tokenType, allocations]) => {
      totals[tokenType] = allocations.reduce(
        (acc, curr) => {
          return {
            allocated: acc.allocated + (curr.allocatedAmount || 0),
            subscribed: acc.subscribed + (curr.subscribedAmount || 0),
          };
        },
        { allocated: 0, subscribed: 0 }
      );
    });
    
    return totals;
  }, [groupedAllocations]);

  // Calculate grand totals - optimized with useMemo
  const grandTotal = useMemo(() => {
    return Object.values(tokenTypeTotals).reduce(
      (acc, curr) => {
        return {
          allocated: acc.allocated + curr.allocated,
          subscribed: acc.subscribed + curr.subscribed,
        };
      },
      { allocated: 0, subscribed: 0 }
    );
  }, [tokenTypeTotals]);

  // Handle entering edit mode for an allocation
  const handleEdit = (id: string, currentAmount: number) => {
    setEditMode({ ...editMode, [id]: true });
    setEditValues({ ...editValues, [id]: currentAmount.toString() });
  };

  // Handle selecting an allocation
  const handleSelectId = (id: string) => (checked: boolean | 'indeterminate') => {
    onSelectId(id);
  };

  // Handle saving edited allocation
  const handleSave = (id: string) => {
    const newAmount = parseFloat(editValues[id]);
    if (isNaN(newAmount) || newAmount < 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    onUpdateAllocation(
      id, 
      newAmount,
      () => {
        setEditMode({ ...editMode, [id]: false });
        toast({
          title: "Allocation updated",
          description: "Token allocation has been updated successfully",
        });
      },
      (error) => {
        toast({
          title: "Error updating allocation",
          description: error,
          variant: "destructive",
        });
      }
    );
  };

  // Handle canceling edit mode
  const handleCancel = (id: string, originalAmount: number) => {
    setEditMode({ ...editMode, [id]: false });
    setEditValues({ ...editValues, [id]: originalAmount.toString() });
  };

  // Handle input change for edited allocation
  const handleInputChange = (id: string, value: string) => {
    setEditValues({ ...editValues, [id]: value });
  };

  // Handle selecting all allocations
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    onSelectAll(checked === true);
  };

  // Handle copying wallet address
  const handleCopyAddress = (address: string) => {
    if (onCopyAddress) {
      onCopyAddress(address);
    } else {
      navigator.clipboard.writeText(address).then(
        () => {
          toast({
            title: "Address copied",
            description: "Wallet address has been copied to clipboard",
          });
        },
        (err) => {
          toast({
            title: "Error copying address",
            description: "Could not copy the address to clipboard",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Handle finalizing selected allocations
  const handleFinalizeSelected = () => {
    if (onFinalizeAllocation && selectedIds.length > 0) {
      // We could implement batch processing here
      toast({
        title: "Finalizing allocations",
        description: `Processing ${selectedIds.length} allocation(s)`,
      });
      
      // For now just inform the user
      toast({
        title: "Batch finalization",
        description: "Batch finalization is not yet implemented",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-destructive/10">
        <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground">No token allocations found</p>
      </div>
    );
  }

  // If we have more than 100 allocations, add a note about performance
  const hasManyAllocations = allocations.length > 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Token Allocation</h2>
          <p className="text-sm text-muted-foreground">
            Manage token allocations for confirmed subscriptions
            {hasManyAllocations && " • Displaying a large number of records"}
            {selectedIds.length > 0 && ` • ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectAll(false)}
              className="text-xs"
            >
              Clear Selection
            </Button>
          )}
          <Button
            onClick={handleFinalizeSelected}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Finalize Allocations</span>
          </Button>
        </div>
      </div>

      {/* Token Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(tokenTypeTotals).map(([tokenType, totals]) => (
          <div
            key={tokenType}
            className="bg-muted/20 rounded-lg p-4 border"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{tokenType}</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscribed:</span>
                <span>{formatCurrency(totals.subscribed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allocated:</span>
                <span>{formatCurrency(totals.allocated)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <div className="flex items-center space-x-1">
                  <Checkbox
                    checked={
                      allocations.length > 0 &&
                      selectedIds.length === allocations.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all allocations"
                    id="select-all"
                  />
                  <label 
                    htmlFor="select-all" 
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                  >
                    {allocations.length > 0 && selectedIds.length === allocations.length 
                      ? "All" 
                      : selectedIds.length > 0 
                        ? `${selectedIds.length}` 
                        : ""}
                  </label>
                </div>
              </TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Token Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((allocation) => (
              <AllocationRow
                key={allocation.id}
                allocation={allocation}
                isSelected={selectedIds.includes(allocation.id)}
                onSelectId={onSelectId}
                onEditAllocation={onEditAllocation}
                onUpdateAllocation={onUpdateAllocation}
                handleCopyAddress={handleCopyAddress}
                editMode={editMode}
                setEditMode={setEditMode}
                editValues={editValues}
                setEditValues={setEditValues}
                handleEdit={handleEdit}
                handleSave={handleSave}
                handleCancel={handleCancel}
                handleInputChange={handleInputChange}
                toast={toast}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TokenAllocationTable;
