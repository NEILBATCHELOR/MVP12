import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, 
  Trash2, 
  Copy, 
  MoreVertical, 
  PlusCircle, 
  Box,
  ExternalLink,
  Code,
  Edit,
  Eye
} from "lucide-react";
import { getTokens, deleteToken, cloneToken } from "@/lib/services/tokenService";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { TokenData, TokenStatus, TokenStandard } from "@/types/centralModels";

// Extended TokenData interface that includes properties
// used in this component but not in the base TokenData type
interface ExtendedTokenData extends TokenData {
  token_deployments?: Array<{
    network: string;
    contract_address: string;
  }>;
}

interface Props {
  projectId: string;
}

export default function TokenList({ projectId }: Props) {
  const [tokens, setTokens] = useState<ExtendedTokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load tokens
  useEffect(() => {
    async function loadTokens() {
      try {
        setLoading(true);
        const data = await getTokens(projectId);
        setTokens(data as unknown as ExtendedTokenData[]);
      } catch (error) {
        console.error("Error loading tokens:", error);
        toast({
          title: "Error",
          description: "Failed to load tokens",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, [projectId, toast]);

  // Delete token
  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;

    try {
      await deleteToken(tokenToDelete);
      setTokens(tokens.filter(t => t.id !== tokenToDelete));
      toast({
        title: "Success",
        description: "Token deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting token:", error);
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    } finally {
      setTokenToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setTokenToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle clone token
  const handleCloneToken = async (token: ExtendedTokenData) => {
    try {
      toast({
        title: "Cloning token...",
        description: "Creating a copy of this token",
      });

      const result = await cloneToken(token.id, {
        name: `${token.name} (Copy)`,
        symbol: `${token.symbol}_CPY`,
        projectId
      });

      toast({
        title: "Success",
        description: "Token cloned successfully",
      });

      // Refresh the list
      setTokens([result as unknown as ExtendedTokenData, ...tokens]);
    } catch (error) {
      console.error("Error cloning token:", error);
      toast({
        title: "Error",
        description: "Failed to clone token",
        variant: "destructive",
      });
    }
  };

  // Format timestamp
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const classes = {
      [TokenStatus.DRAFT]: "bg-gray-100 text-gray-800",
      [TokenStatus.REVIEW]: "bg-blue-100 text-blue-800",
      [TokenStatus.APPROVED]: "bg-green-100 text-green-800",
      [TokenStatus.DEPLOYED]: "bg-purple-100 text-purple-800",
      [TokenStatus.REJECTED]: "bg-red-100 text-red-800",
      [TokenStatus.READY_TO_MINT]: "bg-amber-100 text-amber-800",
    };

    return (
      <Badge className={classes[status as TokenStatus] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tokens</h2>
        <Button onClick={() => navigate(`/projects/${projectId}/tokens/new`)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Token
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <p className="mt-2 text-gray-600">Loading tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-12 text-center">
            <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No Tokens Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              Create your first token to get started. You can choose from various
              token standards like ERC-20, ERC-721, and more.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate(`/projects/${projectId}/tokens/new`)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token) => (
            <Card key={token.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{token.name}</CardTitle>
                    <CardDescription className="font-mono">{token.symbol}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/tokens/${token.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/tokens/${token.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCloneToken(token)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => confirmDelete(token.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm mb-2">
                  <Badge variant="outline" className="font-mono">
                    {token.standard}
                  </Badge>
                  {getStatusBadge(token.status)}
                </div>
                <div className="text-sm text-gray-500">
                  {token.token_deployments?.length > 0 ? (
                    <div className="mt-2">
                      <div className="font-medium text-gray-700">Deployments:</div>
                      {token.token_deployments.map((deployment, index) => (
                        <div key={index} className="flex items-center justify-between mt-1">
                          <span className="text-xs">{deployment.network}</span>
                          <a 
                            href={`https://etherscan.io/address/${deployment.contract_address}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-xs"
                          >
                            {deployment.contract_address.substring(0, 6)}...
                            {deployment.contract_address.substring(deployment.contract_address.length - 4)}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs">Not yet deployed</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 pt-0">
                Created {formatDate(token.created_at)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this token. If the token has been deployed, this action
              will not affect the deployed contracts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteToken}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 