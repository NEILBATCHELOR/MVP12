import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Check,
  AlertTriangle,
  FileText,
  ExternalLink,
  User,
  Shield,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  getTransactionHistory,
  TransactionEvent,
} from "@/lib/api/transactionHistoryApi";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionHistoryProps {
  requestId?: string;
  showFilters?: boolean;
  maxHeight?: string;
  limit?: number;
}

const TransactionHistory = ({
  requestId,
  showFilters = true,
  maxHeight = "600px",
  limit,
}: TransactionHistoryProps) => {
  const [events, setEvents] = useState<TransactionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!requestId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getTransactionHistory(requestId);
        setEvents(data);
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError("Failed to load transaction history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [requestId]);

  const handleRefresh = async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getTransactionHistory(requestId);
      setEvents(data);
    } catch (err) {
      console.error("Error refreshing transaction history:", err);
      setError("Failed to refresh transaction history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      // Apply event type filter
      if (eventTypeFilter !== "all" && event.eventType !== eventTypeFilter) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.eventType.toLowerCase().includes(searchLower) ||
          event.actor?.toLowerCase().includes(searchLower) ||
          event.actorRole?.toLowerCase().includes(searchLower) ||
          JSON.stringify(event.data).toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Apply limit if specified
  const displayedEvents = limit
    ? filteredEvents.slice(0, limit)
    : filteredEvents;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get event type badge color
  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case "creation":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Creation
          </Badge>
        );
      case "status_change":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Status Change
          </Badge>
        );
      case "approval":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Approval
          </Badge>
        );
      case "rejection":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejection
          </Badge>
        );
      case "blockchain_confirmation":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            Blockchain
          </Badge>
        );
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  // Get event icon
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "creation":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "status_change":
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case "approval":
        return <Check className="h-4 w-4 text-green-600" />;
      case "rejection":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "blockchain_confirmation":
        return <Shield className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get event description
  const getEventDescription = (event: TransactionEvent) => {
    switch (event.eventType) {
      case "creation":
        return `Redemption request created for ${event.data.tokenAmount} ${event.data.tokenType} tokens`;
      case "status_change":
        return `Status changed from ${event.data.oldStatus} to ${event.data.newStatus}`;
      case "approval":
        return `Approved by ${event.data.approverName} (${event.data.approverRole})`;
      case "rejection":
        return `Rejected by ${event.data.approverName} (${event.data.approverRole}): ${event.data.reason || "No reason provided"}`;
      case "blockchain_confirmation":
        return `Transaction confirmed on blockchain with hash ${event.data.transactionHash.substring(0, 10)}...`;
      default:
        return "Event recorded";
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Transaction History
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transaction history"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={eventTypeFilter}
                  onValueChange={setEventTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="creation">Creation</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="blockchain_confirmation">
                      Blockchain
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  title={`Sort ${sortDirection === "asc" ? "Newest First" : "Oldest First"}`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">
              Loading transaction history...
            </span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8 text-red-500">
            <AlertTriangle className="h-6 w-6 mr-2" />
            {error}
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mb-2" />
            <p>No transaction history found</p>
            {searchTerm || eventTypeFilter !== "all" ? (
              <p className="text-sm mt-1">Try adjusting your filters</p>
            ) : null}
          </div>
        ) : (
          <ScrollArea
            className={`w-full ${maxHeight ? `max-h-[${maxHeight}]` : ""}`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[120px]">Event Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getEventIcon(event.eventType)}
                        <span className="ml-2">
                          {getEventTypeBadge(event.eventType)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-md truncate">
                              {getEventDescription(event)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs">
                              {getEventDescription(event)}
                              {event.eventType ===
                                "blockchain_confirmation" && (
                                <div className="mt-2">
                                  <div className="flex items-center text-xs">
                                    <span className="font-semibold mr-1">
                                      Hash:
                                    </span>
                                    <span className="font-mono">
                                      {event.data.transactionHash}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs mt-1">
                                    <span className="font-semibold mr-1">
                                      Block:
                                    </span>
                                    <span>{event.data.blockNumber}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {event.actor ? (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1 text-gray-500" />
                          <span className="text-sm">{event.actor}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                      {event.actorRole && (
                        <span className="text-xs text-gray-500 block">
                          {event.actorRole}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {!loading && displayedEvents.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {displayedEvents.length} of {filteredEvents.length} events
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
