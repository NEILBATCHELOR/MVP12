import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  createToken,
  updateToken,
  getToken,
} from "@/lib/services/tokenService";
import { TokenData, TokenStandard, TokenStatus } from "@/types/centralModels";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required")
    .max(10, "Symbol should be 10 characters or less")
    .refine(val => /^[A-Z0-9]+$/.test(val), {
      message: "Symbol must be uppercase alphanumeric characters only",
    }),
  description: z.string().optional(),
  standard: z.enum([
    TokenStandard.ERC20,
    TokenStandard.ERC721,
    TokenStandard.ERC1155,
  ]),
  decimals: z.string().optional()
    .refine(val => !val || !isNaN(Number(val)), { 
      message: "Decimals must be a number" 
    })
    .transform(val => val ? Number(val) : undefined),
  total_supply: z.string().optional()
    .refine(val => !val || !isNaN(Number(val)), { 
      message: "Total supply must be a number" 
    })
    .transform(val => val ? val : undefined),
  status: z.enum([
    TokenStatus.DRAFT,
    TokenStatus.REVIEW,
    TokenStatus.APPROVED,
    TokenStatus.REJECTED,
    TokenStatus.READY_TO_MINT,
  ]).default(TokenStatus.DRAFT),
  is_mintable: z.boolean().default(true),
  is_burnable: z.boolean().default(false),
  is_pausable: z.boolean().default(false),
  is_snapshottable: z.boolean().default(false),
  is_votes: z.boolean().default(false),
  is_flash_mintable: z.boolean().default(false),
  is_enumerable: z.boolean().default(false),
  is_uri_storage: z.boolean().default(false),
  base_uri: z.string().optional(),
  access_control_type: z.enum(["Ownable", "Roles", "None"]).default("Ownable"),
  features: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  projectId: string;
  tokenId?: string;
  isEdit?: boolean;
}

interface ExtendedToken {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  project_id: string;
  standard: TokenStandard;
  status: TokenStatus;
  decimals: number;
  blocks: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  total_supply?: string;
  is_mintable?: boolean;
  is_burnable?: boolean;
  is_pausable?: boolean;
  is_snapshottable?: boolean;
  is_votes?: boolean;
  is_flash_mintable?: boolean;
  is_enumerable?: boolean;
  is_uri_storage?: boolean;
  base_uri?: string;
  access_control_type?: string;
  features?: string[];
  token_deployments?: Array<any>;
}

export default function TokenForm({ projectId, tokenId, isEdit = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      standard: TokenStandard.ERC20,
      status: TokenStatus.DRAFT,
      is_mintable: true,
      is_burnable: false,
      is_pausable: false,
      is_snapshottable: false,
      is_votes: false,
      is_flash_mintable: false,
      is_enumerable: false,
      is_uri_storage: false,
      access_control_type: "Ownable",
      features: [],
    },
  });

  // Load token data if editing
  useEffect(() => {
    if (isEdit && tokenId) {
      const loadToken = async () => {
        try {
          setInitialLoading(true);
          const token = await getToken(tokenId) as unknown as ExtendedToken;
          if (token) {
            // Extract properties from blocks and metadata
            const blocks = token.blocks ? (typeof token.blocks === 'object' ? token.blocks : {}) : {};
            const metadata = token.metadata ? (typeof token.metadata === 'object' ? token.metadata : {}) : {};
            
            // Set up default values
            const defaultValues = {
              name: token.name,
              symbol: token.symbol || '',
              description: '',
              standard: token.standard as TokenStandard,
              decimals: token.decimals?.toString() || '18',
              total_supply: '',
              status: token.status as unknown as TokenStatus || TokenStatus.DRAFT,
              is_mintable: false,
              is_burnable: false,
              is_pausable: false,
              is_snapshottable: false,
              is_votes: false,
              is_flash_mintable: false, 
              is_enumerable: false,
              is_uri_storage: false,
              base_uri: '',
              access_control_type: 'Ownable' as "Ownable" | "Roles" | "None",
              features: [] as string[],
            };
            
            // Safely extract values from blocks and metadata
            try {
              if (blocks) {
                if ('is_mintable' in blocks) defaultValues.is_mintable = !!blocks.is_mintable;
                if ('is_burnable' in blocks) defaultValues.is_burnable = !!blocks.is_burnable;
                if ('is_pausable' in blocks) defaultValues.is_pausable = !!blocks.is_pausable;
                if ('is_snapshottable' in blocks) defaultValues.is_snapshottable = !!blocks.is_snapshottable;
                if ('is_votes' in blocks) defaultValues.is_votes = !!blocks.is_votes;
                if ('is_flash_mintable' in blocks) defaultValues.is_flash_mintable = !!blocks.is_flash_mintable;
                if ('is_enumerable' in blocks) defaultValues.is_enumerable = !!blocks.is_enumerable;
                if ('is_uri_storage' in blocks) defaultValues.is_uri_storage = !!blocks.is_uri_storage;
              }
              
              if (metadata) {
                if ('description' in metadata) defaultValues.description = String(metadata.description || '');
                if ('total_supply' in metadata) defaultValues.total_supply = String(metadata.total_supply || '');
                if ('base_uri' in metadata) defaultValues.base_uri = String(metadata.base_uri || '');
                if ('access_control_type' in metadata) {
                  const accessType = String(metadata.access_control_type);
                  if (accessType === 'Ownable' || accessType === 'Roles' || accessType === 'None') {
                    defaultValues.access_control_type = accessType as "Ownable" | "Roles" | "None";
                  }
                }
                if ('features' in metadata && Array.isArray(metadata.features)) {
                  defaultValues.features = metadata.features.map(String);
                }
              }
            } catch (error) {
              console.error('Error parsing token data:', error);
            }
            
            // Apply the values to the form with proper type casting
            form.reset(defaultValues as any);
          } else {
            toast({
              title: "Error",
              description: "Token not found",
              variant: "destructive",
            });
            navigate(`/projects/${projectId}/tokens`);
          }
        } catch (error) {
          console.error("Error loading token:", error);
          toast({
            title: "Error",
            description: "Failed to load token details",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      loadToken();
    }
  }, [isEdit, tokenId, navigate, toast, form, projectId]);

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const tokenData = {
        ...values,
        project_id: projectId,
      };

      let result;
      if (isEdit && tokenId) {
        result = await updateToken(tokenId, tokenData);
        toast({
          title: "Success",
          description: "Token updated successfully",
        });
      } else {
        result = await createToken(tokenData);
        toast({
          title: "Success",
          description: "Token created successfully",
        });
      }

      // Navigate to token detail page
      navigate(`/projects/${projectId}/tokens/${result.id}`);
    } catch (error) {
      console.error("Error saving token:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} token`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Watch the standard field to conditionally render fields
  const tokenStandard = form.watch("standard");

  if (initialLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        <p className="mt-2 text-gray-600">Loading token details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/tokens`)}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Token" : "Create New Token"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="features">Features & Configuration</TabsTrigger>
              {tokenStandard === TokenStandard.ERC20 && (
                <TabsTrigger value="erc20">ERC-20 Options</TabsTrigger>
              )}
              {tokenStandard === TokenStandard.ERC721 && (
                <TabsTrigger value="erc721">ERC-721 Options</TabsTrigger>
              )}
              {tokenStandard === TokenStandard.ERC1155 && (
                <TabsTrigger value="erc1155">ERC-1155 Options</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. My Awesome Token" {...field} />
                          </FormControl>
                          <FormDescription>
                            The full name of your token
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. MAT" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            Short uppercase identifier for your token (e.g. ETH, BTC)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Standard</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select token standard" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={TokenStandard.ERC20}>
                                ERC-20 (Fungible Token)
                              </SelectItem>
                              <SelectItem value={TokenStandard.ERC721}>
                                ERC-721 (Non-Fungible Token)
                              </SelectItem>
                              <SelectItem value={TokenStandard.ERC1155}>
                                ERC-1155 (Multi Token)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of token you are creating
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={TokenStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={TokenStatus.REVIEW}>Under Review</SelectItem>
                              <SelectItem value={TokenStatus.APPROVED}>Approved</SelectItem>
                              <SelectItem value={TokenStatus.REJECTED}>Rejected</SelectItem>
                              <SelectItem value={TokenStatus.READY_TO_MINT}>Ready to Mint</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Current state of the token
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your token and its purpose"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A detailed description of your token's purpose and functionality
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="is_mintable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mintable</FormLabel>
                              <FormDescription>
                                Allows creating new tokens after deployment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_burnable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Burnable</FormLabel>
                              <FormDescription>
                                Allows tokens to be destroyed
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_pausable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Pausable</FormLabel>
                              <FormDescription>
                                Allows token transfers to be paused in emergencies
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="access_control_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Control</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access control" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Ownable">
                                  Ownable (Single owner)
                                </SelectItem>
                                <SelectItem value="Roles">
                                  Role-Based (Multiple roles)
                                </SelectItem>
                                <SelectItem value="None">
                                  None (No access control)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="flex items-center">
                              Determines how admin permissions are managed
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-1 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p><strong>Ownable:</strong> Single owner with full admin rights</p>
                                    <p><strong>Roles:</strong> Multiple roles with specific permissions</p>
                                    <p><strong>None:</strong> No access control system</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {tokenStandard === TokenStandard.ERC20 && (
              <TabsContent value="erc20">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="decimals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Decimals</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="18"
                                  type="number"
                                  {...field}
                                  value={field.value !== undefined ? field.value : ""}
                                />
                              </FormControl>
                              <FormDescription>
                                The number of decimal places for your token (usually 18)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="total_supply"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Initial Supply</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={form.watch("is_mintable") ? "Optional" : "Required"}
                                  type="text"
                                  {...field}
                                  value={field.value !== undefined ? field.value : ""}
                                />
                              </FormControl>
                              <FormDescription>
                                {form.watch("is_mintable") 
                                  ? "Initial token supply (can be minted later)" 
                                  : "Total fixed token supply"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_snapshottable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Snapshots</FormLabel>
                                <FormDescription>
                                  Record token balances at specific points in time
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_votes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Votes</FormLabel>
                                <FormDescription>
                                  Enable voting capabilities for governance
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_flash_mintable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Flash Minting</FormLabel>
                                <FormDescription>
                                  Allows temporarily borrowing tokens within a single transaction
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {tokenStandard === TokenStandard.ERC721 && (
              <TabsContent value="erc721">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="is_enumerable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enumerable</FormLabel>
                                <FormDescription>
                                  Enables on-chain enumeration of all tokens
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_uri_storage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">URI Storage</FormLabel>
                                <FormDescription>
                                  Store token URIs on-chain for each token ID
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="base_uri"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base URI</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/api/token/"
                                    {...field}
                                    value={field.value !== undefined ? field.value : ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The base URI for all token IDs (tokenId will be appended)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {tokenStandard === TokenStandard.ERC1155 && (
              <TabsContent value="erc1155">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="base_uri"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base URI</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/api/token/"
                                    {...field}
                                    value={field.value !== undefined ? field.value : ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The base URI for all token IDs (tokenId will be appended)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}/tokens`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Token" : "Create Token"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 