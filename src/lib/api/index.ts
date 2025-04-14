// Export all API functions from a central location
export * from "./approvalApi";
export * from "./transactionHistoryApi";
export * from "./policyApi";

// Common API response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Common API error handling
export const handleApiError = (error: any): ApiResponse<never> => {
  console.error("API Error:", error);
  return {
    error: error.message || "An unexpected error occurred",
    status: error.status || 500,
  };
};
