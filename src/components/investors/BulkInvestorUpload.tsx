import React, { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface BulkInvestorUploadProps {
  onUploadComplete?: (investors: any[]) => void;
  onCancel?: () => void;
}

const BulkInvestorUpload = ({
  onUploadComplete = () => {},
  onCancel = () => {},
}: BulkInvestorUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Add this function at the top of the component, before validateCsvFile
  const isValidKycStatus = (status: string): boolean => {
    const validStatuses = ["not_started", "pending", "approved", "failed", "expired"];
    return validStatuses.includes(status.toLowerCase());
  };

  const normalizeKycStatus = (status: string): string => {
    if (!status) return "not_started";
    
    const statusMap: Record<string, string> = {
      "not started": "not_started",
      "notstarted": "not_started", 
      "not_started": "not_started",
      "pending": "pending",
      "in progress": "pending",
      "inprogress": "pending",
      "approved": "approved",
      "complete": "approved",
      "completed": "approved",
      "passed": "approved",
      "verified": "approved",
      "failed": "failed",
      "rejected": "failed",
      "expired": "expired"
    };
    
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");
    
    // Try to find a matching status
    for (const [key, value] of Object.entries(statusMap)) {
      if (key.replace(/\s+/g, "") === normalizedStatus) {
        return value;
      }
    }
    
    // Default to not_started if no match
    return "not_started";
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "text/csv" ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        validateCsvFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        validateCsvFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  // Validate CSV file using PapaParse
  const validateCsvFile = (file: File) => {
    Papa.parse(file, {
      header: hasHeaders,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const errors: any[] = [];
          const data = results.data as Record<string, string>[];

          // Check if file is empty
          if (data.length === 0) {
            setValidationErrors([
              {
                row: 0,
                message: "CSV file is empty or contains only headers",
              },
            ]);
            return;
          }

          // Get headers from the first row or from results.meta
          const headers = hasHeaders
            ? Object.keys(data[0])
            : [
                "Name",
                "Email",
                "Company",
                "Type",
                "KYC Status",
                "Wallet Address",
              ];

          // Create a function to find a header case-insensitively
          const findHeader = (targetHeader: string): string | undefined => {
            const possibleHeaders = {
              "name": ["name", "investor name", "full name"],
              "email": ["email", "email address"],
              "company": ["company", "company name", "organization", "organisation"],
              "type": ["type", "investor type"],
              "kyc status": ["kyc status", "kyc", "kyc_status", "kycstatus", "verification status"],
              "wallet address": ["wallet address", "wallet", "wallet_address", "walletaddress", "ethereum address"]
            };

            // Try direct case-insensitive match first
            const directMatch = headers.find(h => h.toLowerCase() === targetHeader.toLowerCase());
            if (directMatch) return directMatch;

            // Try alternative forms if direct match fails
            const alternatives = possibleHeaders[targetHeader as keyof typeof possibleHeaders] || [];
            for (const alt of alternatives) {
              const match = headers.find(h => h.toLowerCase() === alt.toLowerCase());
              if (match) return match;
            }

            return undefined;
          };

          // Map expected headers
          const nameHeader = findHeader("name");
          const emailHeader = findHeader("email");

          // Required headers check
          const missingHeaders = [];
          if (!nameHeader) missingHeaders.push("Name");
          if (!emailHeader) missingHeaders.push("Email");

          if (missingHeaders.length > 0) {
            setValidationErrors([
              {
                row: 0,
                message: `Missing required headers: ${missingHeaders.join(", ")}`,
              },
            ]);
            return;
          }

          // Normalize data for processing - convert export format to internal format
          const normalizedData = data.map(row => {
            // Find all possible headers with case-insensitive matching
            const nameHeader = findHeader("name");
            const emailHeader = findHeader("email");
            const companyHeader = findHeader("company");
            const typeHeader = findHeader("type");
            const kycHeader = findHeader("kyc status");
            const walletHeader = findHeader("wallet address");

            // Get values from the appropriate headers
            const name = nameHeader ? row[nameHeader] : "";
            const email = emailHeader ? row[emailHeader] : "";
            const company = companyHeader ? row[companyHeader] : "";
            const type = typeHeader ? row[typeHeader] : "";
            
            // Normalize kyc_status to a valid value
            let rawKycStatus = kycHeader ? row[kycHeader] : "";
            const kyc_status = normalizeKycStatus(rawKycStatus);
            
            const wallet_address = walletHeader ? row[walletHeader] : "";

            // Debug the field mappings
            console.log("Field mapping for row:", {
              headers: {
                nameHeader,
                emailHeader,
                companyHeader,
                typeHeader,
                kycHeader,
                walletHeader,
              },
              values: {
                name,
                email,
                company,
                type,
                rawKycStatus,
                kyc_status,
                wallet_address,
              },
              original: row,
            });

            return {
              name,
              email,
              company,
              type,
              kyc_status,
              wallet_address,
              // Store original row for reference
              _original: row
            };
          });

          // Validate each row with normalized data
          normalizedData.forEach((row, index) => {
            // Validate required fields
            if (!row.name) {
              errors.push({
                row: index + 1,
                message: `Row ${index + 1}: Missing required field 'Name'`,
              });
            }

            if (!row.email) {
              errors.push({
                row: index + 1,
                message: `Row ${index + 1}: Missing required field 'Email'`,
              });
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
              errors.push({
                row: index + 1,
                message: `Row ${index + 1}: Invalid email format '${row.email}'`,
              });
            }

            // Check for wallet address format if provided
            if (
              row.wallet_address &&
              !/^0x[a-fA-F0-9]{40}$/.test(row.wallet_address)
            ) {
              errors.push({
                row: index + 1,
                message: `Row ${index + 1}: Invalid wallet address format '${row.wallet_address}'`,
              });
            }
          });

          // Check for duplicate emails
          const emails = normalizedData.map((row) => row.email?.toLowerCase());
          const uniqueEmails = new Set<string>();
          const duplicateEmails = emails.filter((email) => {
            if (!email) return false;
            if (uniqueEmails.has(email)) return true;
            uniqueEmails.add(email);
            return false;
          });

          if (duplicateEmails.length > 0) {
            duplicateEmails.forEach((email) => {
              if (!email) return;
              const indices = emails
                .map((e, i) => (e === email ? i + 1 : -1))
                .filter((i) => i !== -1);

              errors.push({
                row: indices.join(", "),
                message: `Duplicate email '${email}' found in rows ${indices.join(", ")}`,
              });
            });
          }

          setValidationErrors(errors);
          setParsedData(normalizedData);
        } catch (error) {
          console.error("Error validating CSV:", error);
          setValidationErrors([
            {
              row: 0,
              message: "Failed to validate CSV file. Please check the format.",
            },
          ]);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setValidationErrors([
          {
            row: 0,
            message: `Failed to parse CSV file: ${error.message}`,
          },
        ]);
      },
    });
  };

  // Process upload using batch insert for better performance
  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before uploading",
        variant: "destructive",
      });
      return;
    }

    if (!parsedData.length) {
      toast({
        title: "No data",
        description: "No valid data to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear any previous toast messages
      toast({
        title: "Starting Upload",
        description: `Processing ${parsedData.length} investors...`,
      });
      
      console.log("Starting upload process with parsed data:", parsedData);
      setIsUploading(true);
      setUploadProgress(0);

      // Map investor types from display names to IDs using the investorTypes library
      const { getAllInvestorTypes } = await import("@/lib/investorTypes");
      const allInvestorTypes = getAllInvestorTypes();
      console.log("Available investor types:", allInvestorTypes);
      
      const normalize = (str: string) =>
        str.toLowerCase().replace(/[^a-z0-9]/gi, "");

      const matchTypeId = (input: string): string => {
        const normalizedInput = normalize(input || "");
        console.log(`Matching type: "${input}" (normalized: "${normalizedInput}")`);
        const found = allInvestorTypes.find(t => {
          const idMatch = normalize(t.id) === normalizedInput;
          const nameMatch = normalize(t.name) === normalizedInput;
          return idMatch || nameMatch;
        });
        console.log(`Match result for "${input}":`, found?.id || "hnwi (default)");
        return found?.id || "hnwi";
      };
      
      // Try a completely manual approach to see if that works
      console.log("Trying a direct manual insert approach");
      const processedInvestors = [];
      
      // Process each investor separately
      for (let i = 0; i < parsedData.length; i++) {
        try {
          const investor = parsedData[i];
          const typeId = matchTypeId(investor.type);
          
          // Direct manual insert
          const newInvestor = {
            name: investor.name,
            email: investor.email,
            type: typeId,
            company: investor.company || null,
            wallet_address: investor.wallet_address || null,
            kyc_status: investor.kyc_status || "not_started",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log(`Manual insert attempt for investor ${i+1}/${parsedData.length}:`, newInvestor);
          
          const { data, error } = await supabase
            .from("investors")
            .insert([newInvestor])
            .select();
            
          if (error) {
            console.error(`Error inserting investor ${i+1}:`, error);
            
            // Detailed error inspection
            if (error.code === '23505') { // Unique violation
              console.log(`Investor ${investor.email} already exists, trying update...`);
              
              // Try to get the existing investor
              const { data: existingData, error: fetchError } = await supabase
                .from("investors")
                .select("investor_id, email")
                .eq("email", investor.email)
                .single();
                
              if (fetchError) {
                console.error("Error fetching existing investor:", fetchError);
                continue;
              }
              
              if (existingData) {
                // Update the existing investor
                const { data: updateData, error: updateError } = await supabase
                  .from("investors")
                  .update({
                    name: investor.name,
                    type: typeId,
                    company: investor.company || null,
                    wallet_address: investor.wallet_address || null,
                    kyc_status: investor.kyc_status || "not_started",
                    updated_at: new Date().toISOString()
                  })
                  .eq("investor_id", existingData.investor_id)
                  .select();
                  
                if (updateError) {
                  console.error("Error updating existing investor:", updateError);
                } else {
                  console.log("Successfully updated existing investor:", updateData);
                  if (updateData) processedInvestors.push(...updateData);
                }
              }
            }
          } else {
            console.log(`Successfully inserted investor ${i+1}:`, data);
            if (data) processedInvestors.push(...data);
          }
          
          // Update progress
          setUploadProgress(Math.round(((i + 1) / parsedData.length) * 100));
          
        } catch (err) {
          console.error(`Error processing investor ${i+1}:`, err);
          // Continue with next investor
        }
      }
      
      console.log("Manual processing complete. Processed investors:", processedInvestors);
      
      if (processedInvestors.length === 0) {
        console.warn("No investors were processed successfully");
        toast({
          title: "Warning",
          description: "Upload completed, but no investors were processed",
          variant: "destructive",
        });
        return;
      }
      
      // Map processed investors to the expected format
      const mappedInvestors = processedInvestors.map(investor => ({
        id: investor.investor_id,
        name: investor.name,
        email: investor.email,
        company: investor.company || "",
        type: investor.type,
        kycStatus: investor.kyc_status,
        wallet_address: investor.wallet_address || "",
      }));
      
      // Reset state
      setFile(null);
      setParsedData([]);
      setValidationErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Success message
      toast({
        title: "Upload Successful",
        description: `Processed ${processedInvestors.length} investors`,
        variant: "default",
      });
      
      // Call the callback
      console.log("Calling onUploadComplete with investors:", mappedInvestors);
      onUploadComplete(mappedInvestors);
      
      // Force a refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Error uploading investors:", error);
      toast({
        title: "Upload failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Download sample template using PapaParse
  const downloadTemplate = () => {
    const sampleData = [
      {
        Name: "John Doe",
        Email: "john@example.com",
        Company: "Acme Inc",
        Type: "High-Net-Worth Individuals (HNWIs)",
        "KYC Status": "approved",
        "Wallet Address": "0x1234567890abcdef1234567890abcdef12345678",
      },
      {
        Name: "Jane Smith",
        Email: "jane@example.com",
        Company: "Smith Capital",
        Type: "Institutional Crypto Investors",
        "KYC Status": "pending",
        "Wallet Address": "0x2345678901abcdef2345678901abcdef23456789",
      },
      {
        Name: "Global Ventures",
        Email: "global@example.com",
        Company: "Global Ventures LLC",
        Type: "Private Equity & Venture Capital Firms",
        "KYC Status": "not_started",
        "Wallet Address": "",
      },
      {
        Name: "Michael Johnson",
        Email: "michael@example.com",
        Company: "Johnson Asset Management",
        Type: "Asset Managers & Mutual Funds",
        "KYC Status": "pending",
        "Wallet Address": "",
      },
      {
        Name: "Sarah Williams",
        Email: "sarah@example.com",
        Company: "",
        Type: "High-Net-Worth Individuals (HNWIs)",
        "KYC Status": "not_started",
        "Wallet Address": "",
      },
    ];

    const csvContent = Papa.unparse(sampleData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "investor_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear file
  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Bulk Investor Upload</CardTitle>
        <CardDescription>
          Upload a CSV file containing multiple investor records at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-200"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Drag & Drop CSV File</h3>
                <p className="text-sm text-muted-foreground">
                  or click the button below to browse files
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="hasHeaders"
                  checked={hasHeaders}
                  onCheckedChange={(checked) => {
                    setHasHeaders(!!checked);
                    if (file) validateCsvFile(file);
                  }}
                />
                <Label htmlFor="hasHeaders" className="text-sm">
                  CSV file has header row
                </Label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} investors found
                </p>
              </div>
              {isUploading && (
                <div className="w-full max-w-xs">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    Processing {uploadProgress}%
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={clearFile}
                  disabled={isUploading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear File
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || validationErrors.length > 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Process Investors
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <div className="mt-2 max-h-[200px] overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview data */}
        {parsedData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Preview ({parsedData.length} investors)
            </h3>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Email</th>
                    <th className="px-4 py-2 text-left font-medium">Company</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">
                      KYC Status
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Wallet Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-4 py-2">{row.email}</td>
                      <td className="px-4 py-2">{row.company || ""}</td>
                      <td className="px-4 py-2">{row.type || "hnwi"}</td>
                      <td className="px-4 py-2">
                        {row.kyc_status || "not_started"}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs truncate max-w-[200px]">
                        {row.wallet_address || ""}
                      </td>
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-2 text-center text-muted-foreground"
                      >
                        ... and {parsedData.length - 5} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSV format guide */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">CSV Format Guide</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your CSV file should include the following columns:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>
              <strong>Name</strong> (required): Full name of the investor
            </li>
            <li>
              <strong>Email</strong> (required): Email address
            </li>
            <li>
              <strong>Company</strong> (optional): Company or organization name
            </li>
            <li>
              <strong>Type</strong> (optional): Type of investor (High-Net-Worth Individuals, Institutional Crypto Investors, etc.)
            </li>
            <li>
              <strong>Wallet Address</strong> (optional): Ethereum wallet
              address (must start with 0x)
            </li>
            <li>
              <strong>KYC Status</strong> (optional): KYC status (not_started,
              pending, approved, failed, expired)
            </li>
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || validationErrors.length > 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Investors"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkInvestorUpload;
