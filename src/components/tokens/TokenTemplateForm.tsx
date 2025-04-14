import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  createTokenTemplate,
  updateTokenTemplate,
  getTokenTemplate,
} from "@/lib/services/tokenTemplateService";
import { TokenTemplate, TokenStandard } from "@/types/centralModels";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  standard: z.enum([
    TokenStandard.ERC20,
    TokenStandard.ERC721,
    TokenStandard.ERC1155,
  ]),
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
  decimals: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  projectId: string;
  templateId?: string;
  isEdit?: boolean;
}

export default function TokenTemplateForm({ projectId, templateId, isEdit = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      standard: TokenStandard.ERC20,
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
      decimals: 18,
    },
  });

  // Load template data if editing
  useEffect(() => {
    if (isEdit && templateId) {
      const loadTemplate = async () => {
        try {
          setInitialLoading(true);
          const template = await getTokenTemplate(templateId);
          if (template) {
            // Safe approach to handling the JSON data with explicit default values
            const defaultValues = {
              name: template.name,
              description: template.description || "",
              standard: template.standard as TokenStandard,
              is_mintable: true,
              is_burnable: false,
              is_pausable: false,
              is_snapshottable: false,
              is_votes: false,
              is_flash_mintable: false,
              is_enumerable: false,
              is_uri_storage: false,
              base_uri: "",
              access_control_type: "Ownable" as const,
              features: [] as string[],
              decimals: 18,
            };
            
            // Only try to read values from blocks/metadata if they are objects
            try {
              // Parse blocks if it's a JSON string or use it directly if it's an object
              if (template.blocks && typeof template.blocks === 'object') {
                const blocks = template.blocks as any;
                if (typeof blocks.is_mintable === 'boolean') defaultValues.is_mintable = blocks.is_mintable;
                if (typeof blocks.is_burnable === 'boolean') defaultValues.is_burnable = blocks.is_burnable;
                if (typeof blocks.is_pausable === 'boolean') defaultValues.is_pausable = blocks.is_pausable;
                if (typeof blocks.is_snapshottable === 'boolean') defaultValues.is_snapshottable = blocks.is_snapshottable;
                if (typeof blocks.is_votes === 'boolean') defaultValues.is_votes = blocks.is_votes;
                if (typeof blocks.is_flash_mintable === 'boolean') defaultValues.is_flash_mintable = blocks.is_flash_mintable;
                if (typeof blocks.is_enumerable === 'boolean') defaultValues.is_enumerable = blocks.is_enumerable;
                if (typeof blocks.is_uri_storage === 'boolean') defaultValues.is_uri_storage = blocks.is_uri_storage;
              }
              
              // Parse metadata if it's a JSON string or use it directly if it's an object
              if (template.metadata && typeof template.metadata === 'object') {
                const metadata = template.metadata as any;
                if (typeof metadata.base_uri === 'string') defaultValues.base_uri = metadata.base_uri;
                
                if (typeof metadata.access_control_type === 'string') {
                  // Ensure access_control_type is one of the allowed values
                  const accessType = metadata.access_control_type;
                  if (accessType === 'Ownable' || accessType === 'Roles' || accessType === 'None') {
                    defaultValues.access_control_type = accessType;
                  }
                }
                
                if (Array.isArray(metadata.features)) defaultValues.features = metadata.features;
                
                if (metadata.decimals !== undefined) {
                  const decimals = Number(metadata.decimals);
                  if (!isNaN(decimals)) defaultValues.decimals = decimals;
                }
              }
            } catch (e) {
              console.error("Error parsing template data:", e);
            }
            
            // Set form values with our safely constructed object
            form.reset(defaultValues);
          } else {
            toast({
              title: "Error",
              description: "Template not found",
              variant: "destructive",
            });
            navigate(`/projects/${projectId}/token-templates`);
          }
        } catch (error) {
          console.error("Error loading template:", error);
          toast({
            title: "Error",
            description: "Failed to load template details",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      loadTemplate();
    }
  }, [isEdit, templateId, navigate, toast, form, projectId]);

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Structure the template data with blocks and metadata
      const templateData = {
        name: values.name,
        description: values.description,
        standard: values.standard,
        projectId: projectId,
        blocks: {
          is_mintable: values.is_mintable,
          is_burnable: values.is_burnable,
          is_pausable: values.is_pausable,
          is_snapshottable: values.is_snapshottable,
          is_votes: values.is_votes,
          is_flash_mintable: values.is_flash_mintable,
          is_enumerable: values.is_enumerable,
          is_uri_storage: values.is_uri_storage,
        },
        metadata: {
          base_uri: values.base_uri,
          access_control_type: values.access_control_type,
          features: values.features,
          decimals: values.decimals,
        }
      };

      let result;
      if (isEdit && templateId) {
        result = await updateTokenTemplate(templateId, templateData);
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        result = await createTokenTemplate(templateData);
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      // Navigate to template list page
      navigate(`/projects/${projectId}/token-templates`);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} template`,
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
        <p className="mt-2 text-gray-600">Loading template details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/token-templates`)}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Token Template" : "Create Token Template"}
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
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Basic ERC-20 Token" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this template
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
                            The type of token this template will create
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
                                placeholder="Describe what this template is used for"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A detailed description of this template and its purpose
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
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : Number(e.target.value);
                                    field.onChange(value);
                                  }}
                                  value={field.value === undefined ? "" : field.value}
                                />
                              </FormControl>
                              <FormDescription>
                                The default number of decimal places (usually 18)
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
                                <FormLabel>Default Base URI</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/api/token/"
                                    {...field}
                                    value={field.value !== undefined ? field.value : ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The default base URI for all token IDs
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
                                <FormLabel>Default Base URI</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/api/token/"
                                    {...field}
                                    value={field.value !== undefined ? field.value : ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The default base URI for all token IDs
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
              onClick={() => navigate(`/projects/${projectId}/token-templates`)}
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
                <>{isEdit ? "Update Template" : "Create Template"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 