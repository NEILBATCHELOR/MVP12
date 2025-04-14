import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// Define the missing types locally
interface SubscriptionInsert {
  id?: string;
  project_id: string | null;
  investor_id: string;
  subscription_id: string;
  currency: string;
  fiat_amount: number;
  subscription_date: string;
  confirmed: boolean;
  allocated: boolean;
  distributed: boolean;
  notes?: string | null;
}

interface SubscriptionTable {
  id: string;
  project_id: string | null;
  investor_id: string;
  subscription_id: string;
  currency: string;
  fiat_amount: number;
  subscription_date: string;
  confirmed: boolean;
  allocated: boolean;
  distributed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Define the SubscriptionUI interface if needed by other modules
export interface SubscriptionUI {
  id: string;
  projectId?: string;
  investorId: string;
  currency: string;
  fiatAmount: number;
  subscriptionDate: string;
  confirmed: boolean;
  allocated: boolean;
  distributed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Types matching the SQL schema
export interface Subscription {
  id: string;
  project_id: string | null;
  investor_id: string;
  subscription_id: string;
  currency: string;
  fiat_amount: number;
  subscription_date: string;
  confirmed: boolean;
  allocated: boolean;
  allocation_confirmed?: boolean; // Not in SQL, keeping for backward compatibility
  distributed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Other interfaces
export interface SubscriptionWithInvestor extends Subscription {
  investor: {
    name: string;
    email: string;
    wallet_address?: string | null;
    type: string;
    kyc_status: string;
  };
}

export interface Invoice {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  issued_date: string;
  paid: boolean;
  payment_date?: string;
  due_date: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
}

// Just implement the exported createSubscriptionV2 function as a stub 
// to satisfy the imported type reference
export async function createSubscriptionV2(subscription: SubscriptionInsert): Promise<Subscription> {
  // Stub implementation
  return {
    ...subscription,
    id: subscription.id || uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Subscription;
}

// Stub for updateSubscriptionV2
export async function updateSubscriptionV2(id: string, updates: Partial<SubscriptionTable>): Promise<Subscription> {
  // Stub implementation
  return {
    id,
    ...updates,
    investor_id: updates.investor_id || 'dummy',
    subscription_id: updates.subscription_id || 'dummy',
    currency: updates.currency || 'USD',
    fiat_amount: updates.fiat_amount || 0,
    subscription_date: updates.subscription_date || new Date().toISOString(),
    confirmed: updates.confirmed || false,
    allocated: updates.allocated || false,
    distributed: updates.distributed || false,
    project_id: updates.project_id || null,
    notes: updates.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Stub implementation for getSubscription
export async function getSubscription(id: string): Promise<Subscription | null> {
  // Stub implementation
  return {
    id,
    investor_id: 'dummy',
    subscription_id: 'dummy',
    currency: 'USD',
    fiat_amount: 0,
    subscription_date: new Date().toISOString(),
    confirmed: false,
    allocated: false,
    distributed: false,
    project_id: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Stub for convertToSubscriptionUI
export function convertToSubscriptionUI(subscription: Subscription): SubscriptionUI {
  // Stub implementation
  return {
    id: subscription.id,
    projectId: subscription.project_id || undefined,
    investorId: subscription.investor_id,
    currency: subscription.currency,
    fiatAmount: subscription.fiat_amount,
    subscriptionDate: subscription.subscription_date,
    confirmed: subscription.confirmed,
    allocated: subscription.allocated,
    distributed: subscription.distributed,
    notes: subscription.notes || undefined,
    createdAt: subscription.created_at,
    updatedAt: subscription.updated_at
  };
}

// Stub for listProjectSubscriptions
export async function listProjectSubscriptions(projectId: string): Promise<Subscription[]> {
  // Stub implementation
  return [];
}

// Stub for listInvestorSubscriptions
export async function listInvestorSubscriptions(investorId: string): Promise<Subscription[]> {
  // Stub implementation
  return [];
}

// Implementation for getProjectSubscriptions with actual Supabase query
export const getProjectSubscriptions = async (
  projectId: string,
): Promise<SubscriptionWithInvestor[]> => {
  try {
    console.log("Fetching subscriptions for project:", projectId);
    
    // First, get all investors 
    const { data: investors, error: investorsError } = await supabase
      .from("investors")
      .select("*");

    if (investorsError) {
      console.error("Error fetching investors:", investorsError);
      return [];
    }

    // Create a map of investor IDs to investor data
    const investorsMap = new Map();
    if (investors) {
      investors.forEach(investor => {
        // The investor object structure might vary; use investor_id which is more reliable
        const investorId = investor.investor_id;
        if (investorId) {
          investorsMap.set(investorId, investor);
        }
      });
    }

    // Now fetch the subscriptions for this project
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("project_id", projectId);

    if (subscriptionsError) {
      console.error(`Error fetching subscriptions for project ${projectId}:`, subscriptionsError);
      return [];
    }

    console.log("Fetched subscriptions:", subscriptions?.length || 0);

    // Map the subscriptions to include investor data
    return (subscriptions || []).map(subscription => {
      const investor = investorsMap.get(subscription.investor_id);
      
      if (!investor) {
        console.warn(`No investor found for subscription ${subscription.id} with investor_id ${subscription.investor_id}`);
        // Provide default investor data
        return {
          ...subscription,
          investor: {
            name: "Unknown Investor",
            email: "unknown@example.com",
            type: "individual",
            kyc_status: "unknown"
          }
        };
      }
      
      // Handle different naming conventions in the investor object
      const name = investor.name || 
                  (investor.first_name && investor.last_name ? 
                   `${investor.first_name} ${investor.last_name}` : 
                   "Unknown Investor");
      
      return {
        ...subscription,
        investor: {
          name,
          email: investor.email || "",
          wallet_address: investor.wallet_address || null,
          type: investor.type || "individual",
          kyc_status: investor.kyc_status || "unknown"
        }
      };
    });
  } catch (error) {
    console.error("Error in getProjectSubscriptions:", error);
    return [];
  }
};

export const getSubscriptionsByProjectId = async (projectId: string) => {
  // Stub implementation
  return [];
};

export const createSubscriptionLegacy = async (
  subscriptionData: Omit<Subscription, "id" | "created_at" | "updated_at"> & {
    investor_name?: string;
    investor_email?: string;
  },
): Promise<Subscription> => {
  // Stub implementation
  return {
    id: uuidv4(),
    ...subscriptionData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const updateSubscriptionLegacy = async (
  id: string,
  updates: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>,
): Promise<Subscription> => {
  // Stub implementation
  return {
    id,
    investor_id: 'dummy',
    subscription_id: 'dummy',
    currency: 'USD',
    fiat_amount: 0,
    subscription_date: new Date().toISOString(),
    confirmed: false,
    allocated: false,
    distributed: false,
    project_id: null,
    notes: null,
    ...updates,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const deleteSubscription = async (id: string): Promise<void> => {
  // Stub implementation
  console.log(`Deleting subscription: ${id}`);
};

export const confirmSubscriptions = async (
  ids: string[],
  projectId: string,
): Promise<void> => {
  // Stub implementation
  console.log(`Confirming subscriptions: ${ids.join(', ')} for project: ${projectId}`);
};

export const getSubscriptionStats = async (projectId: string) => {
  // Stub implementation
  return {
    totalSubscriptions: 0,
    confirmedSubscriptions: 0,
    totalAmount: 0,
    confirmedAmount: 0,
    currency: 'USD'
  };
};

export const getInvoice = async (
  subscriptionId: string,
): Promise<Invoice[]> => {
  // Stub implementation
  return [];
};

export const generateInvoice = async (
  subscriptionId: string,
): Promise<Invoice> => {
  // Stub implementation
  return {
    id: uuidv4(),
    subscription_id: subscriptionId,
    amount: 0,
    currency: 'USD',
    issued_date: new Date().toISOString(),
    paid: false,
    due_date: new Date().toISOString(),
    invoice_number: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const processPayment = async (
  invoiceId: string,
  paymentDetails: {
    amount: number;
    paymentMethod: string;
    paymentDate?: string;
    transactionId?: string;
    notes?: string;
  },
): Promise<Invoice> => {
  // Stub implementation
  return {
    id: invoiceId,
    subscription_id: 'dummy',
    amount: paymentDetails.amount,
    currency: 'USD',
    issued_date: new Date().toISOString(),
    paid: true,
    payment_date: paymentDetails.paymentDate || new Date().toISOString(),
    due_date: new Date().toISOString(),
    invoice_number: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}; 