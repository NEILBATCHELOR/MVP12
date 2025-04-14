import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  PlusCircle,
  Edit,
  Trash2,
  Calendar as CalendarIcon2,
  ArrowUpDown,
  Search,
  Filter,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Types
interface Project {
  id: string;
  name: string;
  tokenSymbol: string;
  tokenType: string;
  issuanceDate: string;
  totalSupply: number;
  status: "active" | "completed" | "paused";
}

interface RedemptionWindow {
  id: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  navUpdateDate: Date;
  eligibilityStartDate: Date;
  eligibilityEndDate: Date;
  status: "upcoming" | "active" | "closed";
  maxRedemptionAmount?: number;
  minRedemptionAmount?: number;
  conversionRate?: number;
  notes?: string;
}

// Form schema
const windowFormSchema = z
  .object({
    projectId: z.string({
      required_error: "Project is required",
    }),
    name: z.string().min(1, { message: "Window name is required" }),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    navUpdateDate: z.date({
      required_error: "NAV update date is required",
    }),
    eligibilityStartDate: z.date({
      required_error: "Eligibility start date is required",
    }),
    eligibilityEndDate: z.date({
      required_error: "Eligibility end date is required",
    }),
    maxRedemptionAmount: z.string().optional(),
    minRedemptionAmount: z.string().optional(),
    conversionRate: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => isBefore(data.startDate, data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => isBefore(data.eligibilityStartDate, data.eligibilityEndDate),
    {
      message: "Eligibility end date must be after eligibility start date",
      path: ["eligibilityEndDate"],
    },
  )
  .refine((data) => isBefore(data.navUpdateDate, data.startDate), {
    message: "NAV update date must be before redemption window start date",
    path: ["navUpdateDate"],
  })
  .refine((data) => isBefore(data.eligibilityEndDate, data.startDate), {
    message: "Eligibility period must end before redemption window starts",
    path: ["eligibilityEndDate"],
  });

type WindowFormValues = z.infer<typeof windowFormSchema>;

// Mock data
const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Green Energy Fund",
    tokenSymbol: "GEF",
    tokenType: "ERC-20",
    issuanceDate: "2023-01-15",
    totalSupply: 10000000,
    status: "active",
  },
  {
    id: "PRJ-002",
    name: "Real Estate Trust",
    tokenSymbol: "RET",
    tokenType: "ERC-1400",
    issuanceDate: "2023-03-22",
    totalSupply: 5000000,
    status: "active",
  },
  {
    id: "PRJ-003",
    name: "Tech Ventures Fund",
    tokenSymbol: "TVF",
    tokenType: "ERC-20",
    issuanceDate: "2022-11-05",
    totalSupply: 8000000,
    status: "active",
  },
];

const mockRedemptionWindows: RedemptionWindow[] = [
  {
    id: "RW-001",
    projectId: "PRJ-001",
    name: "Q2 2023 Redemption",
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 12),
    navUpdateDate: addDays(new Date(), 3),
    eligibilityStartDate: new Date(),
    eligibilityEndDate: addDays(new Date(), 4),
    status: "upcoming",
    maxRedemptionAmount: 1000000,
    minRedemptionAmount: 1000,
    conversionRate: 0.95,
    notes: "Standard quarterly redemption window",
  },
  {
    id: "RW-002",
    projectId: "PRJ-002",
    name: "June 2023 Redemption",
    startDate: addDays(new Date(), 15),
    endDate: addDays(new Date(), 22),
    navUpdateDate: addDays(new Date(), 13),
    eligibilityStartDate: addDays(new Date(), 8),
    eligibilityEndDate: addDays(new Date(), 14),
    status: "upcoming",
    maxRedemptionAmount: 500000,
    minRedemptionAmount: 5000,
    conversionRate: 1.05,
    notes: "Limited redemption window for RET token holders",
  },
  {
    id: "RW-003",
    projectId: "PRJ-001",
    name: "Q1 2023 Redemption",
    startDate: addDays(new Date(), -45),
    endDate: addDays(new Date(), -38),
    navUpdateDate: addDays(new Date(), -47),
    eligibilityStartDate: addDays(new Date(), -50),
    eligibilityEndDate: addDays(new Date(), -46),
    status: "closed",
    maxRedemptionAmount: 1000000,
    minRedemptionAmount: 1000,
    conversionRate: 0.92,
    notes: "Completed quarterly redemption window",
  },
  {
    id: "RW-004",
    projectId: "PRJ-003",
    name: "May 2023 Redemption",
    startDate: addDays(new Date(), -15),
    endDate: addDays(new Date(), -8),
    navUpdateDate: addDays(new Date(), -17),
    eligibilityStartDate: addDays(new Date(), -20),
    eligibilityEndDate: addDays(new Date(), -16),
    status: "closed",
    maxRedemptionAmount: 800000,
    minRedemptionAmount: 2000,
    conversionRate: 1.02,
    notes: "Special redemption window for TVF token holders",
  },
];

interface RedemptionWindowManagerProps {
  projectId?: string;
  readOnly?: boolean;
}

const RedemptionWindowManager: React.FC<RedemptionWindowManagerProps> = ({ 
  projectId,
  readOnly = false 
}) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [windows, setWindows] = useState<RedemptionWindow[]>(mockRedemptionWindows);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<RedemptionWindow | null>(null);
  const [sortField, setSortField] = useState<string>("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
  const [displayedWindows, setDisplayedWindows] = useState<RedemptionWindow[]>([]);

  // Create form
  const createForm = useForm<WindowFormValues>({
    resolver: zodResolver(windowFormSchema),
    defaultValues: {
      projectId: "",
      name: "",
      startDate: addDays(new Date(), 30),
      endDate: addDays(new Date(), 37),
      navUpdateDate: addDays(new Date(), 28),
      eligibilityStartDate: addDays(new Date(), 23),
      eligibilityEndDate: addDays(new Date(), 29),
      maxRedemptionAmount: "",
      minRedemptionAmount: "",
      conversionRate: "",
      notes: "",
    },
  });

  // Edit form
  const editForm = useForm<WindowFormValues>({
    resolver: zodResolver(windowFormSchema),
  });

  // Handle create submission
  const handleCreateSubmit = (values: WindowFormValues) => {
    const newWindow: RedemptionWindow = {
      id: `RW-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: values.projectId,
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      navUpdateDate: values.navUpdateDate,
      eligibilityStartDate: values.eligibilityStartDate,
      eligibilityEndDate: values.eligibilityEndDate,
      status: "upcoming",
      maxRedemptionAmount: values.maxRedemptionAmount
        ? parseFloat(values.maxRedemptionAmount)
        : undefined,
      minRedemptionAmount: values.minRedemptionAmount
        ? parseFloat(values.minRedemptionAmount)
        : undefined,
      conversionRate: values.conversionRate
        ? parseFloat(values.conversionRate)
        : undefined,
      notes: values.notes,
    };

    setWindows([...windows, newWindow]);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  // Handle edit submission
  const handleEditSubmit = (values: WindowFormValues) => {
    if (!currentWindow) return;

    const updatedWindow: RedemptionWindow = {
      ...currentWindow,
      projectId: values.projectId,
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      navUpdateDate: values.navUpdateDate,
      eligibilityStartDate: values.eligibilityStartDate,
      eligibilityEndDate: values.eligibilityEndDate,
      maxRedemptionAmount: values.maxRedemptionAmount
        ? parseFloat(values.maxRedemptionAmount)
        : undefined,
      minRedemptionAmount: values.minRedemptionAmount
        ? parseFloat(values.minRedemptionAmount)
        : undefined,
      conversionRate: values.conversionRate
        ? parseFloat(values.conversionRate)
        : undefined,
      notes: values.notes,
    };

    setWindows(
      windows.map((w) => (w.id === currentWindow.id ? updatedWindow : w)),
    );
    setIsEditDialogOpen(false);
    setCurrentWindow(null);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  // Handle edit click
  const handleEditClick = (window: RedemptionWindow) => {
    setCurrentWindow(window);
    editForm.reset({
      projectId: window.projectId,
      name: window.name,
      startDate: window.startDate,
      endDate: window.endDate,
      navUpdateDate: window.navUpdateDate,
      eligibilityStartDate: window.eligibilityStartDate,
      eligibilityEndDate: window.eligibilityEndDate,
      maxRedemptionAmount: window.maxRedemptionAmount?.toString() || "",
      minRedemptionAmount: window.minRedemptionAmount?.toString() || "",
      conversionRate: window.conversionRate?.toString() || "",
      notes: window.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort windows
  useEffect(() => {
    // Create filtered and sorted windows array
    const filteredAndSorted = windows
      .filter((window) => {
        // Apply status filter
        if (activeTab !== "all" && window.status !== activeTab) {
          return false;
        }

        // Apply project filter
        if (selectedProject && window.projectId !== selectedProject) {
          return false;
        }

        // Apply search filter
        if (searchQuery) {
          const project = mockProjects.find((p) => p.id === window.projectId);
          const searchLower = searchQuery.toLowerCase();
          return (
            window.name.toLowerCase().includes(searchLower) ||
            window.id.toLowerCase().includes(searchLower) ||
            project?.name.toLowerCase().includes(searchLower) ||
            false
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === "startDate") {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortField === "projectId") {
          const projectA = mockProjects.find((p) => p.id === a.projectId)?.name || "";
          const projectB = mockProjects.find((p) => p.id === b.projectId)?.name || "";
          return sortDirection === "asc"
            ? projectA.localeCompare(projectB)
            : projectB.localeCompare(projectA);
        } else if (sortField === "name") {
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortField === "status") {
          return sortDirection === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        return 0;
      });
    
    // Update the state with filtered and sorted windows
    setDisplayedWindows(filteredAndSorted);
  }, [windows, activeTab, selectedProject, searchQuery, sortField, sortDirection]);

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    return mockProjects.find((p) => p.id === projectId)?.name || "Unknown Project";
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Upcoming
          </Badge>
        );
      case "active":
        return <Badge className="bg-green-50 text-green-700">Active</Badge>;
      case "closed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Redemption Window Manager</h1>
          <p className="text-gray-600">
            Manage periodic redemption windows for all projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Redemption Window
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Redemption Window</DialogTitle>
              <DialogDescription>
                Set up a new redemption window for a specific project.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name} ({project.tokenSymbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Window Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Q3 2023 Redemption"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Eligibility Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="eligibilityStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={
                                      "w-full pl-3 text-left font-normal"
                                    }
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="eligibilityEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={
                                      "w-full pl-3 text-left font-normal"
                                    }
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="navUpdateDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>NAV Update Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Date when NAV will be calculated for this redemption
                            window
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Redemption Window</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={
                                      "w-full pl-3 text-left font-normal"
                                    }
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={
                                      "w-full pl-3 text-left font-normal"
                                    }
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="minRedemptionAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 1000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="maxRedemptionAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 1000000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="conversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversion Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 0.95"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Token to USDC conversion rate (e.g., 0.95 means 1
                          token = 0.95 USDC)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Additional information"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Window</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("id")}
                      className="flex items-center"
                    >
                      ID <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="flex items-center"
                    >
                      Window Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("projectId")}
                      className="flex items-center"
                    >
                      Project <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("startDate")}
                      className="flex items-center"
                    >
                      Dates <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="flex items-center"
                    >
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedWindows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <CalendarIcon2 className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No redemption windows found</p>
                        {(searchQuery ||
                          activeTab !== "all" ||
                          selectedProject !== "all") && (
                          <p className="text-sm mt-1">
                            Try adjusting your filters
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedWindows.map((window) => (
                    <TableRow key={window.id}>
                      <TableCell className="font-medium">{window.id}</TableCell>
                      <TableCell>{window.name}</TableCell>
                      <TableCell>{getProjectName(window.projectId)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(window.startDate)} -{" "}
                            {formatDate(window.endDate)}
                          </div>
                          <div className="text-gray-500">
                            NAV: {formatDate(window.navUpdateDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(window.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(window)}
                            disabled={window.status === "closed"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(window.id)}
                            disabled={window.status === "active"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">
                Redemption Windows Calendar
              </h2>
              <p className="text-gray-600">Calendar view coming soon</p>
            </div>
            <div className="flex justify-center items-center h-64 border rounded-md bg-gray-50">
              <div className="text-center">
                <CalendarIcon2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  Calendar view is under development
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Check back soon for visual calendar representation of
                  redemption windows
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Issuance Date</TableHead>
                    <TableHead>Total Supply</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.id}
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{project.tokenType}</Badge>
                          <span>{project.tokenSymbol}</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.issuanceDate}</TableCell>
                      <TableCell>
                        {project.totalSupply.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            project.status === "active"
                              ? "bg-green-50 text-green-700"
                              : project.status === "completed"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-yellow-50 text-yellow-700"
                          }
                        >
                          {project.status.charAt(0).toUpperCase() +
                            project.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Redemption Window</DialogTitle>
            <DialogDescription>
              Update the details for this redemption window.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name} ({project.tokenSymbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Window Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Q3 2023 Redemption"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Eligibility Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="eligibilityStartDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="eligibilityEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="navUpdateDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>NAV Update Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={"w-full pl-3 text-left font-normal"}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Date when NAV will be calculated for this redemption
                          window
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Redemption Window</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="minRedemptionAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 1000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="maxRedemptionAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 1000000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="conversionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversion Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 0.95"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Token to USDC conversion rate (e.g., 0.95 means 1 token
                        = 0.95 USDC)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Additional information"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedemptionWindowManager;
