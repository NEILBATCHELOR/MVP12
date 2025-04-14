import React, { useState } from "react";
import { useIssuerOnboarding } from "./IssuerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Info,
  FileText,
  DollarSign,
  AlertCircle,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPVSetup: React.FC = () => {
  const { state, nextStep, prevStep, isDevelopmentMode } = useIssuerOnboarding();
  const [spvType, setSpvType] = useState("llc");
  const [spvJurisdiction, setSpvJurisdiction] = useState("delaware");
  const [assetType, setAssetType] = useState("real_estate");
  const [assetValue, setAssetValue] = useState("");
  const [assetLocation, setAssetLocation] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Skip validation in development mode
    if (isDevelopmentMode) {
      nextStep();
      return;
    }
    
    // Regular form validation
    const newErrors: Record<string, string> = {};
    
    if (!assetType) {
      newErrors.assetType = "Asset type is required";
    }
    
    if (!assetValue) {
      newErrors.assetValue = "Asset value is required";
    }
    
    if (!assetLocation) {
      newErrors.assetLocation = "Asset location is required";
    }
    
    if (!assetDescription) {
      newErrors.assetDescription = "Asset description is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If validation passes, proceed to next step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SPV Structure Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              SPV Structure Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="spvType" className="block text-sm font-medium mb-1">SPV Entity Type</Label>
                <Select value={spvType} onValueChange={setSpvType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select SPV entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="lp">Limited Partnership (LP)</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="spvJurisdiction" className="block text-sm font-medium mb-1">SPV Jurisdiction</Label>
                <Select value={spvJurisdiction} onValueChange={setSpvJurisdiction}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delaware">Delaware, USA</SelectItem>
                    <SelectItem value="wyoming">Wyoming, USA</SelectItem>
                    <SelectItem value="cayman">Cayman Islands</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="switzerland">Switzerland</SelectItem>
                    <SelectItem value="luxembourg">Luxembourg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Asset/Project Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Asset/Project Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="assetType" className="block text-sm font-medium mb-1">Asset Type</Label>
                <Select 
                  value={assetType}
                  onValueChange={(value) => {
                    setAssetType(value);
                    if (errors.assetType) {
                      setErrors({ ...errors, assetType: "" });
                    }
                  }}
                >
                  <SelectTrigger className={cn("w-full", errors.assetType && "border-red-500")}>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="private_equity">Private Equity</SelectItem>
                    <SelectItem value="venture_capital">Venture Capital</SelectItem>
                    <SelectItem value="private_debt">Private Debt</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="art">Art & Collectibles</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assetType && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetType}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="assetValue" className="block text-sm font-medium mb-1">Asset Valuation (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                  id="assetValue"
                  value={assetValue}
                  onChange={(e) => {
                    setAssetValue(e.target.value);
                    if (errors.assetValue) {
                      setErrors({ ...errors, assetValue: "" });
                    }
                  }}
                    placeholder="Enter asset value"
                    className={cn("pl-9 w-full", errors.assetValue && "border-red-500")}
                  />
                </div>
                {errors.assetValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetValue}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="assetLocation" className="block text-sm font-medium mb-1">Asset Location/Jurisdiction</Label>
                <Input
                  id="assetLocation"
                  value={assetLocation}
                  onChange={(e) => {
                    setAssetLocation(e.target.value);
                    if (errors.assetLocation) {
                      setErrors({ ...errors, assetLocation: "" });
                    }
                  }}
                  placeholder="Enter asset location"
                  className={cn("w-full", errors.assetLocation && "border-red-500")}
                />
                {errors.assetLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetLocation}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="assetDescription" className="block text-sm font-medium mb-1">Asset Description</Label>
          <Textarea
            id="assetDescription"
            value={assetDescription}
            onChange={(e) => {
              setAssetDescription(e.target.value);
              if (errors.assetDescription) {
                setErrors({ ...errors, assetDescription: "" });
              }
            }}
            placeholder="Provide a detailed description of the asset"
            className={cn("w-full", errors.assetDescription && "border-red-500")}
            rows={4}
          />
          {errors.assetDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.assetDescription}</p>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Document Upload
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4 flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Certificate of Incorporation</h4>
                <p className="text-xs text-gray-500 mb-2">Not uploaded</p>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Required</span>
              </div>
            </div>
            
            <div className="border rounded p-4 flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Articles of Association</h4>
                <p className="text-xs text-gray-500 mb-2">Not uploaded</p>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Required</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">Select a document type first</p>
              <p className="text-xs text-gray-500">no file selected</p>
              <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep} type="button" className="border border-gray-300">
          Save & Exit
        </Button>
        <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-6">
          {isDevelopmentMode ? "Skip to Next Step" : "Continue"}
        </Button>
      </div>
    </form>
  );
};

export default SPVSetup;