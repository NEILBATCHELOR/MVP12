import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RedemptionRequest } from "@/lib/api/approvalApi";
import {
  redemptionRequestToCsv,
  redemptionRequestsToCsv,
  downloadCsv,
  redemptionRequestToPdf,
} from "@/utils/exportUtils";

interface ExportButtonProps {
  request?: RedemptionRequest;
  requests?: RedemptionRequest[];
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ExportButton = ({
  request,
  requests,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      if (request) {
        // Export single request
        const csv = redemptionRequestToCsv(request);
        downloadCsv(csv, `redemption-${request.id}.csv`);
      } else if (requests && requests.length > 0) {
        // Export multiple requests
        const csv = redemptionRequestsToCsv(requests);
        downloadCsv(
          csv,
          `redemption-requests-${new Date().toISOString().split("T")[0]}.csv`,
        );
      }
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      if (request) {
        // Export single request
        redemptionRequestToPdf(request);
      } else if (requests && requests.length > 0) {
        // In a real implementation, this would generate a PDF with all requests
        // For now, we'll just use the CSV export as a placeholder
        const csv = redemptionRequestsToCsv(requests);
        downloadCsv(
          csv,
          `redemption-requests-${new Date().toISOString().split("T")[0]}.csv`,
        );
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
