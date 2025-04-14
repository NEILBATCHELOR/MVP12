import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  PlusCircle,
  Edit,
  Trash2,
  ArrowUpDown,
  Search,
  Filter,
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
  description?: string;
  contractAddress?: string;
  redemptionFrequency?: "monthly" | "quarterly" | "annual" | "custom";
  redemptionPeriodDays?: number;
}

// Form schema
const projectFormSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  tokenSymbol: z.string().min(1, { message: "Token symbol is required" }),
  tokenType: z.string().min(1, { message: "Token type is required" }),
  issuanceDate: z.date({
    required_error: "Issuance date is required",
  }),
  totalSupply: z.string().min(1, { message: "Total supply is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  description: z.string().optional(),
  contractAddress: z.string().optional(),
  redemptionFrequency: z.string().optional(),
  redemptionPeriodDays: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

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
    description: "Sustainable energy investment fund",
    contractAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    redemptionFrequency: "quarterly",
    redemptionPeriodDays: 7,
  },
  {
    id: "PRJ-002",
    name: "Real Estate Trust",
    tokenSymbol: "RET",
    tokenType: "ERC-1400",
    issuanceDate: "2023-03-22",
    totalSupply: 5000000,
    status: "active",
    description: "Commercial real estate investment trust",
    contractAddress: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    redemptionFrequency: "monthly",
    redemptionPeriodDays: 5,
  },
  {
    id: "PRJ-003",
    name: "Tech Ventures Fund",
    tokenSymbol: "TVF",
    tokenType: "ERC-20",
    issuanceDate: "2022-11-05",
    totalSupply: 8000000,
    status: "active",
    description: "Technology startup investment fund",
    contractAddress: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b",
    redemptionFrequency: "quarterly",
    redemptionPeriodDays: 10,
  },
];

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Create form
  const createForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      tokenSymbol: "",
      tokenType: "",
      issuanceDate: new Date(),
      totalSupply: "",
      status: "active",
      description: "",
      contractAddress: "",
      redemptionFrequency: "quarterly",
      redemptionPeriodDays: "7",
    },
  });

  // Edit form
  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
  });

  // Handle create submission
  const handleCreateSubmit = (values: ProjectFormValues) => {
    const newProject: Project = {
      id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: values.name,
      tokenSymbol: values.tokenSymbol,
      tokenType: values.tokenType,
      issuanceDate: format(values.issuanceDate, "yyyy-MM-dd"),
      totalSupply: parseFloat(values.totalSupply),
      status: values.status as "active" | "completed" | "paused",
      description: values.description,
      contractAddress: values.contractAddress,
      redemptionFrequency: values.redemptionFrequency as any,
      redemptionPeriodDays: values.redemptionPeriodDays
        ? parseInt(values.redemptionPeriodDays)
        : undefined,
    };

    setProjects([...projects, newProject]);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  // Handle edit submission
  const handleEditSubmit = (values: ProjectFormValues) => {
    if (!selectedProject) return;

    const updatedProject: Project = {
      ...selectedProject,
      name: values.name,
      tokenSymbol: values.tokenSymbol,
      tokenType: values.tokenType,
      issuanceDate: format(values.issuanceDate, "yyyy-MM-dd"),
      totalSupply: parseFloat(values.totalSupply),
      status: values.status as "active" | "completed" | "paused",
      description: values.description,
      contractAddress: values.contractAddress,
      redemptionFrequency: values.redemptionFrequency as any,
      redemptionPeriodDays: values.redemptionPeriodDays
        ? parseInt(values.redemptionPeriodDays)
        : undefined,
    };

    setProjects(
      projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)),
    );
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // Handle edit click
  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    editForm.reset({
      name: project.name,
      tokenSymbol: project.tokenSymbol,
      tokenType: project.tokenType,
      issuanceDate: new Date(project.issuanceDate),
      totalSupply: project.totalSupply.toString(),
      status: project.status,
      description: project.description || "",
      contractAddress: project.contractAddress || "",
      redemptionFrequency: project.redemptionFrequency || "",
      redemptionPeriodDays: project.redemptionPeriodDays?.toString() || "",
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

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      // Apply status filter
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          project.name.toLowerCase().includes(searchLower) ||
          project.id.toLowerCase().includes(searchLower) ||
          project.tokenSymbol.toLowerCase().includes(searchLower) ||
          false
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === "tokenSymbol") {
        return sortDirection === "asc"
          ? a.tokenSymbol.localeCompare(b.tokenSymbol)
          : b.tokenSymbol.localeCompare(a.tokenSymbol);
      } else if (sortField === "issuanceDate") {
        const dateA = new Date(a.issuanceDate).getTime();
        const dateB = new Date(b.issuanceDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "totalSupply") {
        return sortDirection === "asc"
          ? a.totalSupply - b.totalSupply
          : b.totalSupply - a.totalSupply;
      } else if (sortField === "status") {
        return sortDirection === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-50 text-green-700">Active</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Completed
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Paused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Manager</h1>
          <p className="text-gray-600">
            Manage projects and their redemption settings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project with token and redemption settings.
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Green Energy Fund"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="tokenSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. GEF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="issuanceDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issuance Date</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="totalSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Supply</FormLabel>
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

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="redemptionFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Redemption Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often redemption windows are opened
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="redemptionPeriodDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Redemption Period (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 7"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days each redemption window stays open
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={createForm.control}
                    name="contractAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 0x..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of the project"
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
                  <Button type="submit">Create Project</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, or token symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
                  Project Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("tokenSymbol")}
                  className="flex items-center"
                >
                  Token <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("issuanceDate")}
                  className="flex items-center"
                >
                  Issuance Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalSupply")}
                  className="flex items-center"
                >
                  Total Supply <ArrowUpDown className="ml-2 h-4 w-4" />
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
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p>No projects found</p>
                    {(searchTerm || statusFilter !== "all") && (
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{project.tokenType}</Badge>
                      <span>{project.tokenSymbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.issuanceDate}</TableCell>
                  <TableCell>{project.totalSupply.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                        disabled={project.status === "active"}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details for this project.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Green Energy Fund"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. GEF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="issuanceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issuance Date</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="totalSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Supply</FormLabel>
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

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="redemptionFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redemption Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often redemption windows are opened
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="redemptionPeriodDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redemption Period (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 7" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of days each redemption window stays open
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="contractAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of the project"
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

export default ProjectManager;
