import React, { useState, useRef } from "react";
import { useIssuerOnboarding } from "./IssuerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileUp, 
  CloudUpload, 
  CheckCircle, 
  AlertTriangle, 
  X as CloseIcon,
  FileText
} from "lucide-react";

const DocumentUpload: React.FC = () => {
  const { state, uploadDocument, nextStep, prevStep } = useIssuerOnboarding();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedDocumentId) {
      uploadDocument(selectedDocumentId, files[0]);
      setSelectedDocumentId(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "uploaded":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Uploaded
          </Badge>
        );
      case "pending_review":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Pending Review
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Not Uploaded
          </Badge>
        );
    }
  };

  const requiredDocsUploaded = state.documents
    .filter(doc => doc.required)
    .every(doc => doc.status !== "not_uploaded");

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-2">Document Upload</h2>
      <p className="text-gray-600 mb-6">
        Provide essential information about your organization and upload required documents
      </p>

      {!requiredDocsUploaded && (
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Please upload all required documents to proceed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">Certificate of Incorporation</h3>
          <div className="flex items-center mb-2 space-x-2">
            <Badge variant="destructive">Required</Badge>
            {getStatusBadge(state.documents.find(d => d.id === "cert-incorp")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Official document confirming the company's legal formation
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("cert-incorp")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "cert-incorp")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>

        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">Articles of Association</h3>
          <div className="flex items-center mb-2 space-x-2">
            <Badge variant="destructive">Required</Badge>
            {getStatusBadge(state.documents.find(d => d.id === "articles")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Document outlining the company's rules and regulations
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("articles")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "articles")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>

        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">List of Directors</h3>
          <div className="flex items-center mb-2 space-x-2">
            <Badge variant="destructive">Required</Badge>
            {getStatusBadge(state.documents.find(d => d.id === "directors")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Official register of all company directors
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("directors")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "directors")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>

        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">Shareholder Register</h3>
          <div className="flex items-center mb-2 space-x-2">
            <Badge variant="destructive">Required</Badge>
            {getStatusBadge(state.documents.find(d => d.id === "shareholders")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Official register of all company shareholders
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("shareholders")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "shareholders")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>

        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">Latest Financial Statements</h3>
          <div className="flex items-center mb-2">
            {getStatusBadge(state.documents.find(d => d.id === "financial")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Recent financial reports (balance sheet, income statement, etc.)
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("financial")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "financial")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>

        <Card className="p-6 border">
          <h3 className="text-base font-semibold mb-2">Regulatory Status Documentation</h3>
          <div className="flex items-center mb-2">
            {getStatusBadge(state.documents.find(d => d.id === "regulatory")?.status || "not_uploaded")}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Documentation confirming regulatory status or exemptions
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDocumentSelect("regulatory")}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {state.documents.find(d => d.id === "regulatory")?.status === "not_uploaded" 
              ? "Upload Document" 
              : "Replace Document"}
          </Button>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-md">
        <div className="flex items-center mb-4">
          <FileUp className="mr-2 h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold">Document Upload Area</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          Select a document type first
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-white">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 mb-2">
            Drag and drop your file here or select a document type above
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOCX, JPG, PNG (max 10MB)
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button 
          onClick={nextStep}
          disabled={!requiredDocsUploaded}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;