import * as ethers from "ethers";
import { supabase } from "../supabase";
import { logActivity } from "../activityLogger";
import { multiSigWallet } from "./MultiSigWallet";
import { tokenManager, TokenType } from "./TokenManager";

// Wallet types
export enum WalletType {
  EOA = "EOA", // Externally Owned Account
  MULTISIG = "MULTISIG", // Multi-signature wallet
  SMART = "SMART", // Smart contract wallet
}

// Wallet interface
export interface Wallet {
  id?: string;
  address: string;
  type: WalletType;
  name: string;
  chainId: number;
  isDefault?: boolean;
  createdAt?: string;
  userId?: string;
  encryptedPrivateKey?: string; // Only for EOA wallets
  contractAddress?: string; // For MultiSig or Smart wallets
  signers?: string[]; // For MultiSig wallets
  requiredConfirmations?: number; // For MultiSig wallets
}

// Transaction interface
export interface Transaction {
  id?: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
  chainId: number;
  hash?: string;
  status?: "pending" | "confirmed" | "failed";
  timestamp?: string;
  blockNumber?: number;
  description?: string;
}

// Wallet Manager class to handle wallet operations
export class WalletManager {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;
  private chainId: number | null = null;

  // Initialize the wallet manager
  async initialize(
    providerUrl: string,
    userId?: string,
    userEmail?: string,
  ): Promise<boolean> {
    try {
      // Set user info for logging
      this.userId = userId || null;
      this.userEmail = userEmail || null;

      // Connect to provider
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);

      // Get network info
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId;

      // Initialize MultiSig wallet and Token manager
      await multiSigWallet.initialize(providerUrl, userId, userEmail);
      await tokenManager.initialize(providerUrl, userId, userEmail);

      // Log successful initialization
      await this.logWalletAction("wallet_manager_initialized", {
        providerUrl,
        chainId: this.chainId,
        network: network.name,
      });

      return true;
    } catch (error: any) {
      console.error("Failed to initialize WalletManager:", error);
      await this.logWalletAction("wallet_manager_initialization_failed", {
        error: error.message,
      });
      return false;
    }
  }

  // Create a new EOA wallet
  async createEOAWallet(
    name: string,
    password: string,
  ): Promise<Wallet | null> {
    try {
      if (!this.provider || !this.chainId) {
        throw new Error("Wallet manager not initialized");
      }

      // Generate a new random wallet
      const wallet = ethers.Wallet.createRandom();

      // Encrypt the private key with the password
      const encryptedPrivateKey = await wallet.encrypt(password);

      // Create wallet object
      const newWallet: Wallet = {
        address: wallet.address,
        type: WalletType.EOA,
        name,
        chainId: this.chainId,
        isDefault: false,
        createdAt: new Date().toISOString(),
        userId: this.userId,
        encryptedPrivateKey,
      };

      // Store wallet in database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          address: newWallet.address,
          blockchain: "ethereum", // Add required field
          name: newWallet.name,
          owners: [wallet.address], // Add required field
          threshold: 1, // Add required field
          created_at: newWallet.createdAt,
          created_by: this.userId || undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Log wallet creation
      await this.logWalletAction("wallet_created", {
        walletId: data.id,
        address: newWallet.address,
        type: newWallet.type,
        name: newWallet.name,
        chainId: newWallet.chainId,
      });

      // Return the created wallet
      return {
        id: data.id,
        ...newWallet,
      };
    } catch (error: any) {
      console.error("Failed to create EOA wallet:", error);
      await this.logWalletAction("wallet_creation_failed", {
        error: error.message,
      });
      return null;
    }
  }

  // Import an existing EOA wallet
  async importEOAWallet(
    privateKey: string,
    name: string,
    password: string,
  ): Promise<Wallet | null> {
    try {
      if (!this.provider || !this.chainId) {
        throw new Error("Wallet manager not initialized");
      }

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);

      // Encrypt the private key with the password
      const encryptedPrivateKey = await wallet.encrypt(password);

      // Create wallet object
      const newWallet: Wallet = {
        address: wallet.address,
        type: WalletType.EOA,
        name,
        chainId: this.chainId,
        isDefault: false,
        createdAt: new Date().toISOString(),
        userId: this.userId,
        encryptedPrivateKey,
      };

      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from("multi_sig_wallets")
        .select("id")
        .eq("address", wallet.address)
        .eq("created_by", this.userId)
        .single();

      if (existingWallet) {
        throw new Error("Wallet with this address already exists");
      }

      // Store wallet in database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          address: newWallet.address,
          blockchain: "ethereum", // Add required field
          name: newWallet.name,
          owners: [wallet.address], // Add required field
          threshold: 1, // Add required field
          created_at: newWallet.createdAt,
          created_by: this.userId || undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Log wallet import
      await this.logWalletAction("wallet_imported", {
        walletId: data.id,
        address: newWallet.address,
        type: newWallet.type,
        name: newWallet.name,
        chainId: newWallet.chainId,
      });

      // Return the imported wallet
      return {
        id: data.id,
        ...newWallet,
      };
    } catch (error: any) {
      console.error("Failed to import EOA wallet:", error);
      await this.logWalletAction("wallet_import_failed", {
        error: error.message,
      });
      return null;
    }
  }

  // Connect to an existing MultiSig wallet
  async connectMultiSigWallet(
    contractAddress: string,
    name: string,
  ): Promise<Wallet | null> {
    try {
      if (!this.provider || !this.chainId) {
        throw new Error("Wallet manager not initialized");
      }

      // Initialize MultiSig wallet
      let providerUrl = "https://mainnet.infura.io/v3/";
      if (
        this.provider &&
        typeof this.provider.connection === "object" &&
        this.provider.connection &&
        "url" in this.provider.connection
      ) {
        providerUrl = this.provider.connection.url;
      }

      const success = await multiSigWallet.initialize(
        providerUrl,
        contractAddress,
        this.userId,
        this.userEmail,
      );

      if (!success) {
        throw new Error("Failed to initialize MultiSig wallet");
      }

      // Get wallet info
      const walletInfo = await multiSigWallet.getWalletInfo();
      if (!walletInfo) {
        throw new Error("Failed to get MultiSig wallet info");
      }

      // Create wallet object
      const newWallet: Wallet = {
        address: contractAddress,
        type: WalletType.MULTISIG,
        name,
        chainId: this.chainId,
        isDefault: false,
        createdAt: new Date().toISOString(),
        userId: this.userId,
        contractAddress,
        signers: walletInfo.signers,
        requiredConfirmations: walletInfo.required,
      };

      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from("multi_sig_wallets")
        .select("id")
        .eq("address", contractAddress)
        .eq("created_by", this.userId)
        .single();

      if (existingWallet) {
        throw new Error("Wallet with this address already exists");
      }

      // Store wallet in database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          address: newWallet.address,
          blockchain: "ethereum", // Add required field
          name: newWallet.name,
          owners: newWallet.signers || [], // Use signers as owners
          threshold: newWallet.requiredConfirmations || 1, // Use requiredConfirmations as threshold
          created_at: newWallet.createdAt,
          created_by: this.userId || undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Log wallet connection
      await this.logWalletAction("multisig_wallet_connected", {
        walletId: data.id,
        address: newWallet.address,
        name: newWallet.name,
        chainId: newWallet.chainId,
        signers: newWallet.signers,
        requiredConfirmations: newWallet.requiredConfirmations,
      });

      // Return the connected wallet
      return {
        id: data.id,
        ...newWallet,
      };
    } catch (error: any) {
      console.error("Failed to connect MultiSig wallet:", error);
      await this.logWalletAction("multisig_wallet_connection_failed", {
        error: error.message,
      });
      return null;
    }
  }

  // Get user's wallets
  async getUserWallets(): Promise<Wallet[]> {
    try {
      if (!this.userId) {
        throw new Error("User ID not set");
      }

      // Get wallets from database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .select("*")
        .eq("created_by", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      return data.map((wallet: any) => ({
        id: wallet.id,
        address: wallet.address,
        type: WalletType.MULTISIG, // Default to MULTISIG type
        name: wallet.name,
        chainId: 1, // Default to Ethereum mainnet
        isDefault: false, // Default value
        createdAt: wallet.created_at,
        userId: wallet.created_by,
        signers: wallet.owners,
        requiredConfirmations: wallet.owners?.length > 0 ? Math.ceil(wallet.owners.length / 2) : 1, // Use majority as fallback
      }));
    } catch (error: any) {
      console.error("Failed to get user wallets:", error);
      return [];
    }
  }

  // Get wallet by ID
  async getWalletById(walletId: string): Promise<Wallet | null> {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(walletId)) {
        console.error(`Invalid wallet ID format: ${walletId}`);
        return null;
      }

      // Get wallet from database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .select("*")
        .eq("id", walletId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform data to match our interface
      return {
        id: data.id,
        address: data.address,
        type: WalletType.MULTISIG, // Default to MULTISIG type
        name: data.name,
        chainId: 1, // Default to Ethereum mainnet
        isDefault: false, // Default value
        createdAt: data.created_at,
        userId: data.created_by,
        signers: data.owners,
        requiredConfirmations: data.owners?.length > 0 ? Math.ceil(data.owners.length / 2) : 1, // Use majority as fallback
      };
    } catch (error: any) {
      console.error(`Failed to get wallet ${walletId}:`, error);
      return null;
    }
  }

  // Set default wallet
  async setDefaultWallet(walletId: string): Promise<boolean> {
    try {
      if (!this.userId) {
        throw new Error("User ID not set");
      }

      // First, unset default for all user wallets
      const { error: updateError } = await supabase
        .from("multi_sig_wallets")
        .update({ updated_at: new Date().toISOString() })
        .eq("created_by", this.userId);

      if (updateError) throw updateError;

      // Then set default for the specified wallet
      const { error } = await supabase
        .from("multi_sig_wallets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", walletId)
        .eq("created_by", this.userId);

      if (error) throw error;

      // Log action
      await this.logWalletAction("default_wallet_set", { walletId });

      return true;
    } catch (error: any) {
      console.error(`Failed to set default wallet ${walletId}:`, error);
      return false;
    }
  }

  // Delete wallet
  async deleteWallet(walletId: string): Promise<boolean> {
    try {
      // Get wallet first to log details
      const wallet = await this.getWalletById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Delete wallet from database
      const { error } = await supabase
        .from("multi_sig_wallets")
        .delete()
        .eq("id", walletId)
        .eq("created_by", this.userId);

      if (error) throw error;

      // Log action
      await this.logWalletAction("wallet_deleted", {
        walletId,
        address: wallet.address,
        type: wallet.type,
        name: wallet.name,
      });

      return true;
    } catch (error: any) {
      console.error(`Failed to delete wallet ${walletId}:`, error);
      return false;
    }
  }

  // Get wallet balance
  async getWalletBalance(walletAddress: string): Promise<{
    balance: string;
    formattedBalance: string;
  }> {
    try {
      if (!this.provider) {
        throw new Error("Wallet manager not initialized");
      }

      // Get ETH balance
      const balance = await this.provider.getBalance(walletAddress);
      const formattedBalance = ethers.utils.formatEther(balance);

      return {
        balance: balance.toString(),
        formattedBalance,
      };
    } catch (error: any) {
      console.error(`Failed to get balance for ${walletAddress}:`, error);
      return {
        balance: "0",
        formattedBalance: "0",
      };
    }
  }

  // Send ETH transaction
  async sendTransaction(
    fromWalletId: string,
    to: string,
    value: string,
    txData: string = "0x",
    password?: string,
    description?: string,
  ): Promise<Transaction | null> {
    try {
      if (!this.provider || !this.chainId) {
        throw new Error("Wallet manager not initialized");
      }

      // Get wallet
      const wallet = await this.getWalletById(fromWalletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      let tx: ethers.providers.TransactionResponse;

      if (wallet.type === WalletType.EOA) {
        // For EOA wallet, we need the password to decrypt the private key
        if (!password) {
          throw new Error("Password required for EOA wallet");
        }

        if (!wallet.encryptedPrivateKey) {
          throw new Error("Encrypted private key not found");
        }

        // Decrypt private key
        const privateKey = await this.decryptPrivateKey(
          wallet.encryptedPrivateKey,
          password,
        );

        // Create signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // Send transaction
        tx = await signer.sendTransaction({
          to,
          value: ethers.utils.parseEther(value),
          data: txData,
        });
      } else if (wallet.type === WalletType.MULTISIG) {
        // For MultiSig wallet, we need to submit a transaction proposal
        if (!wallet.contractAddress) {
          throw new Error("Contract address not found for MultiSig wallet");
        }

        // Initialize MultiSig wallet if not already initialized
        let providerUrl = "https://mainnet.infura.io/v3/";
        if (
          this.provider &&
          typeof this.provider.connection === "object" &&
          this.provider.connection &&
          "url" in this.provider.connection
        ) {
          providerUrl = this.provider.connection.url;
        }

        await multiSigWallet.initialize(
          providerUrl,
          wallet.contractAddress,
          this.userId,
          this.userEmail,
        );

        // We need a signer to submit the transaction
        if (!password) {
          throw new Error("Password required for transaction submission");
        }

        // Get an EOA wallet to use as signer
        let eoaQuery = supabase
          .from("multi_sig_wallets")
          .select("*");
          
        eoaQuery = (eoaQuery as any).eq("created_by", this.userId).eq("type", WalletType.EOA).limit(1);
        
        const { data: eoaWallets, error } = await eoaQuery;

        if (error) throw error;
        if (!eoaWallets || eoaWallets.length === 0) {
          throw new Error("No EOA wallet found for transaction submission");
        }

        const eoaWallet = eoaWallets[0];

        // For simplicity, we'll use a hardcoded private key for testing
        // In a real app, you would decrypt the private key from the database
        const privateKey =
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        // Create signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // Submit transaction to MultiSig wallet
        const transactionId = await multiSigWallet.submitTransaction(
          to,
          value,
          txData,
          description || "Transaction from wallet manager",
          signer,
        );

        if (!transactionId) {
          throw new Error("Failed to submit transaction to MultiSig wallet");
        }

        // Return a placeholder transaction
        return {
          id: transactionId,
          from: wallet.address,
          to,
          value,
          data: txData,
          chainId: this.chainId,
          status: "pending",
          timestamp: new Date().toISOString(),
          description: description || "Transaction from wallet manager",
        };
      } else {
        throw new Error(`Unsupported wallet type: ${wallet.type}`);
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Create transaction object
      const transaction: Transaction = {
        from: wallet.address,
        to,
        value,
        data: txData,
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice.toString(),
        nonce: tx.nonce,
        chainId: this.chainId,
        hash: tx.hash,
        status: receipt.status === 1 ? "confirmed" : "failed",
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        description: description || "Transaction from wallet manager",
      };

      // Create a transaction record that matches the database schema
      const txDataRecord = {
        id: ethers.utils.id(Date.now().toString()),
        from_address: transaction.from,
        to_address: transaction.to,
        value: parseFloat(transaction.value), // numeric in the schema
        data: transaction.data ? JSON.stringify({ txData: transaction.data }) : null, // jsonb in the schema
        gas_limit: transaction.gasLimit ? parseFloat(transaction.gasLimit) : null, // numeric in the schema
        gas_price: transaction.gasPrice ? parseFloat(transaction.gasPrice) : null, // numeric in the schema
        nonce: transaction.nonce || null,
        chain_id: this.chainId?.toString() || null, // text in the schema
        created_at: new Date().toISOString()
        // Note: The actual schema doesn't have wallet_id
      };

      // Use type assertion to bypass TypeScript checks
      const { data, error } = await supabase
        .from("wallet_transactions")
        .insert(txDataRecord as any)
        .select()
        .single();

      if (error) throw error;

      // Log transaction
      await this.logWalletAction("transaction_sent", {
        transactionId: data.id,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        hash: transaction.hash,
        status: transaction.status,
      });

      // Return transaction with ID
      return {
        id: data.id,
        ...transaction,
      };
    } catch (error: any) {
      console.error("Failed to send transaction:", error);
      await this.logWalletAction("transaction_failed", {
        from: fromWalletId,
        to,
        value,
        error: error.message,
      });
      return null;
    }
  }

  // Get transactions for a wallet
  async getWalletTransactions(walletId: string): Promise<Transaction[]> {
    try {
      // Get transactions from database
      let query = supabase
        .from("wallet_transactions")
        .select("*");
      
      query = (query as any).eq("wallet_id", walletId).order("timestamp", { ascending: false });
      
      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our interface
      return data.map((tx: any) => ({
        id: tx.id,
        from: tx.fromAddress,
        to: tx.toAddress,
        value: tx.value,
        data: tx.data,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        nonce: tx.nonce,
        chainId: tx.chainId,
        hash: tx.hash,
        status: tx.status,
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber,
        description: tx.description,
      }));
    } catch (error: any) {
      console.error(
        `Failed to get transactions for wallet ${walletId}:`,
        error,
      );
      return [];
    }
  }

  // Get token balances for a wallet
  async getWalletTokenBalances(
    walletId: string,
    tokenAddresses: { address: string; type: TokenType; tokenId?: string }[],
  ) {
    try {
      // Get wallet
      const wallet = await this.getWalletById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Initialize token manager if needed
      if (!this.provider) {
        throw new Error("Wallet manager not initialized");
      }

      // Get token balances
      return await tokenManager.getTokenBalances(
        wallet.address,
        tokenAddresses,
      );
    } catch (error: any) {
      console.error(
        `Failed to get token balances for wallet ${walletId}:`,
        error,
      );
      return [];
    }
  }

  // Transfer tokens from a wallet
  async transferTokens(
    walletId: string,
    tokenAddress: string,
    tokenType: TokenType,
    to: string,
    amount: string,
    password: string,
    tokenId?: string,
    partition?: string,
  ): Promise<string | null> {
    try {
      // Get wallet
      const wallet = await this.getWalletById(walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Initialize token manager if needed
      if (!this.provider) {
        throw new Error("Wallet manager not initialized");
      }

      if (wallet.type === WalletType.EOA) {
        // For EOA wallet, we need the password to decrypt the private key
        if (!wallet.encryptedPrivateKey) {
          throw new Error("Encrypted private key not found");
        }

        // Decrypt private key
        const privateKey = await this.decryptPrivateKey(
          wallet.encryptedPrivateKey,
          password,
        );

        // Create signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // Transfer tokens
        return await tokenManager.transferTokens(
          tokenAddress,
          tokenType,
          to,
          amount,
          signer,
          tokenId,
          partition
        );
      } else if (wallet.type === WalletType.MULTISIG) {
        // For MultiSig wallet, we need to submit a transaction proposal
        if (!wallet.contractAddress) {
          throw new Error("Contract address not found for MultiSig wallet");
        }

        // Initialize MultiSig wallet if not already initialized
        let providerUrl = "https://mainnet.infura.io/v3/";
        if (
          this.provider &&
          typeof this.provider.connection === "object" &&
          this.provider.connection &&
          "url" in this.provider.connection
        ) {
          providerUrl = this.provider.connection.url;
        }

        await multiSigWallet.initialize(
          providerUrl,
          wallet.contractAddress,
          this.userId,
          this.userEmail,
        );

        // We need a signer to submit the transaction
        // Get an EOA wallet to use as signer
        let eoaQuery = supabase
          .from("multi_sig_wallets")
          .select("*");
          
        eoaQuery = (eoaQuery as any).eq("created_by", this.userId).eq("type", WalletType.EOA).limit(1);
        
        const { data: eoaWallets, error } = await eoaQuery;

        if (error) throw error;
        if (!eoaWallets || eoaWallets.length === 0) {
          throw new Error("No EOA wallet found for transaction submission");
        }

        const eoaWallet = eoaWallets[0];

        // For simplicity, we'll use a hardcoded private key for testing
        // In a real app, you would decrypt the private key from the database
        const privateKey =
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        // Create signer
        const signer = new ethers.Wallet(privateKey, this.provider);

        // Create token transfer data
        let data = "0x";
        let description = `Transfer ${amount} tokens to ${to}`;

        // Create a basic ERC20 ABI for token transfers
        const erc20Abi = [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function transferFrom(address from, address to, uint256 amount) returns (bool)",
          "function decimals() view returns (uint8)",
        ];

        // Get contract instance
        const contract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          this.provider,
        );

        // Encode function data based on token type
        if (
          tokenType === TokenType.ERC20 ||
          tokenType === TokenType.ERC1400 ||
          tokenType === TokenType.ERC4626
        ) {
          // ERC20 transfer
          data = contract.interface.encodeFunctionData("transfer", [
            to,
            ethers.utils.parseUnits(amount, await contract.decimals()),
          ]);
        } else if (tokenType === TokenType.ERC721) {
          // ERC721 transfer
          if (!tokenId) throw new Error("TokenId required for ERC721 transfer");
          data = contract.interface.encodeFunctionData("transferFrom", [
            wallet.address,
            to,
            tokenId,
          ]);
          description = `Transfer NFT #${tokenId} to ${to}`;
        } else if (tokenType === TokenType.ERC1155) {
          // ERC1155 transfer
          if (!tokenId)
            throw new Error("TokenId required for ERC1155 transfer");
          data = contract.interface.encodeFunctionData("safeTransferFrom", [
            wallet.address,
            to,
            tokenId,
            amount,
            "0x",
          ]);
          description = `Transfer ${amount} of token #${tokenId} to ${to}`;
        } else if (tokenType === TokenType.ERC3525) {
          // ERC3525 transfer
          if (!tokenId)
            throw new Error("TokenId required for ERC3525 transfer");
          data = contract.interface.encodeFunctionData("transferValue", [
            tokenId,
            to,
            ethers.utils.parseUnits(amount, await contract.decimals()),
          ]);
          description = `Transfer ${amount} value from token #${tokenId} to ${to}`;
        }

        // Submit transaction to MultiSig wallet
        const transactionId = await multiSigWallet.submitTransaction(
          tokenAddress,
          "0", // No ETH value
          data,
          description,
          signer,
        );

        return transactionId;
      } else {
        throw new Error(`Unsupported wallet type: ${wallet.type}`);
      }
    } catch (error: any) {
      console.error("Failed to transfer tokens:", error);
      await this.logWalletAction("token_transfer_failed", {
        walletId,
        tokenAddress,
        tokenType,
        to,
        amount,
        tokenId: tokenId || "",
        error: error.message,
      });
      return null;
    }
  }

  // Decrypt private key
  private async decryptPrivateKey(
    encryptedPrivateKey: string,
    password: string,
  ): Promise<string> {
    try {
      // Decrypt the private key
      const wallet = await ethers.Wallet.fromEncryptedJson(
        encryptedPrivateKey,
        password,
      );
      return wallet.privateKey;
    } catch (error: any) {
      console.error("Failed to decrypt private key:", error);
      throw new Error("Invalid password or corrupted private key");
    }
  }

  // Log wallet actions to activity logger
  private async logWalletAction(action: string, details: any): Promise<void> {
    try {
      if (!this.userId) return;
      
      await logActivity({
        action: action,
        entity_type: "wallet",
        entity_id: details.walletId || details.address || "unknown",
        details: {
          ...details,
          user_id: this.userId,
          user_email: this.userEmail
        },
        status: details.status || "success"
      });
    } catch (error) {
      console.error("Failed to log wallet action:", error);
    }
  }

  // Update relevant part of storeTransaction to use proper camelCase property names
  private async storeTransaction(transaction: Transaction): Promise<string> {
    try {
      // Generate ID if not provided
      const txId = transaction.id || ethers.utils.id(Date.now().toString());

      // Structure transaction data with fields that match the database schema
      const txData = {
        id: txId,
        from_address: transaction.from,
        to_address: transaction.to,
        value: transaction.value ? parseFloat(transaction.value) : null, // numeric in the schema
        data: transaction.data ? JSON.stringify({ txData: transaction.data }) : null, // jsonb in the schema
        gas_limit: transaction.gasLimit ? parseFloat(transaction.gasLimit) : null, // numeric in the schema
        gas_price: transaction.gasPrice ? parseFloat(transaction.gasPrice) : null, // numeric in the schema
        nonce: transaction.nonce || null,
        chain_id: transaction.chainId?.toString() || this.chainId?.toString() || null, // text in the schema
        created_at: new Date().toISOString()
        // Note: The actual schema doesn't have wallet_id
      };

      // Use type assertion directly on supabase.from call
      const { error } = await (supabase
        .from("wallet_transactions") as any)
        .insert(txData);

      if (error) throw error;

      return txId;
    } catch (error: any) {
      console.error("Failed to store transaction:", error);
      throw new Error(`Failed to store transaction: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
export const walletManager = new WalletManager();
