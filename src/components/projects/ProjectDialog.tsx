import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuerDocumentList from "../documents/IssuerDocumentList";
import {
  FileText,
  CreditCard,
  FileCheck,
  File,
  CheckSquare,
  Shield,
  Building,
  DollarSign,
  BarChart,
  Clock,
  AlertTriangle
} from "lucide-react";
import { IssuerDocumentType } from "@/types/centralModels";
import {
  IssuerCreditworthinessUpload,
  ProjectSecurityTypeUpload,
  OfferingDetailsUpload,
  TermSheetUpload,
  SpecialRightsUpload,
  UnderwritersUpload,
  UseProceedsUpload,
  FinancialHighlightsUpload,
  TimingUpload,
  RiskFactorsUpload,
  LegalRegulatoryComplianceUpload
} from "../documents/IssuerDocumentUpload";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Form validation schema
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  status: z.string().min(1, { message: "Please select a status." }),
  project_type: z.string().min(1, { message: "Please select a project type." }),
  token_symbol: z.string().optional(),
  target_raise: z.string().optional(),
  authorized_shares: z.string().optional(),
  share_price: z.string().optional(),
  company_valuation: z.string().optional(),
  funding_round: z.string().optional(),
  legal_entity: z.string().optional(),
  jurisdiction: z.string().optional(),
  tax_id: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormValues) => void;
  isProcessing: boolean;
  title: string;
  description: string;
  defaultValues?: any;
}

const ProjectDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isProcessing,
  title,
  description,
  defaultValues,
}: ProjectDialogProps) => {
  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      project_type: "equity",
      token_symbol: "",
      target_raise: "",
      authorized_shares: "",
      share_price: "",
      company_valuation: "",
      funding_round: "",
      legal_entity: "",
      jurisdiction: "",
      tax_id: "",
      is_primary: false,
    },
  });

  // Set form values when editing a project
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        description: defaultValues.description || "",
        status: defaultValues.status || "draft",
        project_type: defaultValues.project_type || "equity",
        token_symbol: defaultValues.token_symbol || "",
        target_raise: defaultValues.target_raise?.toString() || "",
        authorized_shares: defaultValues.authorized_shares?.toString() || "",
        share_price: defaultValues.share_price?.toString() || "",
        company_valuation: defaultValues.company_valuation?.toString() || "",
        funding_round: defaultValues.funding_round || "",
        legal_entity: defaultValues.legal_entity || "",
        jurisdiction: defaultValues.jurisdiction || "",
        tax_id: defaultValues.tax_id || "",
        is_primary: defaultValues.is_primary || false,
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        status: "draft",
        project_type: "equity",
        token_symbol: "",
        target_raise: "",
        authorized_shares: "",
        share_price: "",
        company_valuation: "",
        funding_round: "",
        legal_entity: "",
        jurisdiction: "",
        tax_id: "",
        is_primary: false,
      });
    }
  }, [open, defaultValues, form]);

  // Get project type options
  const projectTypeOptions = [
    // Traditional Assets
    { value: "structured_products", label: "Structured Products" },
    { value: "equity", label: "Equity" },
    { value: "commodities", label: "Commodities" },
    { value: "funds_etfs_etps", label: "Funds, ETFs, ETPs" },
    { value: "bonds", label: "Bonds" },
    {
      value: "quantitative_investment_strategies",
      label: "Quantitative Investment Strategies",
    },
    // Alternative Assets
    { value: "private_equity", label: "Private Equity" },
    { value: "private_debt", label: "Private Debt" },
    { value: "real_estate", label: "Real Estate" },
    { value: "energy", label: "Energy" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "collectibles", label: "Collectibles & Other Assets" },
    // Digital Assets
    { value: "digital_tokenised_fund", label: "Digital Tokenised Fund" },
  ];

  // Options for funding rounds
  const fundingRoundOptions = [
    { value: "pre_seed", label: "Pre-Seed" },
    { value: "seed", label: "Seed" },
    { value: "series_a", label: "Series A" },
    { value: "series_b", label: "Series B" },
    { value: "series_c", label: "Series C" },
    { value: "series_d", label: "Series D+" },
    { value: "growth", label: "Growth" },
    { value: "mezzanine", label: "Mezzanine" },
    { value: "pre_ipo", label: "Pre-IPO" },
  ];

  // State for the active tab
  const [activeTab, setActiveTab] = useState("basic");
  // State for active document category
  const [activeDocCategory, setActiveDocCategory] = useState("essential");

  // Simplified document categories with only the essential ones
  const documentCategories = [
    {
      id: "essential",
      label: "Essential Documents",
      icon: <FileText className="h-4 w-4 mr-2" />,
      types: [
        IssuerDocumentType.TERM_SHEET,
        IssuerDocumentType.OFFERING_DETAILS
      ],
      description: "Critical project documents required for investors"
    },
    {
      id: "financial",
      label: "Financial",
      icon: <BarChart className="h-4 w-4 mr-2" />,
      types: [
        IssuerDocumentType.FINANCIAL_HIGHLIGHTS, 
        IssuerDocumentType.USE_OF_PROCEEDS
      ],
      description: "Financial information and projections"
    },
    {
      id: "legal",
      label: "Legal & Risk",
      icon: <Shield className="h-4 w-4 mr-2" />,
      types: [
        IssuerDocumentType.SPECIAL_RIGHTS, 
        IssuerDocumentType.RISK_FACTORS,
        IssuerDocumentType.LEGAL_REGULATORY_COMPLIANCE
      ],
      description: "Legal rights, terms, and risk information"
    }
  ];

  // Map document types to their upload components
  const getUploadComponent = (type: IssuerDocumentType) => {
    const props = {
      projectId: defaultValues?.id,
      onDocumentUploaded: () => {
        // Force refresh of document list
        const event = new CustomEvent('document-uploaded');
        window.dispatchEvent(event);
      }
    };
    
    switch (type) {
      case IssuerDocumentType.ISSUER_CREDITWORTHINESS:
        return <IssuerCreditworthinessUpload {...props} />;
      case IssuerDocumentType.PROJECT_SECURITY_TYPE:
        return <ProjectSecurityTypeUpload {...props} />;
      case IssuerDocumentType.OFFERING_DETAILS:
        return <OfferingDetailsUpload {...props} />;
      case IssuerDocumentType.TERM_SHEET:
        return <TermSheetUpload {...props} />;
      case IssuerDocumentType.SPECIAL_RIGHTS:
        return <SpecialRightsUpload {...props} />;
      case IssuerDocumentType.UNDERWRITERS:
        return <UnderwritersUpload {...props} />;
      case IssuerDocumentType.USE_OF_PROCEEDS:
        return <UseProceedsUpload {...props} />;
      case IssuerDocumentType.FINANCIAL_HIGHLIGHTS:
        return <FinancialHighlightsUpload {...props} />;
      case IssuerDocumentType.TIMING:
        return <TimingUpload {...props} />;
      case IssuerDocumentType.RISK_FACTORS:
        return <RiskFactorsUpload {...props} />;
      case IssuerDocumentType.LEGAL_REGULATORY_COMPLIANCE:
        return <LegalRegulatoryComplianceUpload {...props} />;
      default:
        return null;
    }
  };

  // Get icon for document type
  const getDocumentTypeIcon = (type: IssuerDocumentType) => {
    switch (type) {
      case IssuerDocumentType.ISSUER_CREDITWORTHINESS:
        return <CreditCard className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.PROJECT_SECURITY_TYPE:
        return <Shield className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.OFFERING_DETAILS:
        return <File className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.TERM_SHEET:
        return <FileText className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.SPECIAL_RIGHTS:
        return <CheckSquare className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.UNDERWRITERS:
        return <Building className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.USE_OF_PROCEEDS:
        return <DollarSign className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.FINANCIAL_HIGHLIGHTS:
        return <BarChart className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.TIMING:
        return <Clock className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.RISK_FACTORS:
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case IssuerDocumentType.LEGAL_REGULATORY_COMPLIANCE:
        return <Shield className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  // Helper to format document type label
  const formatDocumentTypeLabel = (type: string) => {
    if (type === IssuerDocumentType.OFFERING_DETAILS) {
      return "Prospectus Details";
    }
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {defaultValues ? (
              <Save className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="financial">Financial Details</TabsTrigger>
                <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
                {defaultValues?.id && <TabsTrigger value="documents">Documents</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter project description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
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
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="token_symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BTC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Primary Project</FormLabel>
                          <FormDescription>
                            Set as your primary project (will unset other primary projects)
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
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="target_raise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Raise ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 1000000" {...field} />
                        </FormControl>
                        <FormDescription>
                          The total amount you aim to raise
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorized_shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authorized Shares</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 1000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="share_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Share/Token Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.0001" placeholder="e.g. 0.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_valuation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Valuation ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 10000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="funding_round"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Round</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding round" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fundingRoundOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="legal" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="legal_entity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Entity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Acme Inc." {...field} />
                        </FormControl>
                        <FormDescription>
                          The legal entity associated with this project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jurisdiction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jurisdiction</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Delaware, USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. EIN or VAT number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Documents Tab with simplified categories */}
              {defaultValues?.id && (
                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Tabs value={activeDocCategory} onValueChange={setActiveDocCategory} className="w-full">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <TabsList className="md:w-auto h-auto flex-wrap">
                          {documentCategories.map(category => (
                            <TabsTrigger 
                              key={category.id} 
                              value={category.id}
                              className="flex items-center gap-1"
                            >
                              {category.icon}
                              <span>{category.label}</span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      {documentCategories.map(category => (
                        <TabsContent key={category.id} value={category.id} className="mt-4">
                          <div className="grid grid-cols-1 gap-6">
                            <div className="border-l-4 border-primary/20 pl-3 mb-4">
                              <h3 className="text-base font-medium">{category.label}</h3>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                            {category.types.map(docType => (
                              <Card key={docType} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getDocumentTypeIcon(docType)}
                                      <CardTitle className="text-base">
                                        {formatDocumentTypeLabel(docType)}
                                      </CardTitle>
                                    </div>
                                    <div>
                                      {getUploadComponent(docType)}
                                    </div>
                                  </div>
                                  <CardDescription className="text-xs mt-1">
                                    {getDocumentTypeDescription(docType)}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <IssuerDocumentList
                                    projectId={defaultValues.id}
                                    key={`${docType}-${defaultValues.id}`}
                                    preFilteredType={docType}
                                    compact={true}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing || activeTab === "documents"}
              >
                Cancel
              </Button>
              {activeTab !== "documents" && (
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {defaultValues ? "Saving..." : "Creating..."}
                    </>
                  ) : defaultValues ? (
                    "Save changes"
                  ) : (
                    "Create project"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get document type descriptions
function getDocumentTypeDescription(type: IssuerDocumentType): string {
  switch (type) {
    case IssuerDocumentType.ISSUER_CREDITWORTHINESS:
      return "Documents related to issuer's credit rating, financial position and reputation";
    case IssuerDocumentType.PROJECT_SECURITY_TYPE:
      return "Details about the type of security being offered";
    case IssuerDocumentType.OFFERING_DETAILS:
      return "Prospectus and detailed information about the offering";
    case IssuerDocumentType.TERM_SHEET:
      return "Term sheet outlining the key terms of the investment";
    case IssuerDocumentType.SPECIAL_RIGHTS:
      return "Documents detailing any special rights or privileges for investors";
    case IssuerDocumentType.UNDERWRITERS:
      return "Information about underwriters or placement agents";
    case IssuerDocumentType.USE_OF_PROCEEDS:
      return "Documentation on how the raised funds will be used";
    case IssuerDocumentType.FINANCIAL_HIGHLIGHTS:
      return "Key financial information and projections";
    case IssuerDocumentType.TIMING:
      return "Timeline details for the offering and important dates";
    case IssuerDocumentType.RISK_FACTORS:
      return "Information about potential risks associated with the investment";
    case IssuerDocumentType.LEGAL_REGULATORY_COMPLIANCE:
      return "Documents pertaining to legal and regulatory compliance agreements and requirements";
    default:
      return "Project documentation";
  }
}

export default ProjectDialog;
