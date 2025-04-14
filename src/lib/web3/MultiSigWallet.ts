import * as ethers from "ethers";
import { supabase } from "../supabase";
import { logActivity } from "../activityLogger";
import * as crypto from "crypto";

// Interface for transaction data
export interface MultiSigTransaction {
  id?: string;
  to: string;
  value: string;
  data: string;
  description: string;
  executed: boolean;
  confirmations: number;
  required: number;
  createdAt?: string;
  createdBy?: string;
  txHash?: string;
  chainId?: number;
}

// Interface for confirmation data
export interface Confirmation {
  id?: string;
  transactionId: string;
  signer: string;
  signature?: string;
  confirmed: boolean;
  timestamp?: string;
}

// Interface for database transaction data
interface DbMultiSigTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  description: string;
  executed: boolean;
  confirmations: number;
  required: number;
  created_at?: string;
  created_by?: string;
  tx_hash?: string;
  chain_id?: number;
  hash?: string;
  nonce?: number;
  blockchain?: string;
  destination_wallet_address?: string;
}

// Interface for database confirmation data
interface DbMultiSigConfirmation {
  id?: string;
  transaction_id: string;
  owner: string;
  signer: string;
  signature: string;
  confirmed: boolean;
  timestamp: string;
}

// MultiSig Wallet class to handle wallet operations
export class MultiSigWallet {
  private provider: ethers.providers.Provider | null = null;
  private walletAddress: string | null = null;
  private walletAbi: any;
  private contract: ethers.Contract | null = null;
  private signers: string[] = [];
  private requiredConfirmations: number = 0;
  private userId: string | null = null;
  private userEmail: string | null = null;

  constructor() {
    // Load ABI from a JSON file or define it inline
    this.walletAbi = [
      // Basic MultiSig functions
      "function getOwners() view returns (address[])",
      "function required() view returns (uint256)",
      "function submitTransaction(address to, uint256 value, bytes data, string description) returns (uint256)",
      "function confirmTransaction(uint256 transactionId)",
      "function revokeConfirmation(uint256 transactionId)",
      "function executeTransaction(uint256 transactionId)",
      "function getTransactionCount(bool pending, bool executed) view returns (uint256)",
      "function getTransaction(uint256 transactionId) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)",
      "function getConfirmationCount(uint256 transactionId) view returns (uint256)",
      "function getTransactionIds(uint256 from, uint256 to, bool pending, bool executed) view returns (uint256[])",
      // Events
      "event Submission(uint256 indexed transactionId)",
      "event Confirmation(address indexed sender, uint256 indexed transactionId)",
      "event Revocation(address indexed sender, uint256 indexed transactionId)",
      "event Execution(uint256 indexed transactionId)",
      "event ExecutionFailure(uint256 indexed transactionId)",
    ];
  }

  // Initialize the wallet with provider and contract address
  async initialize(
    providerUrl: string,
    walletAddress: string,
    userId?: string,
    userEmail?: string,
  ): Promise<boolean> {
    try {
      // Set user info for logging
      this.userId = userId || null;
      this.userEmail = userEmail || null;

      // Connect to provider
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
      this.walletAddress = walletAddress;

      // Create contract instance
      this.contract = new ethers.Contract(
        walletAddress,
        this.walletAbi,
        this.provider,
      );

      // Get wallet configuration
      this.signers = await this.contract.getOwners();
      this.requiredConfirmations = await this.contract.required();

      // Log successful initialization
      await this.logWalletAction("wallet_initialized", {
        walletAddress,
        signers: this.signers,
        requiredConfirmations: this.requiredConfirmations,
      });

      return true;
    } catch (error: any) {
      console.error("Failed to initialize MultiSig wallet:", error);
      await this.logWalletAction("wallet_initialization_failed", {
        error: error.message,
      });
      return false;
    }
  }

  // Get wallet information
  async getWalletInfo(): Promise<{
    address: string;
    signers: string[];
    required: number;
    network: string;
    chainId: number;
  } | null> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      const network = await this.provider.getNetwork();

      return {
        address: this.walletAddress,
        signers: this.signers,
        required: this.requiredConfirmations,
        network: network.name,
        chainId: network.chainId,
      };
    } catch (error) {
      console.error("Failed to get wallet info:", error);
      return null;
    }
  }

  // Submit a new transaction to the wallet
  async submitTransaction(
    to: string,
    value: string,
    data: string,
    description: string,
    signer: ethers.Wallet,
  ): Promise<string | null> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Connect contract with signer
      const contractWithSigner = this.contract.connect(signer);

      // Convert value to wei
      const valueInWei = ethers.utils.parseEther(value);

      // Submit transaction
      const tx = await contractWithSigner.submitTransaction(
        to,
        valueInWei,
        data,
        description,
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Get transaction ID from events
      const event = receipt.events.find((e) => e.event === "Submission");
      const transactionId = event.args.transactionId.toString();

      // Store transaction in database
      await this.storeTransaction({
        id: transactionId,
        to,
        value,
        data,
        description,
        executed: false,
        confirmations: 1, // Creator automatically confirms
        required: this.requiredConfirmations,
        createdBy: signer.address,
        txHash: receipt.transactionHash,
        chainId: (await this.provider.getNetwork()).chainId,
      });

      // Log action
      await this.logWalletAction("transaction_submitted", {
        transactionId,
        to,
        value,
        description,
        txHash: receipt.transactionHash,
      });

      return transactionId;
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      await this.logWalletAction("transaction_submission_failed", {
        error: error.message,
      });
      return null;
    }
  }

  // Confirm a pending transaction
  async confirmTransaction(
    transactionId: string,
    signer: ethers.Wallet,
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Connect contract with signer
      const contractWithSigner = this.contract.connect(signer);

      // Confirm transaction
      const tx = await contractWithSigner.confirmTransaction(transactionId);
      const receipt = await tx.wait();

      // Update confirmation in database
      await this.storeConfirmation({
        transactionId,
        signer: signer.address,
        signature: receipt.transactionHash,
        confirmed: true,
        timestamp: new Date().toISOString(),
      });

      // Update transaction confirmations count
      await this.updateTransactionConfirmations(transactionId);

      // Log action
      await this.logWalletAction("transaction_confirmed", {
        transactionId,
        signer: signer.address,
        txHash: receipt.transactionHash,
      });

      return true;
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
      await this.logWalletAction("transaction_confirmation_failed", {
        transactionId,
        signer: signer.address,
        error: error.message,
      });
      return false;
    }
  }

  // Execute a transaction that has enough confirmations
  async executeTransaction(
    transactionId: string,
    signer: ethers.Wallet,
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Connect contract with signer
      const contractWithSigner = this.contract.connect(signer);

      // Execute transaction
      const tx = await contractWithSigner.executeTransaction(transactionId);
      const receipt = await tx.wait();

      // Check if execution was successful
      const executionEvent = receipt.events.find(
        (e) => e.event === "Execution",
      );
      const executionFailureEvent = receipt.events.find(
        (e) => e.event === "ExecutionFailure",
      );

      const success = !!executionEvent && !executionFailureEvent;

      // Update transaction status in database
      if (success) {
        await this.updateTransactionStatus(transactionId, true);
      }

      // Log action
      await this.logWalletAction(
        success ? "transaction_executed" : "transaction_execution_failed",
        {
          transactionId,
          executor: signer.address,
          txHash: receipt.transactionHash,
          success,
        },
      );

      return success;
    } catch (error) {
      console.error("Failed to execute transaction:", error);
      await this.logWalletAction("transaction_execution_failed", {
        transactionId,
        error: error.message,
      });
      return false;
    }
  }

  // Revoke a confirmation
  async revokeConfirmation(
    transactionId: string,
    signer: ethers.Wallet,
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Connect contract with signer
      const contractWithSigner = this.contract.connect(signer);

      // Revoke confirmation
      const tx = await contractWithSigner.revokeConfirmation(transactionId);
      const receipt = await tx.wait();

      // Update confirmation in database
      await this.updateConfirmation(transactionId, signer.address, false);

      // Update transaction confirmations count
      await this.updateTransactionConfirmations(transactionId);

      // Log action
      await this.logWalletAction("confirmation_revoked", {
        transactionId,
        signer: signer.address,
        txHash: receipt.transactionHash,
      });

      return true;
    } catch (error) {
      console.error("Failed to revoke confirmation:", error);
      await this.logWalletAction("confirmation_revocation_failed", {
        transactionId,
        signer: signer.address,
        error: error.message,
      });
      return false;
    }
  }

  // Get all pending transactions
  async getPendingTransactions(): Promise<MultiSigTransaction[]> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Get pending transactions from database
      const { data, error } = await supabase
        .from("multi_sig_transactions")
        .select("*")
        .eq("executed", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      return (data as DbMultiSigTransaction[]).map((tx) => ({
        id: tx.id,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        description: tx.description,
        executed: tx.executed,
        confirmations: tx.confirmations,
        required: tx.required,
        createdAt: tx.created_at,
        createdBy: tx.created_by,
        txHash: tx.tx_hash,
        chainId: tx.chain_id,
      }));
    } catch (error) {
      console.error("Failed to get pending transactions:", error);
      return [];
    }
  }

  // Get all executed transactions
  async getExecutedTransactions(): Promise<MultiSigTransaction[]> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Get executed transactions from database
      const { data, error } = await supabase
        .from("multi_sig_transactions")
        .select("*")
        .eq("executed", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      return (data as DbMultiSigTransaction[]).map((tx) => ({
        id: tx.id,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        description: tx.description,
        executed: tx.executed,
        confirmations: tx.confirmations,
        required: tx.required,
        createdAt: tx.created_at,
        createdBy: tx.created_by,
        txHash: tx.tx_hash,
        chainId: tx.chain_id,
      }));
    } catch (error) {
      console.error("Failed to get executed transactions:", error);
      return [];
    }
  }

  // Get transaction details
  async getTransaction(
    transactionId: string,
  ): Promise<MultiSigTransaction | null> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Get transaction from database
      const { data, error } = await supabase
        .from("multi_sig_transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const tx = data as DbMultiSigTransaction;

      // Transform data to match our interface
      return {
        id: tx.id,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        description: tx.description,
        executed: tx.executed,
        confirmations: tx.confirmations,
        required: tx.required,
        createdAt: tx.created_at,
        createdBy: tx.created_by,
        txHash: tx.tx_hash,
        chainId: tx.chain_id,
      };
    } catch (error) {
      console.error(`Failed to get transaction ${transactionId}:`, error);
      return null;
    }
  }

  // Get confirmations for a transaction
  async getConfirmations(transactionId: string): Promise<Confirmation[]> {
    try {
      if (!this.contract || !this.provider) {
        throw new Error("Wallet not initialized");
      }

      // Get confirmations from database
      const { data, error } = await supabase
        .from("multi_sig_confirmations")
        .select("*")
        .eq("transaction_id", transactionId)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      return (data as DbMultiSigConfirmation[]).map((conf) => ({
        id: conf.id,
        transactionId: conf.transaction_id,
        signer: conf.signer,
        signature: conf.signature,
        confirmed: conf.confirmed,
        timestamp: conf.timestamp,
      }));
    } catch (error) {
      console.error(
        `Failed to get confirmations for transaction ${transactionId}:`,
        error,
      );
      return [];
    }
  }

  // Store a transaction in the database
  private async storeTransaction(
    transaction: MultiSigTransaction,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("multi_sig_transactions").insert({
        id: transaction.id,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data || "",
        description: transaction.description,
        executed: transaction.executed,
        confirmations: transaction.confirmations,
        required: transaction.required,
        hash: transaction.txHash || "",
        nonce: 0,
        blockchain: "ethereum",
        destination_wallet_address: transaction.to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to store transaction:", error);
      throw error;
    }
  }

  // Store a confirmation in the database
  private async storeConfirmation(confirmation: Confirmation): Promise<void> {
    try {
      const { error } = await supabase.from("multi_sig_confirmations").insert({
        id: crypto.randomUUID(),
        transaction_id: confirmation.transactionId,
        owner: confirmation.signer,
        signer: confirmation.signer,
        signature: confirmation.signature || "",
        confirmed: confirmation.confirmed,
        timestamp: confirmation.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to store confirmation:", error);
      throw error;
    }
  }

  // Update a confirmation in the database
  private async updateConfirmation(
    transactionId: string,
    signer: string,
    confirmed: boolean,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("multi_sig_confirmations")
        .update({
          confirmed,
          timestamp: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId)
        .eq("signer", signer);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update confirmation:", error);
      throw error;
    }
  }

  // Update transaction status in the database
  private async updateTransactionStatus(
    transactionId: string,
    executed: boolean,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("multi_sig_transactions")
        .update({
          executed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update transaction status:", error);
      throw error;
    }
  }

  // Update transaction confirmations count in the database
  private async updateTransactionConfirmations(
    transactionId: string,
  ): Promise<void> {
    try {
      // Get current confirmation count from contract
      const confirmationCount =
        await this.contract.getConfirmationCount(transactionId);

      // Update in database
      const { error } = await supabase
        .from("multi_sig_transactions")
        .update({
          confirmations: confirmationCount.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update transaction confirmations:", error);
      throw error;
    }
  }

  // Log wallet actions to activity logger
  private async logWalletAction(action: string, details: any): Promise<void> {
    try {
      if (!this.userId) return;

      await logActivity({
        action: `wallet_${action}`,
        entity_type: "multisig",
        entity_id: this.walletAddress || details.transactionId || "unknown",
        details: {
          ...details,
          user_id: this.userId,
          user_email: this.userEmail
        },
        status: details.status || "success",
      });
    } catch (error) {
      console.error("Failed to log wallet action:", error);
    }
  }
}

// Create and export a singleton instance
export const multiSigWallet = new MultiSigWallet();
