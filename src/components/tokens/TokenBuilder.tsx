import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  Plus,
  Save,
  Trash2,
  Copy,
  Code,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  MoreVertical,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import {
  ERC20Config,
  ERC721Config,
  ERC1155Config,
  ERC1400Config,
  ERC3525Config,
  ERC4626Config,
} from "./standards";

import TokenTemplateBuilder from "./TokenTemplateBuilder";

import {
  TOKEN_STANDARDS,
  PRODUCT_CATEGORIES,
  BUILDING_BLOCKS,
} from "./templates";
import {
  TokenTemplate,
  Token,
  TokenFormState,
  getDefaultTokenForm,
} from "./templates/tokenTemplate";
import { generateContractPreview } from "./templates/contractPreview";
import ProjectSelector from "../captable/ProjectSelector";
import CapTableNavigation from "../captable/CapTableNavigation";

// Import the new service layer functions
import { getTokens, getToken, createToken, updateToken, deleteToken, cloneToken } from "@/lib/services/tokenService";
import { getTokenTemplates, createTokenFromTemplate, getTokenTemplate, deleteTemplateGroup } from "@/lib/services/tokenTemplateService";
import { TokenData, TokenStatus, TokenStandard, TokenDeployment } from "@/types/centralModels";

import TokenTemplateSelector from "./TokenTemplateSelector";
import TokenTemplateDetails from "./TokenTemplateDetails";

// Extended token data interface with all properties used in this component
interface ExtendedTokenData {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  project_id: string;
  standard: TokenStandard | string;
  status: TokenStatus | string;
  decimals: number;
  blocks?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  total_supply?: string;
  is_mintable?: boolean;
  is_burnable?: boolean;
  is_pausable?: boolean;
  features?: string[];
  token_deployments?: Array<any>;
}

interface TokenBuilderProps {
  projectId?: string;
}

const TOKEN_TEMPLATES: TokenTemplate[] = [];

const TokenBuilder: React.FC<TokenBuilderProps> = ({
  projectId: propProjectId,
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use projectId from props or from URL params
  const currentProjectId = propProjectId || paramProjectId;

  const [tokens, setTokens] = useState<ExtendedTokenData[]>([]);
  const [tokenTemplates, setTokenTemplates] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState("tokens");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TokenTemplate | null>(null);
  // States for product category and product selection
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isAlternative, setIsAlternative] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  // New token form state
  const [tokenForm, setTokenForm] = useState<TokenFormState>(
    getDefaultTokenForm(),
  );

  // State for the template standard selection dialog
  const [standardSelectionOpen, setStandardSelectionOpen] = useState(false);
  const [selectedGroupTemplate, setSelectedGroupTemplate] = useState<any>(null);

  // Fetch tokens when component mounts
  useEffect(() => {
    if (currentProjectId) {
      fetchTokens();
      fetchTokenTemplates();
      fetchProjectDetails();
    }
  }, [currentProjectId]);

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("name")
        .eq("id", currentProjectId)
        .single();

      if (error) throw error;
      setProjectName(data.name);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  // Load tokens using the new service layer
  const fetchTokens = async () => {
    try {
      setLoadingTokens(true);
      const data = await getTokens(currentProjectId);
      setTokens(data as unknown as ExtendedTokenData[]);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast({
        title: "Error",
        description: "Failed to load tokens",
        variant: "destructive",
      });
    } finally {
      setLoadingTokens(false);
    }
  };

  // Load token templates using the new service layer
  const fetchTokenTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getTokenTemplates(currentProjectId);
      
      // Group templates by groupName if they are part of a group
      const groupedTemplates: any[] = [];
      const groupMap: Record<string, any[]> = {};
      
      data.forEach(template => {
        const metadata = template.metadata || {};
        
        if (metadata.isPartOfGroup && metadata.groupName) {
          // Add to group
          if (!groupMap[metadata.groupName]) {
            groupMap[metadata.groupName] = [];
          }
          groupMap[metadata.groupName].push(template);
        } else {
          // Individual template, add directly
          groupedTemplates.push(template);
        }
      });
      
      // Process the groups and add the primary template for each group
      Object.entries(groupMap).forEach(([groupName, templates]) => {
        if (templates.length > 0) {
          // Create a group representative template
          const primaryTemplate = templates[0];
          const combinedTemplate = {
            ...primaryTemplate,
            id: primaryTemplate.id,
            name: groupName, // Use the group name
            isGroup: true,
            groupTemplates: templates,
            standards: templates.map(t => ({
              id: t.id,
              standard: t.metadata?.standardKey || t.standard,
              name: t.name
            })),
          };
          
          groupedTemplates.push(combinedTemplate);
        }
      });
      
      setTokenTemplates(groupedTemplates);
    } catch (error) {
      console.error("Error fetching token templates:", error);
      toast({
        title: "Error",
        description: "Failed to load token templates",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Handle token selection
  const handleSelectToken = async (tokenId: string) => {
    try {
      setIsSaving(true);
      const token = await getToken(tokenId);
      if (!token) throw new Error("Token not found");
      
      console.log("Loading token details:", token);
      
      // Set the token as selected
      setSelectedToken(token as any);
      
      // Format the standard to match the expected format in the dropdown for display purposes
      let displayStandard = "";
      let internalStandard = token.standard;
      
      // Determine the display format for the dropdown based on the token's standard
      if (typeof token.standard === 'number') {
        switch (token.standard) {
          case TokenStandard.ERC20:
            displayStandard = "ERC-20";
            break;
          case TokenStandard.ERC721:
            displayStandard = "ERC-721";
            break;
          case TokenStandard.ERC1155:
            displayStandard = "ERC-1155";
            break;
          default:
            displayStandard = "ERC-20";
        }
      } else if (typeof token.standard === 'string') {
        // Handle string standards
        if (token.standard.includes("ERC20") || token.standard.includes("ERC-20")) {
          displayStandard = "ERC-20";
          internalStandard = TokenStandard.ERC20;
        } else if (token.standard.includes("ERC721") || token.standard.includes("ERC-721")) {
          displayStandard = "ERC-721";
          internalStandard = TokenStandard.ERC721;
        } else if (token.standard.includes("ERC1155") || token.standard.includes("ERC-1155")) {
          displayStandard = "ERC-1155";
          internalStandard = TokenStandard.ERC1155;
        } else {
          displayStandard = "ERC-20";
          internalStandard = TokenStandard.ERC20;
        }
      }
      
      // Check for specialized standards stored in metadata
      const tokenMetadata = (token as any).metadata || {};
      
      // Special case for ERC-1400 and other extensions
      if (tokenMetadata.standardKey) {
        displayStandard = tokenMetadata.standardKey;
      } else if ((token.standard === TokenStandard.ERC20 || 
           (typeof token.standard === 'string' && token.standard.includes("ERC20"))) && 
          (tokenMetadata.standardKey === "ERC-1400" || 
           token.name.includes("ERC-1400") || 
           token.name.includes("ERC1400"))) {
        displayStandard = "ERC-1400";
        // Keep the internal standard as ERC20 since that's what the system understands
      }
      
      console.log(`Token standard from DB: ${token.standard}, display format: ${displayStandard}`);
      
      // Extract metadata fields with fallbacks
      const metadata = tokenMetadata || {};
      const standardData = metadata.standardData || {};
      const configuration = metadata.configuration || {};
      
      // Create a complete tokenForm by merging all available data
      setTokenForm({
        id: token.id, // Include ID for proper updating
        name: token.name,
        symbol: token.symbol || metadata.symbol || "",
        decimals: token.decimals || metadata.decimals || 18,
        standard: displayStandard, // Use the display format for the UI
        internalStandard: internalStandard, // Store the actual enum for database operations
        totalSupply: standardData.totalSupply || metadata.totalSupply || (token as any).total_supply || 1000000,
        
        // Ensure blocks are properly loaded
        blocks: {
          compliance: standardData.compliance || [],
          features: standardData.features || [],
          governance: standardData.governance || [],
          ...(token as any).blocks || {},
          is_mintable: metadata.mintable || tokenMetadata.is_mintable || false,
          is_burnable: metadata.burnable || tokenMetadata.is_burnable || false,
          is_pausable: metadata.pausable || tokenMetadata.is_pausable || false,
        },
        
        // Ensure all metadata is properly loaded
        metadata: {
          // Base metadata
          description: token.description || metadata.description || "",
          category: metadata.category || "",
          product: metadata.product || "",
          
          // ERC-1400 specific fields
          multiplePartitions: configuration.isMultiClass || metadata.multiplePartitions || false,
          transferRestrictions: configuration.transferRestrictions || metadata.transferRestrictions || false,
          restrictedJurisdictions: configuration.restrictedJurisdictions || metadata.restrictedJurisdictions || [],
          partitions: metadata.partitions || [],
          securityType: metadata.securityType || "",
          issuerName: metadata.issuerName || "",
          
          // Include all other metadata fields
          ...metadata,
          
          // Make sure standardKey is preserved
          standardKey: displayStandard,
        },
        
        // Ensure project ID is set
        projectId: token.project_id,
      });
      
      // Set the active tab to builder
      setActiveTab("builder");
      setIsCreating(true); // Enable the builder tab
      
      console.log(`Editing token with display standard: ${displayStandard}`);
      
    } catch (error) {
      console.error("Error selecting token:", error);
      toast({
        title: "Error",
        description: "Failed to load token details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle creating a new token
  const handleCreateToken = async () => {
    if (!tokenForm.name || !tokenForm.symbol || !tokenForm.standard) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Store the actual standard as-is, without mapping
      const standardStr = tokenForm.standard;
      
      // For DB type compatibility, we might need to convert internal enum types
      let standardForDB: string = standardStr;
      
      // We'll still add standardKey to metadata to maintain backward compatibility
      tokenForm.metadata = {
        ...tokenForm.metadata,
        standardKey: standardStr
      };
      
      const tokenData = {
        name: tokenForm.name,
        symbol: tokenForm.symbol,
        decimals: tokenForm.decimals,
        standard: standardForDB as any, // Use type assertion to avoid TypeScript errors
        project_id: currentProjectId,
        blocks: tokenForm.blocks,
        metadata: tokenForm.metadata || {},
        status: TokenStatus.DRAFT,
      };

      console.log(`Creating token with standard: ${standardStr} (DB value: ${standardForDB})`);
      await createToken(tokenData);
      
      toast({
        title: "Success",
        description: "Token created successfully",
        variant: "default",
      });
      
      fetchTokens();
      setActiveTab("tokens");
      setTokenForm(getDefaultTokenForm());
    } catch (error) {
      console.error("Error creating token:", error);
      toast({
        title: "Error",
        description: "Failed to create token",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle token deletion using the new service layer
  const handleDeleteToken = async (tokenId: string) => {
    try {
      setIsSaving(true);
      await deleteToken(tokenId);
      toast({
        title: "Success",
        description: "Token deleted successfully"
      });
      fetchTokens();
    } catch (error) {
      console.error("Error deleting token:", error);
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle token cloning using the new service layer
  const handleCloneToken = async (tokenId: string) => {
    try {
      setIsSaving(true);
      await cloneToken(tokenId);
      toast({
        title: "Success",
        description: "Token cloned successfully"
      });
      fetchTokens();
    } catch (error) {
      console.error("Error cloning token:", error);
      toast({
        title: "Error",
        description: "Failed to clone token",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle selecting a template - simplified since we removed templates
  const handleSelectTemplate = (template: TokenTemplate) => {
    setSelectedTemplate(template);
    setActiveTab("builder");
  };

  // Handle category and product selection
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct("");
  };

  // Handle selecting a product - simplified to go directly to builder
  const handleSelectProduct = (product: string) => {
    setSelectedProduct(product);
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        category: selectedCategory,
        product: product,
      },
    }));
    setActiveTab("builder");
  };

  // Handle project change
  const handleProjectChange = (newProjectId: string) => {
    navigate(`/projects/${newProjectId}/tokens`);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTokenForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle token standard change
  const handleStandardChange = (value: string) => {
    console.log(`Standard changed to: ${value}`);
    setTokenForm((prev) => ({ ...prev, standard: value }));
  };

  // Helper function to determine which configuration component to show
  const renderTokenConfiguration = () => {
    console.log(`Rendering configuration for standard: ${tokenForm.standard}`);
    
    // Strip any formatting for consistent comparison
    const standard = tokenForm.standard?.replace(/-/g, "") || "";
    
    if (standard.includes("ERC20")) {
      return (
        <ERC20Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    } else if (standard.includes("ERC721")) {
      return (
        <ERC721Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    } else if (standard.includes("ERC1155")) {
      return (
        <ERC1155Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    } else if (standard.includes("ERC1400")) {
      return (
        <ERC1400Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    } else if (standard.includes("ERC3525")) {
      return (
        <ERC3525Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    } else if (standard.includes("ERC4626")) {
      return (
        <ERC4626Config
          tokenForm={tokenForm}
          handleInputChange={handleInputChange}
          setTokenForm={setTokenForm}
        />
      );
    }
    
    // Default to ERC-20 if no match
    return (
      <ERC20Config
        tokenForm={tokenForm}
        handleInputChange={handleInputChange}
        setTokenForm={setTokenForm}
      />
    );
  }

  // Handle building block toggle
  const handleBlockToggle = (
    blockType: "compliance" | "features" | "governance",
    blockId: string,
  ) => {
    setTokenForm((prev) => {
      const blocks = { ...prev.blocks };
      if (blocks[blockType].includes(blockId)) {
        blocks[blockType] = blocks[blockType].filter((id) => id !== blockId);
      } else {
        blocks[blockType] = [...blocks[blockType], blockId];
      }
      return { ...prev, blocks };
    });
  };

  // Save token to database
  const saveToken = async () => {
    try {
      setIsSaving(true);

      // Validate form
      if (!tokenForm.name || !tokenForm.symbol || !tokenForm.standard) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Get the actual standard string (with hyphens) from the form
      const standardStr = tokenForm.standard;
      
      // Store the actual standard string in the database, not an enum
      const standardForDB = standardStr;

      // Ensure we capture ALL form data in metadata
      const completeMetadata = {
        ...tokenForm.metadata,
        // Explicitly add any fields that might be missing
        decimals: tokenForm.decimals,
        symbol: tokenForm.symbol,
        description: tokenForm.metadata?.description || "",
        // Store the actual standard in metadata for consistency
        standardKey: standardStr,
        // Additional standard-specific data
        standardData: {
          standard: standardStr,
          displayStandard: standardStr,
          totalSupply: tokenForm.totalSupply,
          features: tokenForm.blocks.features || [],
          compliance: tokenForm.blocks.compliance || [],
          governance: tokenForm.blocks.governance || [],
        },
        // Copy any configuration that might be nested in config objects
        configuration: {
          ...tokenForm.metadata?.configuration,
          isMultiClass: tokenForm.metadata?.multiplePartitions || false,
          transferRestrictions: tokenForm.metadata?.transferRestrictions || false,
          restrictedJurisdictions: tokenForm.metadata?.restrictedJurisdictions || [],
        },
      };

      // Generate contract preview
      const contractPreview = getContractPreview();

      if (selectedToken) {
        // Update existing token
        const { error } = await supabase
          .from("tokens")
          .update({
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: standardForDB as any, // Use type assertion to avoid TypeScript errors
            blocks: tokenForm.blocks || {}, // Ensure this is an object
            metadata: completeMetadata, // Use enhanced metadata
            contract_preview: contractPreview,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedToken.id);

        if (error) {
          console.error("Error updating token:", error);
          toast({
            title: "Error Updating Token",
            description: error.message || "Failed to update token.",
            variant: "destructive",
          });
          return;
        }

        try {
          // Create a new version - removed status field as it doesn't exist in schema
          const { error: versionError } = await supabase.from("token_versions").insert({
            token_id: selectedToken.id,
            version: 1,
            data: {
              name: tokenForm.name,
              symbol: tokenForm.symbol,
              decimals: tokenForm.decimals,
              standard: standardForDB as any, // Use type assertion
              blocks: tokenForm.blocks || {},
              metadata: completeMetadata // Use enhanced metadata
            },
            created_at: new Date().toISOString()
            // Removed status field that doesn't exist
          });
          
          if (versionError) {
            console.error("Error creating token version:", versionError);
            // Continue anyway since the main token was updated
            toast({
              title: "Warning",
              description: "Token updated but version history couldn't be saved.",
              variant: "default",
            });
          }
        } catch (versionErr) {
          console.error("Exception creating token version:", versionErr);
          // Continue anyway since the main token was updated
        }

        toast({
          title: "Success",
          description: "Token updated successfully.",
        });
      } else {
        // Create new token
        const { data, error } = await supabase
          .from("tokens")
          .insert({
            project_id: currentProjectId,
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: standardForDB as any, // Use type assertion
            blocks: tokenForm.blocks || {}, // Ensure this is an object
            metadata: completeMetadata, // Use enhanced metadata
            status: "DRAFT",
            contract_preview: contractPreview,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating token:", error);
          toast({
            title: "Error Creating Token",
            description: error.message || "Failed to create token.",
            variant: "destructive",
          });
          return;
        }

        try {
          // Create initial version - removed status field as it doesn't exist in schema
          const { error: versionError } = await supabase.from("token_versions").insert({
            token_id: data.id,
            version: 1,
            data: {
              name: tokenForm.name,
              symbol: tokenForm.symbol,
              decimals: tokenForm.decimals,
              standard: standardForDB as any, // Use type assertion
              blocks: tokenForm.blocks || {},
              metadata: completeMetadata // Use enhanced metadata
            },
            created_at: new Date().toISOString()
            // Removed status field that doesn't exist
          });
          
          if (versionError) {
            console.error("Error creating token version:", versionError);
            // Continue anyway since the main token was created
          }
        } catch (versionErr) {
          console.error("Exception creating token version:", versionErr);
          // Continue anyway since the main token was created
        }

        setSelectedToken(data);
        toast({
          title: "Success",
          description: "Token created successfully.",
        });
      }

      // Refresh tokens list and reset state
      fetchTokens();
      setIsCreating(false);
      setActiveTab("tokens"); // Navigate back to tokens list after success
    } catch (err) {
      console.error("Error saving token:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fix the Cancel button to not navigate away
  const handleCancelClick = () => {
    // Reset form and state but stay on the current page
    setActiveTab("tokens");
    setSelectedToken(null);
    setTokenForm(getDefaultTokenForm());
    setIsCreating(false);
  };

  // Generate contract preview using the imported function
  const getContractPreview = () => {
    return generateContractPreview(tokenForm);
  };

  async function handleCreateFromTemplate(template: any) {
    if (template.isGroup) {
      // For a group, show a dialog to select which standard to use
      setSelectedGroupTemplate({
        ...template,
        templateAction: "create" // Flag to indicate we're creating from template
      });
      setStandardSelectionOpen(true);
      return;
    }
    
    // For a single template, create directly
    await createTokenFromSelectedTemplate(template.id, template.name);
  }
  
  async function createTokenFromSelectedTemplate(templateId: string, templateName: string) {
    setIsSaving(true);
    try {
      // Pass all required parameters for createTokenFromTemplate
      const newToken = await createTokenFromTemplate(templateId, {
        name: templateName,
        symbol: templateName.substring(0, 4).toUpperCase(), // Generate a symbol from the name
        projectId: currentProjectId,
        decimals: 18 // Default value for decimals
      });
      toast({
        title: "Success!",
        description: `Token created from template "${templateName}"`,
      });
      await fetchTokens();
      setActiveTab("tokens");
    } catch (error) {
      console.error("Error creating token from template:", error);
      toast({
        title: "Error",
        description: "Failed to create token from template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Handle selecting a standard from a template group
  function handleSelectStandardFromGroup(standardTemplate: any) {
    setStandardSelectionOpen(false);
    createTokenFromSelectedTemplate(standardTemplate.id, standardTemplate.name);
  }

  // Helper function to format standard names (e.g., "ERC20" -> "ERC-20")
  function formatStandardName(standard: string): string {
    if (!standard) return "Unknown";
    
    // Check if it's already formatted with a hyphen
    if (standard.includes('-')) return standard;
    
    // Handle common token standards
    if (standard === "ERC20") return "ERC-20";
    if (standard === "ERC721") return "ERC-721";
    if (standard === "ERC1155") return "ERC-1155";
    if (standard === "ERC1400") return "ERC-1400";
    if (standard === "ERC3525") return "ERC-3525";
    if (standard === "ERC4626") return "ERC-4626";
    
    // For other standards, try to insert a hyphen before the numbers
    return standard.replace(/^(ERC)(\d+)$/, "$1-$2");
  }

  function getStandardLabel(template: any) {
    // For grouped templates, return the concatenated standards
    if (template.isGroup && template.standards) {
      return template.standards.map((s: any) => formatStandardName(s.standard)).join(', ');
    }
    
    // Try to get standard from template metadata if it exists
    if (template.metadata && template.metadata.product) {
      return template.metadata.product;
    }
    
    // Check for specific standardKey in metadata (like ERC-1400 which might be stored as ERC20 in database)
    if (template.metadata && template.metadata.standardKey) {
      return template.metadata.standardKey;
    }
    
    // Fallback to standard property with proper formatting
    return formatStandardName(template.standard) || "Unknown";
  }

  // Handle template editing
  const handleEditTemplate = async (template: any) => {
    try {
      setIsSaving(true);
      
      if (template.isGroup) {
        // For a template group, show dialog to select which standard to edit
        setSelectedGroupTemplate({
          ...template,
          templateAction: "edit" // Flag to indicate we're editing a template
        });
        setStandardSelectionOpen(true);
        return;
      }
      
      // For a single template, edit directly
      await loadTemplateForEditing(template.id);
    } catch (error) {
      console.error("Error preparing template for editing:", error);
      toast({
        title: "Error",
        description: "Failed to load template for editing",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper function to load a template for editing
  const loadTemplateForEditing = async (templateId: string) => {
    try {
      const template = await getTokenTemplate(templateId);
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      console.log("Loading template for editing:", template);
      
      // Navigate to template builder tab and enable editing
      setActiveTab("templates");
      setIsCreating(true);
      setEditTemplateId(templateId); // Set the template ID we're editing
      
      // Determine the standard format for display
      let displayStandard = template.standard as string;
      if (typeof template.standard === 'number') {
        switch (template.standard) {
          case TokenStandard.ERC20:
            displayStandard = "ERC-20";
            break;
          case TokenStandard.ERC721:
            displayStandard = "ERC-721";
            break;
          case TokenStandard.ERC1155:
            displayStandard = "ERC-1155";
            break;
          default:
            displayStandard = "ERC-20";
        }
      }
      
      // Check if there's a standardKey in metadata that overrides the standard
      if (template.metadata?.standardKey) {
        displayStandard = template.metadata.standardKey;
      }

      // Access the template's data fields, handling possible undefined values
      const templateMetadata = template.metadata || {};
      
      // Get default token form to ensure we have all required fields
      const defaultForm = getDefaultTokenForm();
      
      // Create a form with the template's actual data, preserving all fields
      setTokenForm({
        id: template.id,
        name: template.name || "",
        symbol: templateMetadata.symbol as string || template.name?.substring(0, 4).toUpperCase() || "",
        decimals: templateMetadata.decimals as number || 18,
        standard: displayStandard,
        totalSupply: templateMetadata.totalSupply as number || 1000000,
        blocks: {
          compliance: [],
          features: [],
          governance: [],
          ...(template.blocks as any || {})
        },
        metadata: {
          // First add all default metadata fields
          ...defaultForm.metadata,
          // Then override with template metadata if available
          ...templateMetadata,
          // Ensure critical fields are set
          description: template.description || templateMetadata.description || "",
          category: templateMetadata.category as string || "",
          product: templateMetadata.product as string || "",
        },
        projectId: template.projectId || currentProjectId,
      });
      
      // If we know the product and type, set the state for template selector
      if (templateMetadata.product) {
        setSelectedProduct(templateMetadata.product as string);
        setSelectedCategory(templateMetadata.category as string || "");
        setIsAlternative(templateMetadata.templateType === "alternative");
      }
      
      console.log(`Editing template with standard: ${displayStandard}`);
      
    } catch (error) {
      console.error("Error loading template for editing:", error);
      throw error;
    }
  };
  
  // Handle selecting a standard from a template group for editing
  function handleSelectStandardFromGroupForEdit(standardTemplate: any) {
    setStandardSelectionOpen(false);
    loadTemplateForEditing(standardTemplate.id);
  }

  // Handle token template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setIsSaving(true);
      
      // Get the template to check if it's part of a group
      const template = await getTokenTemplate(templateId);
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      if (template.metadata?.isPartOfGroup && template.metadata?.groupName) {
        // If it's part of a group, delete the whole group
        try {
          await deleteTemplateGroup(template.metadata.groupName, currentProjectId);
          toast({
            title: "Success",
            description: "Template group deleted successfully"
          });
        } catch (groupError: any) {
          console.error("Error deleting template group:", groupError);
          toast({
            title: "Error Deleting Group",
            description: groupError.message || "Failed to delete template group",
            variant: "destructive",
          });
          throw groupError;
        }
      } else {
        // Otherwise just delete the individual template
        const { error } = await supabase
          .from('token_templates')
          .delete()
          .eq('id', templateId);
          
        if (error) {
          console.error("Error deleting individual template:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to delete template",
            variant: "destructive",
          });
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Template deleted successfully"
        });
      }
      
      // Refresh the templates list
      fetchTokenTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      // Toast is already provided in the specific error cases above
    } finally {
      setIsSaving(false);
    }
  };

  // Add a proper back navigation function
  const handleBackNavigation = () => {
    // Check if history state exists and go back if it does
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // Go back in history
    } else {
      // Fallback to a known valid route
      navigate(`/projects/${currentProjectId}/captable/overview`);
    }
  };

  const handleChangeTokenStatus = async (tokenId: string, newStatus: TokenStatus) => {
    try {
      setLoadingTokens(true);
      await updateToken(tokenId, { status: newStatus });
      
      // Update the local state
      setTokens(tokens.map(t => 
        t.id === tokenId ? { ...t, status: newStatus } : t
      ));
      
      toast({
        title: "Status Updated",
        description: `Token status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating token status:", error);
      toast({
        title: "Error",
        description: "Failed to update token status",
        variant: "destructive",
      });
    } finally {
      setLoadingTokens(false);
    }
  };

  // Helper function to format token status for display
  function formatTokenStatus(status: string | TokenStatus): string {
    if (!status) return "Unknown";
    
    // Convert to title case for display
    const statusStr = String(status);
    
    switch (statusStr.toUpperCase()) {
      case TokenStatus.DRAFT: return "Draft";
      case TokenStatus.REVIEW: return "Under Review";
      case TokenStatus.APPROVED: return "Approved";
      case TokenStatus.READY_TO_MINT: return "Ready to Mint";
      case TokenStatus.MINTED: return "Minted";
      case TokenStatus.DEPLOYED: return "Deployed";
      case TokenStatus.PAUSED: return "Paused";
      case TokenStatus.DISTRIBUTED: return "Distributed";
      case TokenStatus.REJECTED: return "Rejected";
      default: return statusStr;
    }
  }

  return (
    <div className="w-full h-full bg-gray-50">
      {currentProjectId && <CapTableNavigation projectId={currentProjectId} />}
      
      {/* Template Group Action Dialog */}
      <Dialog open={standardSelectionOpen} onOpenChange={setStandardSelectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Token Standard</DialogTitle>
            <DialogDescription>
              {selectedGroupTemplate?.templateAction === "edit" ? 
                "Choose which token standard you want to edit from this template group." :
                "Choose which token standard you want to use from this template group."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedGroupTemplate?.standards?.map((std: any) => (
              <div 
                key={std.id} 
                className="p-3 border rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => selectedGroupTemplate?.templateAction === "edit" ? 
                  handleSelectStandardFromGroupForEdit(std) : 
                  handleSelectStandardFromGroup(std)}
              >
                <div className="font-medium">{std.standard}</div>
                <div className="text-sm text-muted-foreground">{std.name}</div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStandardSelectionOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackNavigation}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Token Builder</h1>
            </div>
            <p className="text-muted-foreground">
              Design and structure tokenized assets for {projectName}
            </p>
          </div>
          <div className="flex gap-2">
            {currentProjectId && (
              <ProjectSelector
                currentProjectId={currentProjectId}
                onProjectChange={handleProjectChange}
              />
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fetchTokens()}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => { setIsCreating(true); setActiveTab("templates"); }}
            >
              <Plus className="h-4 w-4" />
              <span>New Token</span>
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>My Tokens</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="flex items-center gap-2"
              disabled={!isCreating && !selectedToken}
            >
              <FileText className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="builder"
              className="flex items-center gap-2"
              disabled={!isCreating && !selectedToken}
            >
              <Code className="h-4 w-4" />
              <span>Token Builder</span>
            </TabsTrigger>
          </TabsList>

          {/* Tokens List Tab */}
          <TabsContent value="tokens" className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">My Tokens</h2>
              {(loadingTokens || loadingTemplates) ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (tokens.length === 0 && tokenTemplates.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tokens created yet</p>
                  <Button onClick={() => { setIsCreating(true); setActiveTab("templates"); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Token
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Render both tokens and templates in the same grid, sorted appropriately */}
                  {[...tokens.map(token => ({
                    ...token,
                    isTemplate: false, // Explicitly mark as not a template
                    sortKey: 2 // Sort regular tokens second
                  })), ...tokenTemplates.map(template => ({
                    ...template,
                    isTemplate: true, // Add flag to distinguish templates
                    sortKey: 1 // Sort templates first
                  }))]
                  .sort((a, b) => {
                    // First sort by sortKey (templates first)
                    if (a.sortKey !== b.sortKey) {
                      return a.sortKey - b.sortKey;
                    }
                    // Then sort alphabetically by name
                    return a.name.localeCompare(b.name);
                  })
                  .map((item, index, arr) => {
                    // Check if this is the first item of its kind (template or token)
                    const isFirstOfKind = index === 0 || arr[index - 1].isTemplate !== item.isTemplate;
                    
                    return (
                      <React.Fragment key={item.id}>
                        {isFirstOfKind && (
                          <div className="col-span-full mt-2 mb-1">
                            <h3 className="text-md font-medium text-gray-500">
                              {item.isTemplate ? "Templates" : "Tokens"}
                            </h3>
                          </div>
                        )}
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold">{item.name}</h3>
                                  {item.isTemplate ? (
                                    item.isGroup ? (
                                      <p className="text-sm text-muted-foreground">Template Group ({item.standards.length} standards)</p>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Template</p>
                                    )
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{item.symbol}</p>
                                  )}
                                </div>
                                {item.isTemplate ? (
                                  <Badge variant="outline">
                                    {item.isGroup ? "Template Group" : "Template"}
                                  </Badge>
                                ) : (
                                  <Badge variant={
                                    item.status === TokenStatus.DRAFT ? "outline" :
                                    item.status === TokenStatus.REVIEW ? "secondary" :
                                    item.status === TokenStatus.APPROVED ? "default" :
                                    item.status === TokenStatus.READY_TO_MINT ? "secondary" :
                                    item.status === TokenStatus.MINTED ? "default" :
                                    item.status === TokenStatus.DEPLOYED ? "default" :
                                    item.status === TokenStatus.PAUSED ? "outline" :
                                    item.status === TokenStatus.DISTRIBUTED ? "default" :
                                    item.status === TokenStatus.REJECTED ? "destructive" : "outline"
                                  }>
                                    {formatTokenStatus(item.status)}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium">Standard:</span> 
                                  {item.isTemplate ? 
                                    getStandardLabel(item) : 
                                    (item.metadata?.standardKey || getStandardLabel(item))}
                                </p>
                                {item.isGroup && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium mb-1">Includes:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {item.standards.map((std: any) => (
                                        <Badge key={std.id} variant="secondary" className="text-xs">
                                          {std.standard}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {!item.isTemplate && item.decimals !== undefined && (
                                  <p className="text-sm"><span className="font-medium">Decimals:</span> {item.decimals}</p>
                                )}
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                {item.isTemplate ? (
                                  <div className="flex gap-2 w-full">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditTemplate(item)}
                                      className="flex-1"
                                    >
                                      Edit Template
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleCreateFromTemplate(item)}
                                      className="flex-1"
                                      disabled={isSaving}
                                    >
                                      Create Token
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectToken(item.id)}
                                  >
                                    Edit
                                  </Button>
                                )}
                                <div>
                                  <Dialog>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {item.isTemplate ? (
                                          <>
                                            <DropdownMenuItem onClick={() => handleCreateFromTemplate(item)}>
                                              <Plus className="h-4 w-4 mr-2" /> Create Token
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-destructive"
                                              onClick={() => {
                                                handleDeleteTemplate(item.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                          </>
                                        ) : (
                                          <>
                                            <DropdownMenuItem onClick={() => navigate(`/projects/${currentProjectId}/token-management/${item.id}`)}>
                                              <Eye className="h-4 w-4 mr-2" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCloneToken(item.id)}>
                                              <Copy className="h-4 w-4 mr-2" /> Clone
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-destructive"
                                              onClick={() => {
                                                handleDeleteToken(item.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </Dialog>
                                </div>
                              </div>
                              {item.status && (
                                <div className="flex space-x-2 mt-2">
                                  <p className="text-sm text-muted-foreground">Status:</p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant={
                                          item.status === TokenStatus.DRAFT ? "outline" :
                                          item.status === TokenStatus.REVIEW ? "secondary" :
                                          item.status === TokenStatus.APPROVED ? "default" :
                                          item.status === TokenStatus.READY_TO_MINT ? "secondary" :
                                          item.status === TokenStatus.MINTED ? "default" :
                                          item.status === TokenStatus.DEPLOYED ? "default" :
                                          item.status === TokenStatus.PAUSED ? "outline" :
                                          item.status === TokenStatus.DISTRIBUTED ? "default" :
                                          item.status === TokenStatus.REJECTED ? "destructive" : "outline"
                                        } 
                                        size="sm"
                                      >
                                        {formatTokenStatus(item.status)}
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.DRAFT)}>
                                        Draft
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.REVIEW)}>
                                        Under Review
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.APPROVED)}>
                                        Approved
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.READY_TO_MINT)}>
                                        Ready to Mint
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.MINTED)}>
                                        Minted
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.DEPLOYED)}>
                                        Deployed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.PAUSED)}>
                                        Paused
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.DISTRIBUTED)}>
                                        Distributed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeTokenStatus(item.id, TokenStatus.REJECTED)}>
                                        Rejected
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TokenTemplateBuilder
              tokenForm={{...tokenForm, projectId: currentProjectId}}
              handleInputChange={handleInputChange}
              setTokenForm={setTokenForm}
              onSave={(tokenCreated) => {
                // Refresh data first to ensure we have latest data
                fetchTokenTemplates();
                fetchTokens();
                
                if (tokenCreated) {
                  // Token was successfully created from template
                  toast({
                    title: "Success",
                    description: "Template saved and token created successfully. Viewing your tokens.",
                  });
                  
                  // Switch to tokens tab to show the created token
                  setActiveTab("tokens");
                } else {
                  // Only the template was saved
                  toast({
                    title: "Template Saved",
                    description: "Template was saved but no token was created. You can use this template later to create tokens.",
                  });
                  // Switch to tokens tab to show the saved template
                  setActiveTab("tokens");
                }
                
                // Reset form and states
                setTokenForm(getDefaultTokenForm());
                setSelectedProduct("");
                setIsAlternative(false);
                setIsCreating(false);
              }}
            />
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedToken ? "Edit Token" : "Create New Token"}
                </CardTitle>
                <CardDescription>
                  {selectedToken
                    ? `Editing ${selectedToken.name} (${selectedToken.symbol})`
                    : "Configure your token properties"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Basic Token Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="standard">Token Standard</Label>
                      <Select
                        value={tokenForm.standard}
                        onValueChange={handleStandardChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a token standard" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOKEN_STANDARDS.map((standard) => (
                            <SelectItem
                              key={standard.value}
                              value={standard.value}
                            >
                              {standard.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {tokenForm.standard && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {
                            TOKEN_STANDARDS.find(
                              (s) => s.value === tokenForm.standard,
                            )?.description
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ERC-20 Configuration */}
                  {renderTokenConfiguration()}

                  {/* Save Button */}
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveToken}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Token</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TokenBuilder;
