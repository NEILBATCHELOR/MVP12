import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Plus, MoreHorizontal, Edit, Copy, Trash, FileCode } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useToast } from "@/components/ui/use-toast";
import { getTokenTemplates, deleteTokenTemplate } from "@/lib/services/tokenTemplateService";
import { TokenTemplate, TokenStandard } from "@/types/centralModels";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Props {
  projectId: string;
}

export default function TokenTemplateList({ projectId }: Props) {
  const [templates, setTemplates] = useState<TokenTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TokenTemplate | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await getTokenTemplates(projectId);
        // Transform the data to match the TokenTemplate interface from centralModels.ts
        const mappedTemplates = data.map(template => {
          // Use type assertion to handle different property structures
          const templateData = template as any;
          return {
            id: templateData.id,
            name: templateData.name,
            description: templateData.description || "",
            projectId: templateData.project_id || templateData.projectId,
            standard: templateData.standard,
            blocks: templateData.blocks || {},
            metadata: templateData.metadata || {},
            createdAt: templateData.created_at || templateData.createdAt,
            updatedAt: templateData.updated_at || templateData.updatedAt || undefined
          };
        });
        setTemplates(mappedTemplates as TokenTemplate[]);
      } catch (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error",
          description: "Failed to load token templates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [projectId, toast]);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTokenTemplate(templateToDelete.id);
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const confirmDelete = (template: TokenTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  // Helper function to format date
  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Helper to get the standard badge
  const getStandardBadge = (standard: TokenStandard) => {
    switch (standard) {
      case TokenStandard.ERC20:
        return <Badge className="bg-blue-500">ERC-20</Badge>;
      case TokenStandard.ERC721:
        return <Badge className="bg-purple-500">ERC-721</Badge>;
      case TokenStandard.ERC1155:
        return <Badge className="bg-amber-500">ERC-1155</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-gray-500">
          <FileCode className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
        <p className="text-gray-500 mb-4">Create your first token template to get started</p>
        <Button onClick={() => navigate(`/projects/${projectId}/token-templates/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Token Templates</h2>
        <Button onClick={() => navigate(`/projects/${projectId}/token-templates/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium truncate" title={template.name}>
                  {template.name}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/token-templates/${template.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/tokens/new?templateId=${template.id}`)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(template)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-4 flex items-center">
                {getStandardBadge(template.standard as TokenStandard)}
                <span className="text-gray-500 text-sm ml-2">
                  Created {formatDate(template.createdAt)}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">
                {template.description || "No description provided."}
              </p>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 border-t flex justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/projects/${projectId}/token-templates/${template.id}/edit`)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit this template</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/projects/${projectId}/tokens/new?templateId=${template.id}`)}
                    >
                      Use Template
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create a token using this template</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 