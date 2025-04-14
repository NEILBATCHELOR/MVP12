import React, { useState, useEffect } from "react";
import { Tables } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Filter, RefreshCw, Search, Info } from "lucide-react";
import { format } from "date-fns";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { supabase } from "@/lib/supabase";
import ActivityLogDetails from "./ActivityLogDetails";

type ActivityLogEntry = Tables<"audit_logs">;

interface ActivityMonitorProps {
  projectId?: string;
  limit?: number;
  showHeader?: boolean;
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  projectId,
  limit = 20,
  showHeader = true 
}) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    action_type: "",
    entity_type: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const ITEMS_PER_PAGE = limit;

  // Load activity logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      // Calculate offset based on current page
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Prepare query
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      // Apply filters if they are set
      if (filters.action_type) {
        query = query.eq("action", filters.action_type);
      }

      if (filters.entity_type) {
        query = query.eq("entity_type", filters.entity_type);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.start_date) {
        query = query.gte("timestamp", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("timestamp", filters.end_date);
      }

      // Apply tab-specific filters
      if (activeTab === "auth") {
        query = query.ilike("action", "auth_%");
      } else if (activeTab === "data") {
        query = query.or(
          "action.ilike.%_investors,action.ilike.%_subscriptions,action.ilike.%_token_allocations,action.ilike.%_projects",
        );
      } else if (activeTab === "admin") {
        query = query.or(
          "action.ilike.%_user_roles,action.ilike.%_rules,action.ilike.%_permissions",
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activity logs:", error);
        setLogs([]);
      } else {
        // Filter by search query if provided
        let filteredLogs = data || [];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(
            (log) =>
              (log.user_email &&
                log.user_email.toLowerCase().includes(query)) ||
              (log.action && log.action.toLowerCase().includes(query)) ||
              (log.entity_type &&
                log.entity_type.toLowerCase().includes(query)) ||
              (log.entity_id && log.entity_id.toLowerCase().includes(query)) ||
              (log.details &&
                String(log.details).toLowerCase().includes(query)),
          );
        }

        setLogs(filteredLogs);

        // Extract unique action types and entity types for filters
        if (data) {
          const actions = Array.from(
            new Set(data.map((log) => log.action).filter(Boolean)),
          );
          const entities = Array.from(
            new Set(data.map((log) => log.entity_type).filter(Boolean)),
          );

          setActionTypes(actions as string[]);
          setEntityTypes(entities as string[]);
        }

        // Calculate total pages - in a real app, you would get the count from the API
        // For now, we'll assume there are more pages if we got a full page of results
        setTotalPages(
          Math.max(1, filteredLogs.length === ITEMS_PER_PAGE ? page + 1 : page),
        );
      }
    } catch (error) {
      console.error("Error loading activity logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load logs when component mounts or filters change
  useEffect(() => {
    loadLogs();
  }, [page, activeTab, filters]);

  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page
    loadLogs();
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      action_type: "",
      entity_type: "",
      status: "",
      start_date: "",
      end_date: "",
    });
    setSearchQuery("");
    setPage(1);
  };

  // Export logs to CSV
  const exportToCSV = () => {
    if (logs.length === 0) return;

    // Define CSV headers
    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Entity Type",
      "Entity ID",
      "Status",
      "Details",
    ];

    // Format the data for each log
    const rows = logs.map((log) => {
      // Format timestamp
      const timestamp = log.timestamp
        ? new Date(log.timestamp).toISOString()
        : "";

      // Escape fields that might contain commas or quotes
      const escapeCsvField = (field: string | null | undefined): string => {
        if (field === null || field === undefined) return "";
        const str = String(field);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`; // Escape quotes by doubling them
        }
        return str;
      };

      return [
        timestamp,
        escapeCsvField(log.user_email),
        escapeCsvField(log.action),
        escapeCsvField(log.entity_type),
        escapeCsvField(log.entity_id),
        escapeCsvField(log.status),
        escapeCsvField(log.details),
      ].join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `activity_logs_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return format(new Date(timestamp), "MMM dd, yyyy HH:mm:ss");
  };

  // Format action type for display
  const formatActionType = (actionType?: string) => {
    if (!actionType) return "";
    return actionType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "failure":
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Open log details
  const openLogDetails = (log: ActivityLogEntry) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity Monitor</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button variant="outline" size="sm" onClick={loadLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="data">Data Operations</TabsTrigger>
              <TabsTrigger value="admin">Admin Actions</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/20 rounded-md">
              <div>
                <label className="text-sm font-medium">Action Type</label>
                <Select
                  value={filters.action_type}
                  onValueChange={(value) =>
                    handleFilterChange("action_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    {actionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatActionType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Entity Type</label>
                <Select
                  value={filters.entity_type}
                  onValueChange={(value) =>
                    handleFilterChange("entity_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Entities</SelectItem>
                    {entityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  date={
                    filters.start_date
                      ? new Date(filters.start_date)
                      : undefined
                  }
                  onSelect={(date) =>
                    handleFilterChange(
                      "start_date",
                      date ? date.toISOString() : "",
                    )
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  date={
                    filters.end_date ? new Date(filters.end_date) : undefined
                  }
                  onSelect={(date) =>
                    handleFilterChange(
                      "end_date",
                      date ? date.toISOString() : "",
                    )
                  }
                />
              </div>

              <div className="md:col-span-5 flex justify-end">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingState message="Loading activity logs..." />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No activity logs found"
              description="No logs match your current filters. Try adjusting your search criteria."
            />
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openLogDetails(log)}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>{log.user_email || "System"}</TableCell>
                        <TableCell>{formatActionType(log.action)}</TableCell>
                        <TableCell>
                          {log.entity_type && (
                            <span className="text-xs">
                              {log.entity_type.charAt(0).toUpperCase() +
                                log.entity_type.slice(1)}
                              {log.entity_id && (
                                <span className="text-muted-foreground ml-1">
                                  ({log.entity_id.substring(0, 8)}...)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details ? (
                            <span className="text-xs text-muted-foreground">
                              {typeof log.details === "object"
                                ? JSON.stringify(log.details).substring(0, 50) +
                                  "..."
                                : String(log.details).substring(0, 50) + "..."}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLogDetails(log);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={page !== 1 ? () => setPage((p) => Math.max(1, p - 1)) : undefined}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={page !== totalPages ? () => setPage((p) => Math.min(totalPages, p + 1)) : undefined}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <ActivityLogDetails
          log={selectedLog}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
};

export default ActivityMonitor;
