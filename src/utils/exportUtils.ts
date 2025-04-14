import { RedemptionRequest } from "../lib/api/approvalApi";

/**
 * Converts a redemption request to CSV format
 * @param request The redemption request to convert
 * @returns CSV string
 */
export const redemptionRequestToCsv = (request: RedemptionRequest): string => {
  // Define CSV headers
  const headers = [
    "ID",
    "Request Date",
    "Token Amount",
    "Token Type",
    "Redemption Type",
    "Status",
    "Source Wallet",
    "Destination Wallet",
    "Conversion Rate",
    "Investor Name",
    "Investor ID",
    "Required Approvals",
    "Current Approvals",
  ];

  // Format the data
  const data = [
    request.id,
    new Date(request.requestDate).toLocaleString(),
    request.tokenAmount.toString(),
    request.tokenType,
    request.redemptionType,
    request.status,
    request.sourceWalletAddress,
    request.destinationWalletAddress,
    request.conversionRate.toString(),
    request.investorName || "",
    request.investorId || "",
    request.requiredApprovals.toString(),
    request.approvers.filter((a) => a.approved).length.toString(),
  ];

  // Combine headers and data
  return [headers.join(","), data.join(",")].join("\n");
};

/**
 * Converts multiple redemption requests to CSV format
 * @param requests The redemption requests to convert
 * @returns CSV string
 */
export const redemptionRequestsToCsv = (
  requests: RedemptionRequest[],
): string => {
  if (requests.length === 0) return "";

  // Define CSV headers
  const headers = [
    "ID",
    "Request Date",
    "Token Amount",
    "Token Type",
    "Redemption Type",
    "Status",
    "Source Wallet",
    "Destination Wallet",
    "Conversion Rate",
    "Investor Name",
    "Investor ID",
    "Required Approvals",
    "Current Approvals",
  ];

  // Format the data for each request
  const rows = requests.map((request) =>
    [
      request.id,
      new Date(request.requestDate).toLocaleString(),
      request.tokenAmount.toString(),
      request.tokenType,
      request.redemptionType,
      request.status,
      request.sourceWalletAddress,
      request.destinationWalletAddress,
      request.conversionRate.toString(),
      request.investorName || "",
      request.investorId || "",
      request.requiredApprovals.toString(),
      request.approvers.filter((a) => a.approved).length.toString(),
    ].join(","),
  );

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
};

/**
 * Downloads data as a CSV file
 * @param data The data to download
 * @param filename The name of the file
 */
export const downloadCsv = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a PDF representation of a redemption request
 * This is a placeholder function that would use a PDF library in a real implementation
 * @param request The redemption request to convert
 * @returns void - in a real implementation this would return a PDF blob or trigger a download
 */
export const redemptionRequestToPdf = (request: RedemptionRequest): void => {
  // In a real implementation, this would use a library like jsPDF or pdfmake
  // For now, we'll just convert to CSV and download that
  const csv = redemptionRequestToCsv(request);
  downloadCsv(csv, `redemption-${request.id}.csv`);

  // Example of what this might look like with a PDF library:
  /*
  import { jsPDF } from "jspdf";
  import "jspdf-autotable";

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Redemption Request: ${request.id}`, 14, 22);
  
  // Add request details
  doc.setFontSize(12);
  doc.text(`Status: ${request.status}`, 14, 30);
  doc.text(`Request Date: ${new Date(request.requestDate).toLocaleString()}`, 14, 38);
  
  // Add table with details
  doc.autoTable({
    startY: 45,
    head: [['Property', 'Value']],
    body: [
      ['Token Amount', request.tokenAmount.toString()],
      ['Token Type', request.tokenType],
      ['Redemption Type', request.redemptionType],
      ['Source Wallet', request.sourceWalletAddress],
      ['Destination Wallet', request.destinationWalletAddress],
      ['Conversion Rate', request.conversionRate.toString()],
      ['Investor Name', request.investorName || ''],
      ['Investor ID', request.investorId || ''],
    ],
  });
  
  // Add approvers section
  const approvedCount = request.approvers.filter(a => a.approved).length;
  doc.text(`Approvals: ${approvedCount} of ${request.requiredApprovals}`, 14, doc.autoTable.previous.finalY + 10);
  
  // Save the PDF
  doc.save(`redemption-${request.id}.pdf`);
  */
};
