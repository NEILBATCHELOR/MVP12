import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/services/tokenService";
import { TokenData, TokenStatus } from "@/types/centralModels";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pencil, 
  ChevronLeft, 
  Copy, 
  Code,
  ExternalLink, 
  FileText, 
  History,
  Share2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Extended TokenData interface that includes additional properties
// used in this component but not in the base TokenData type
interface ExtendedTokenData extends TokenData {
  description?: string;
  total_supply?: string;
  is_mintable?: boolean;
  is_burnable?: boolean;
  is_pausable?: boolean;
  features?: string[];
  access_control_type?: string;
  is_snapshottable?: boolean;
  is_votes?: boolean;
  is_flash_mintable?: boolean;
  is_enumerable?: boolean;
  is_uri_storage?: boolean;
  base_uri?: string;
  approved_at?: string;
  token_deployments?: Array<{
    contract_address: string;
    network: string;
    created_at: string;
    deployer_address: string;
    transaction_hash?: string;
  }>;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    created_at: string;
  }>;
}

interface Props {
  tokenId: string;
}

export default function TokenDetail({ tokenId }: Props) {
  const [token, setToken] = useState<ExtendedTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    async function loadToken() {
      try {
        setLoading(true);
        const data = await getToken(tokenId);
        if (data) {
          setToken(data as unknown as ExtendedTokenData);
        } else {
          toast({
            title: "Error",
            description: "Token not found",
            variant: "destructive",
          });
          navigate(`/projects/${projectId}/token-management`);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        toast({
          title: "Error",
          description: "Failed to load token details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadToken();
  }, [tokenId, navigate, toast, projectId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <p className="mt-2 text-gray-600">Loading token details...</p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${token.project_id}/token-management`)}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{token.name}</h1>
          <Badge variant="outline" className="ml-3 font-mono">
            {token.symbol}
          </Badge>
          {getStatusBadge(token.status)}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/token-management/${token.id}/versions`)}>
            <History className="h-4 w-4 mr-2" />
            Versions
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/token-management/${token.id}/preview`)}>
            <Code className="h-4 w-4 mr-2" />
            Preview Code
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/token-management/${token.id}/deploy`)}>
            <Share2 className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button onClick={() => navigate(`/projects/${projectId}/token-management/${token.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg">{token.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Symbol</p>
                    <p className="text-lg font-mono">{token.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Standard</p>
                    <p className="text-lg">{token.standard}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(token.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Decimals</p>
                    <p className="text-lg">{token.decimals || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Supply</p>
                    <p className="text-lg">
                      {token.total_supply ? 
                        Number(token.total_supply).toLocaleString() : 
                        token.is_mintable ? "Mintable" : "N/A"}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {token.description || "No description provided."}
                  </p>
                </div>

                {token.features && token.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {token.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(token.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated</p>
                    <p className="text-sm">{formatDate(token.updated_at)}</p>
                  </div>
                  {token.status === TokenStatus.APPROVED && token.approved_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Approved</p>
                      <p className="text-sm">{formatDate(token.approved_at)}</p>
                    </div>
                  )}
                  {token.token_deployments && token.token_deployments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">First Deployed</p>
                      <p className="text-sm">
                        {formatDate(token.token_deployments[0].created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <CardTitle>Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              {token.token_deployments && token.token_deployments.length > 0 ? (
                <div className="space-y-4">
                  {token.token_deployments.map((deployment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{deployment.network}</h3>
                          <div className="flex items-center mt-1">
                            <p className="text-sm font-mono text-gray-600">
                              {deployment.contract_address}
                            </p>
                            <Button variant="ghost" size="sm" className="h-6 w-6 ml-1 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(deployment.contract_address);
                                toast({
                                  title: "Copied",
                                  description: "Contract address copied to clipboard"
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <a
                          href={`https://etherscan.io/address/${deployment.contract_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-sm"
                        >
                          View on Explorer
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Deployment Date</p>
                          <p>{formatDate(deployment.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Deployer</p>
                          <p className="font-mono">
                            {deployment.deployer_address.substring(0, 6)}...
                            {deployment.deployer_address.substring(deployment.deployer_address.length - 4)}
                          </p>
                        </div>
                        {deployment.transaction_hash && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Transaction</p>
                            <a
                              href={`https://etherscan.io/tx/${deployment.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {deployment.transaction_hash.substring(0, 12)}...
                              {deployment.transaction_hash.substring(deployment.transaction_hash.length - 8)}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">This token has not been deployed yet.</p>
                  <Button onClick={() => navigate(`/projects/${projectId}/token-management/${token.id}/deploy`)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Deploy Token
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Token Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Mintable</p>
                  <p>{token.is_mintable ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Burnable</p>
                  <p>{token.is_burnable ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pausable</p>
                  <p>{token.is_pausable ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Access Control</p>
                  <p>{token.access_control_type || "None"}</p>
                </div>
                {token.standard.includes("ERC20") && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Snapshots</p>
                      <p>{token.is_snapshottable ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Votes</p>
                      <p>{token.is_votes ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Flash Minting</p>
                      <p>{token.is_flash_mintable ? "Yes" : "No"}</p>
                    </div>
                  </>
                )}
                {token.standard.includes("ERC721") && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Enumerable</p>
                      <p>{token.is_enumerable ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">URI Storage</p>
                      <p>{token.is_uri_storage ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Base URI</p>
                      <p className="truncate">{token.base_uri || "None"}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {token.documents && token.documents.length > 0 ? (
                <div className="space-y-4">
                  {token.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.type} • {formatDate(doc.created_at)}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        View
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No documents attached to this token.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 