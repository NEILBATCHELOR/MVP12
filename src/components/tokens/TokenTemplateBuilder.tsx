import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

import TokenTemplateSelector from "./TokenTemplateSelector";
import TokenTemplateDetails from "./TokenTemplateDetails";
import {
  ERC20Config,
  ERC721Config,
  ERC1155Config,
  ERC1400Config,
  ERC3525Config,
  ERC4626Config,
} from "./standards";

// Import services
import { 
  createTokenTemplate, 
  updateTokenTemplate,
  createTokenFromTemplate
} from "@/lib/services/tokenTemplateService";
import { TokenStandard } from "@/types/centralModels";

interface TokenTemplateBuilderProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
  onSave: (tokenCreated: boolean) => void;
}

const TokenTemplateBuilder: React.FC<TokenTemplateBuilderProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
  onSave,
}) => {
  // Determine if we're in edit mode by checking if tokenForm has an id
  const isEditMode = !!tokenForm.id;
  
  // Determine initial step based on whether we're editing and have product info
  const getInitialStep = () => {
    if (isEditMode && tokenForm.metadata?.product) {
      // If editing with product info, skip to configure if a standard is set
      return tokenForm.standard ? "configure" : "details";
    }
    return "select"; // Default to selection step
  };
  
  const [step, setStep] = useState<"select" | "details" | "configure">(getInitialStep());
  
  // Use tokenForm data for initial state if editing
  const [selectedProduct, setSelectedProduct] = useState<string>(
    tokenForm.metadata?.product || ""
  );
  const [isAlternative, setIsAlternative] = useState<boolean>(
    tokenForm.metadata?.templateType === "alternative"
  );
  const [activeStandard, setActiveStandard] = useState<string>(
    isEditMode ? (tokenForm.metadata?.standardKey || "") : ""
  );
  const [saving, setSaving] = useState<boolean>(false);
  
  // Store separate configurations for each token standard
  const [standardConfigs, setStandardConfigs] = useState<Record<string, any>>({
    "ERC-20": { name: "", symbol: "", decimals: 18 },
    "ERC-721": { name: "", symbol: "" },
    "ERC-1155": { name: "", symbol: "" },
    "ERC-1400": { name: "", symbol: "" },
    "ERC-3525": { name: "", symbol: "" },
    "ERC-4626": { name: "", symbol: "" },
  });

  // Update the specific standard config when switching tabs
  const handleStandardChange = (standard: string) => {
    // Save the current standard's config before switching
    if (activeStandard) {
      setStandardConfigs(prev => ({
        ...prev,
        [activeStandard]: {
          ...prev[activeStandard],
          name: tokenForm.name,
          symbol: tokenForm.symbol,
          // Save other relevant properties from tokenForm to the specific standard
        }
      }));
    }
    
    // Set the active standard
    setActiveStandard(standard);
    
    // Load the standard-specific configuration
    const standardConfig = standardConfigs[standard];
    if (standardConfig) {
      // Update the token form with the standard-specific configuration
      setTokenForm(prev => ({
        ...prev,
        name: standardConfig.name || prev.name,
        symbol: standardConfig.symbol || prev.symbol,
        // Load other specific properties
      }));
    }
  };

  // Define the token standards that need to be configured for each product template
  const TOKEN_STANDARDS_CONFIG: Record<string, Record<string, string[]>> = {
    "Structured Products": {
      primary: ["ERC-1400", "ERC-20"],
      alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
    },
    Equity: {
      primary: ["ERC-1400", "ERC-20"],
      alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
    },
    Commodities: {
      primary: ["ERC-1155", "ERC-20"],
      alternative: ["ERC-20"],
    },
    "Funds, ETFs, ETPs": {
      primary: ["ERC-1400", "ERC-4626", "ERC-20"],
      alternative: ["ERC-4626", "ERC-20"],
    },
    Bonds: {
      primary: ["ERC-1400", "ERC-20"],
      alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
    },
    "Quantitative Investment Strategies": {
      primary: ["ERC-1400", "ERC-4626"],
      alternative: ["ERC-4626"],
    },
    "Private Equity": {
      primary: ["ERC-1400", "ERC-20"],
      alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
    },
    "Private Debt": {
      primary: ["ERC-1400", "ERC-20"],
      alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
    },
    "Real Estate": {
      primary: ["ERC-1400", "ERC-3525", "ERC-20"],
      alternative: ["ERC-1400", "ERC-20"],
    },
    Energy: {
      primary: ["ERC-1400", "ERC-1155", "ERC-20"],
      alternative: ["ERC-1400", "ERC-20"],
    },
    Infrastructure: {
      primary: ["ERC-1400", "ERC-3525", "ERC-20"],
      alternative: ["ERC-1400", "ERC-20"],
    },
    "Collectibles & all other assets": {
      primary: ["ERC-721", "ERC-1155", "ERC-20"],
      alternative: ["ERC-721", "ERC-20"],
    },
    "Digital Tokenised Fund": {
      primary: ["ERC-1400", "ERC-4626", "ERC-20"],
      alternative: ["ERC-4626"],
    },
    "Custom Template": {
      primary: [
        "ERC-20",
        "ERC-721",
        "ERC-1155",
        "ERC-1400",
        "ERC-3525",
        "ERC-4626",
      ],
      alternative: [
        "ERC-20",
        "ERC-721",
        "ERC-1155",
        "ERC-1400",
        "ERC-3525",
        "ERC-4626",
      ],
    },
  };

  // Handle template selection
  const handleSelectTemplate = (product: string, alternative: boolean) => {
    setSelectedProduct(product);
    setIsAlternative(alternative);
    setStep("details");

    // Update token form with selected product and template type
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        product: product,
        templateType: alternative ? "alternative" : "primary",
      },
    }));
  };

  // Handle configuration
  const handleConfigure = () => {
    setStep("configure");
    const templateType = isAlternative ? "alternative" : "primary";
    const standards =
      TOKEN_STANDARDS_CONFIG[selectedProduct]?.[templateType] || [];

    if (standards.length > 0) {
      // Initialize the token form with the base details
      const baseDetails = {
        name: tokenForm.name,
        symbol: tokenForm.symbol,
        description: tokenForm.metadata?.description
      };
      
      // Initialize each standard config with the base details
      const updatedConfigs = { ...standardConfigs };
      standards.forEach(standard => {
        updatedConfigs[standard] = {
          ...updatedConfigs[standard],
          name: `${baseDetails.name}-${standard}`,
          symbol: baseDetails.symbol,
          description: baseDetails.description
        };
      });
      
      setStandardConfigs(updatedConfigs);
      
      // Set the active standard and load its config
      setActiveStandard(standards[0]);
      setTokenForm(prev => ({
        ...prev,
        name: updatedConfigs[standards[0]].name,
        symbol: updatedConfigs[standards[0]].symbol
      }));
    }
  };

  // Save current standard config when token form changes
  useEffect(() => {
    if (activeStandard) {
      setStandardConfigs(prev => ({
        ...prev,
        [activeStandard]: {
          ...prev[activeStandard],
          name: tokenForm.name,
          symbol: tokenForm.symbol,
        }
      }));
    }
  }, [tokenForm.name, tokenForm.symbol]);

  // Enhanced save function that uses our service layer
  const handleSaveTemplate = async () => {
    if (!tokenForm.name) {
      alert("Please provide a name for the template");
      return;
    }

    try {
      setSaving(true);
      
      // Save the current standard's config
      if (activeStandard) {
        setStandardConfigs(prev => ({
          ...prev,
          [activeStandard]: {
            ...prev[activeStandard],
            name: tokenForm.name,
            symbol: tokenForm.symbol,
          }
        }));
      }
      
      // Ensure projectId is set
      if (!tokenForm.projectId) {
        throw new Error("Project ID is required");
      }
      
      // Get all standards that need to be configured
      const standards = getStandardsToConfig();
      
      // Common metadata for all templates
      const commonMetadata = {
        description: tokenForm.metadata?.description || "",
        product: selectedProduct,
        templateType: isAlternative ? "alternative" : "primary",
        activeStandards: standards,
      };
      
      let tokenCreated = false;
      let savedTemplateIds: string[] = [];
      let firstTemplateId: string | null = null;

      // Step 1: Create or update a template for each standard
      for (const standardKey of standards) {
        // Get the standard-specific configuration
        const standardConfig = standardConfigs[standardKey];
        
        // Map standard string to our enum
        let standard: TokenStandard;
        switch (standardKey) {
          case "ERC-20":
            standard = TokenStandard.ERC20;
            break;
          case "ERC-721":
            standard = TokenStandard.ERC721;
            break;
          case "ERC-1155":
            standard = TokenStandard.ERC1155;
            break;
          case "ERC-1400":
            standard = TokenStandard.ERC20; // Map to closest available
            break;
          case "ERC-3525":
            standard = TokenStandard.ERC721; // Map to closest available
            break;
          case "ERC-4626":
            standard = TokenStandard.ERC20; // Map to closest available
            break;
          default:
            standard = TokenStandard.ERC20;
        }
        
        // Template data for this specific standard
        const templateData = {
          name: standardConfig.name || `${tokenForm.name}-${standardKey}`,
          description: commonMetadata.description,
          projectId: tokenForm.projectId,
          standard: standard,
          blocks: {
            features: tokenForm.blocks?.features || [],
            compliance: tokenForm.blocks?.compliance || [],
            governance: tokenForm.blocks?.governance || [],
            is_mintable: !!tokenForm.is_mintable,
            is_burnable: !!tokenForm.is_burnable, 
            is_pausable: !!tokenForm.is_pausable
          },
          metadata: {
            ...tokenForm.metadata,
            ...commonMetadata,
            standardKey: standardKey, // Save the original standard key
            isPartOfGroup: true,
            groupName: tokenForm.name,
            standardConfig: standardConfig
          }
        };
        
        try {
          // Create the template for this standard
          const result = await createTokenTemplate(templateData);
          savedTemplateIds.push(result.id);
          
          // Store the first template ID for token creation
          if (!firstTemplateId) {
            firstTemplateId = result.id;
          }
        } catch (error) {
          console.error(`Error saving template for ${standardKey}:`, error);
          // Continue with other standards even if one fails
        }
      }
      
      // Step 2: Create a token from one of the templates (typically the first one)
      if (firstTemplateId) {
        try {
          await createTokenFromTemplate(firstTemplateId, {
            name: tokenForm.name,
            symbol: tokenForm.symbol || tokenForm.name.substring(0, 4).toUpperCase(),
            projectId: tokenForm.projectId,
            decimals: tokenForm.decimals || 18
          });
          tokenCreated = true;
        } catch (createTokenError) {
          console.error("Error creating token from template:", createTokenError);
          // Don't throw this error, still report templates saved successfully
        }
      }
      
      // Display success message with information about saved templates
      if (savedTemplateIds.length > 0) {
        console.log(`Successfully saved ${savedTemplateIds.length} templates for standards: ${standards.join(', ')}`);
        
        // Call onSave with status info
        onSave(tokenCreated);
      } else {
        throw new Error("Failed to save any templates");
      }
    } catch (error) {
      console.error("Error in template creation process:", error);
      alert(error instanceof Error ? error.message : "Failed to save template: Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // Get the standards to configure based on the selected product and template type
  const getStandardsToConfig = () => {
    const templateType = isAlternative ? "alternative" : "primary";
    return TOKEN_STANDARDS_CONFIG[selectedProduct]?.[templateType] || [];
  };

  // Render the appropriate configuration component based on the active standard
  const renderConfigComponent = () => {
    switch (activeStandard) {
      case "ERC-20":
        return (
          <ERC20Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      case "ERC-721":
        return (
          <ERC721Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      case "ERC-1155":
        return (
          <ERC1155Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      case "ERC-1400":
        return (
          <ERC1400Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      case "ERC-3525":
        return (
          <ERC3525Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      case "ERC-4626":
        return (
          <ERC4626Config
            tokenForm={tokenForm}
            handleInputChange={handleInputChange}
            setTokenForm={setTokenForm}
          />
        );
      default:
        return <div>Select a token standard to configure</div>;
    }
  };

  // Initialize with loaded template data if available
  useEffect(() => {
    if (isEditMode && tokenForm.metadata?.product) {
      setSelectedProduct(tokenForm.metadata.product);
      setIsAlternative(tokenForm.metadata.templateType === "alternative");
      
      // If we have standard info, set it
      if (tokenForm.metadata.standardKey) {
        setActiveStandard(tokenForm.metadata.standardKey);
      } else if (tokenForm.standard) {
        // Convert from enum to string format with hyphen
        let standardKey = "";
        switch (tokenForm.standard) {
          case TokenStandard.ERC20:
            standardKey = "ERC-20";
            break;
          case TokenStandard.ERC721:
            standardKey = "ERC-721";
            break;
          case TokenStandard.ERC1155:
            standardKey = "ERC-1155";
            break;
          default:
            standardKey = "ERC-20";
        }
        setActiveStandard(standardKey);
      }
      
      // Setup form for editing
      if (step === "configure") {
        // If we have standard configs in metadata, initialize with those
        if (tokenForm.metadata.standardConfig) {
          setStandardConfigs(prev => ({
            ...prev,
            [activeStandard]: tokenForm.metadata.standardConfig
          }));
        }
      }
    }
  }, [isEditMode, tokenForm]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Token Template" : "Token Template Builder"}</CardTitle>
          <CardDescription>
            {isEditMode ? "Update your existing template configuration" : "Create templates to streamline token creation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "select" && (
            <TokenTemplateSelector
              onSelect={handleSelectTemplate}
              selectedProduct={selectedProduct}
              selectedAlternative={isAlternative}
            />
          )}

          {step === "details" && (
            <div>
              {selectedProduct && (
                <div className="space-y-6">
                  <div className="flex items-center mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => setStep("select")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    {isEditMode && (
                      <h3 className="text-lg font-semibold">Edit Template Details</h3>
                    )}
                  </div>

                  <TokenTemplateDetails
                    tokenForm={tokenForm}
                    handleInputChange={handleInputChange}
                    setTokenForm={setTokenForm}
                    onNext={handleConfigure}
                    selectedProduct={selectedProduct}
                    isAlternative={isAlternative}
                  />
                </div>
              )}
            </div>
          )}

          {step === "configure" && (
            <div className="space-y-6">
              <div className="flex items-center mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => setStep("details")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h3 className="text-lg font-semibold">
                  {isEditMode ? "Edit Token Standards" : "Configure Standards"}
                </h3>
              </div>

              <Tabs
                defaultValue={getStandardsToConfig()[0]}
                value={activeStandard}
                onValueChange={handleStandardChange}
                className="w-full"
              >
                <TabsList className="w-full">
                  {getStandardsToConfig().map((standard) => (
                    <TabsTrigger 
                      key={standard} 
                      value={standard}
                      className="flex-1"
                    >
                      {standard}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {getStandardsToConfig().map((standard) => (
                  <TabsContent key={standard} value={standard}>
                    {renderConfigComponent()}
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex justify-end gap-2 mt-8">
                <Button variant="outline" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Update Template" : "Save Template"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenTemplateBuilder;
