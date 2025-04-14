import { ethers } from "ethers";
import { supabase } from "../supabase";

// Define types for our multi-sig wallet
export interface MultiSigWallet {
  id: string;
  name: string;
  blockchain: string;
  address: string;
  owners: string[];
  threshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  destinationWalletAddress: string;
  value: string;
  data: string;
  nonce: number;
  hash: string;
  executed: boolean;
  confirmations: number;
  blockchain: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Confirmation {
  id: string;
  transactionId: string;
  owner: string;
  signature: string;
  createdAt: string;
}

// Supported blockchains
export const SUPPORTED_BLOCKCHAINS = [
  "ethereum",
  "polygon",
  "avalanche",
  "optimism",
  "solana",
  "bitcoin",
  "ripple",
  "aptos",
  "sui",
  "mantle",
  "stellar",
  "hedera",
  "base",
  "zksync",
  "arbitrum",
  "near",
];

// Blockchain-specific providers
const providers: Record<string, any> = {
  ethereum: null,
  polygon: null,
  avalanche: null,
  optimism: null,
  base: null,
  zksync: null,
  arbitrum: null,
  mantle: null,
  hedera: null,
  // Non-EVM chains will have their own providers
};

// Initialize providers
export const initializeProviders = () => {
  // Initialize EVM providers
  providers.ethereum = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_ETHEREUM_RPC_URL ||
      "https://eth-sepolia.g.alchemy.com/v2/demo",
  );
  providers.polygon = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_POLYGON_RPC_URL ||
      "https://polygon-mumbai.g.alchemy.com/v2/demo",
  );
  providers.avalanche = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_AVALANCHE_RPC_URL ||
      "https://api.avax-test.network/ext/bc/C/rpc",
  );
  providers.optimism = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_OPTIMISM_RPC_URL || "https://goerli.optimism.io",
  );
  providers.base = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_BASE_RPC_URL || "https://goerli.base.org",
  );
  providers.zksync = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_ZKSYNC_RPC_URL || "https://testnet.era.zksync.dev",
  );
  providers.arbitrum = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_ARBITRUM_RPC_URL ||
      "https://goerli-rollup.arbitrum.io/rpc",
  );
  providers.mantle = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_MANTLE_RPC_URL || "https://rpc.testnet.mantle.xyz",
  );
  providers.hedera = new ethers.providers.JsonRpcProvider(
    import.meta.env.VITE_HEDERA_RPC_URL || "https://testnet.hashio.io/api",
  );

  // Non-EVM providers will be initialized separately
  // We'll add them as we implement each blockchain
};

// Get provider for a specific blockchain
export const getProvider = (blockchain: string) => {
  if (!providers[blockchain]) {
    throw new Error(`Provider for ${blockchain} not initialized`);
  }
  return providers[blockchain];
};

// Create a new multi-sig wallet
export const createMultiSigWallet = async (
  name: string,
  blockchain: string,
  owners: string[],
  threshold: number,
): Promise<MultiSigWallet> => {
  try {
    // For EVM chains, we'll deploy a smart contract
    if (
      [
        "ethereum",
        "polygon",
        "avalanche",
        "optimism",
        "base",
        "zksync",
        "arbitrum",
        "mantle",
        "hedera",
      ].includes(blockchain)
    ) {
      // This is a placeholder - in a real implementation, we would deploy a multi-sig contract
      // For now, we'll just create a record in the database
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          name,
          blockchain,
          address: `0x${Math.random().toString(16).substring(2, 42)}`, // Placeholder address
          owners,
          threshold,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        blockchain: data.blockchain,
        address: data.address,
        owners: data.owners,
        threshold: data.threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else if (blockchain === "bitcoin") {
      // Bitcoin multi-sig implementation (placeholder)
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          name,
          blockchain,
          address: `bc1${Math.random().toString(16).substring(2, 42)}`, // Placeholder Bitcoin address
          owners,
          threshold,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        blockchain: data.blockchain,
        address: data.address,
        owners: data.owners,
        threshold: data.threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else if (blockchain === "ripple") {
      // XRP multi-sig implementation (placeholder)
      const { data, error } = await supabase
        .from("multi_sig_wallets")
        .insert({
          name,
          blockchain,
          address: `r${Math.random().toString(16).substring(2, 42)}`, // Placeholder XRP address
          owners,
          threshold,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        blockchain: data.blockchain,
        address: data.address,
        owners: data.owners,
        threshold: data.threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      // For non-EVM chains, we'll implement blockchain-specific logic
      throw new Error(
        `Multi-sig wallet creation for ${blockchain} not yet implemented`,
      );
    }
  } catch (error) {
    console.error("Error creating multi-sig wallet:", error);
    throw error;
  }
};

// Get all multi-sig wallets for the current user
export const getMultiSigWallets = async (): Promise<MultiSigWallet[]> => {
  try {
    // Try to get user from auth, if missing throw a clear error
    let userId: string | null = null;
    try {
      const { data: user } = await supabase.auth.getUser();
      userId = user?.user?.id || null;
    } catch (authError) {
      console.error("Authentication error:", authError);
      throw new Error("Authentication session missing. Please sign in to access your wallets.");
    }

    if (!userId) {
      throw new Error("Authentication required. Please sign in to access your wallets.");
    }

    const { data, error } = await supabase
      .from("multi_sig_wallets")
      .select("*")
      .or(`owners.cs.{${userId}},created_by.eq.${userId}`);

    if (error) throw error;

    return (data || []).map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      blockchain: wallet.blockchain,
      address: wallet.address,
      owners: wallet.owners,
      threshold: wallet.threshold,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching multi-sig wallets:", error);
    throw error;
  }
};

// Get a specific multi-sig wallet by ID
export const getMultiSigWallet = async (
  id: string,
): Promise<MultiSigWallet> => {
  try {
    const { data, error } = await supabase
      .from("multi_sig_wallets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      blockchain: data.blockchain,
      address: data.address,
      owners: data.owners,
      threshold: data.threshold,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error fetching multi-sig wallet:", error);
    throw error;
  }
};

// Create a new transaction proposal
export const proposeTransaction = async (
  walletId: string,
  destinationWalletAddress: string,
  value: string,
  data: string = "0x",
  tokenAddress?: string,
  tokenSymbol?: string,
): Promise<Transaction> => {
  try {
    const wallet = await getMultiSigWallet(walletId);

    // Get the next nonce for this wallet
    const { data: transactions, error: nonceError } = await supabase
      .from("multi_sig_transactions")
      .select("nonce")
      .eq("wallet_id", walletId)
      .order("nonce", { ascending: false })
      .limit(1);

    if (nonceError) throw nonceError;

    const nonce =
      transactions && transactions.length > 0 ? transactions[0].nonce + 1 : 0;

    // Create transaction hash (this would be blockchain-specific in a real implementation)
    let hash;
    if (
      [
        "ethereum",
        "polygon",
        "avalanche",
        "optimism",
        "base",
        "zksync",
        "arbitrum",
        "mantle",
        "hedera",
      ].includes(wallet.blockchain)
    ) {
      // EVM-compatible chains
      hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "bytes", "uint256", "address"],
          [
            destinationWalletAddress,
            ethers.utils.parseEther(value),
            data,
            nonce,
            tokenAddress || ethers.constants.AddressZero,
          ],
        ),
      );
    } else if (wallet.blockchain === "bitcoin") {
      // Bitcoin-specific hash (placeholder)
      hash = `btc${Math.random().toString(16).substring(2, 66)}`;
    } else if (wallet.blockchain === "ripple") {
      // XRP-specific hash (placeholder)
      hash = `xrp${Math.random().toString(16).substring(2, 66)}`;
    } else {
      // Generic hash for other chains (placeholder)
      hash = `${wallet.blockchain}${Math.random().toString(16).substring(2, 66)}`;
    }

    const { data: txData, error } = await supabase
      .from("multi_sig_transactions")
      .insert({
        wallet_id: walletId,
        destination_wallet_address: destinationWalletAddress,
        value,
        data,
        nonce,
        hash,
        executed: false,
        confirmations: 0,
        blockchain: wallet.blockchain,
        token_address: tokenAddress,
        token_symbol: tokenSymbol,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: txData.id,
      walletId: txData.wallet_id,
      destinationWalletAddress: txData.destination_wallet_address,
      value: txData.value,
      data: txData.data,
      nonce: txData.nonce,
      hash: txData.hash,
      executed: txData.executed,
      confirmations: txData.confirmations,
      blockchain: txData.blockchain,
      tokenAddress: txData.token_address,
      tokenSymbol: txData.token_symbol,
      createdAt: txData.created_at,
      updatedAt: txData.updated_at,
    };
  } catch (error) {
    console.error("Error proposing transaction:", error);
    throw error;
  }
};

// Confirm a transaction
export const confirmTransaction = async (
  transactionId: string,
  signature: string,
): Promise<void> => {
  try {
    // Try to get user from auth, if missing throw a clear error
    let userId: string | null = null;
    try {
      const { data: user } = await supabase.auth.getUser();
      userId = user?.user?.id || null;
    } catch (authError) {
      console.error("Authentication error:", authError);
      throw new Error("Authentication session missing. Please sign in to confirm this transaction.");
    }

    if (!userId) {
      throw new Error("Authentication required. Please sign in to confirm this transaction.");
    }

    const { data: transaction, error: txError } = await supabase
      .from("multi_sig_transactions")
      .select("*, multi_sig_wallets!inner(*)")
      .eq("id", transactionId)
      .single();

    if (txError) throw txError;

    // Check if user is an owner of the wallet
    const wallet = transaction.multi_sig_wallets;
    if (!wallet.owners.includes(userId)) {
      throw new Error("User is not an owner of this wallet");
    }

    // Check if user has already confirmed this transaction
    const { data: existingConfirmation, error: confirmError } = await supabase
      .from("multi_sig_confirmations")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("owner", userId)
      .maybeSingle();

    if (confirmError) throw confirmError;

    if (existingConfirmation) {
      throw new Error("Transaction already confirmed by this user");
    }

    // Add confirmation
    const { error: insertError } = await supabase
      .from("multi_sig_confirmations")
      .insert({
        transaction_id: transactionId,
        owner: userId,
        signature,
        created_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    // Update confirmation count
    const { data: confirmations, error: countError } = await supabase
      .from("multi_sig_confirmations")
      .select("id")
      .eq("transaction_id", transactionId);

    if (countError) throw countError;

    const { error: updateError } = await supabase
      .from("multi_sig_transactions")
      .update({
        confirmations: confirmations.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (updateError) throw updateError;

    // Check if we have enough confirmations to execute
    if (confirmations.length >= wallet.threshold) {
      // In a real implementation, we would execute the transaction on-chain here
      // For now, we'll just mark it as executed in the database
      const { error: execError } = await supabase
        .from("multi_sig_transactions")
        .update({
          executed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (execError) throw execError;
    }
  } catch (error) {
    console.error("Error confirming transaction:", error);
    throw error;
  }
};

// Get all transactions for a wallet
export const getTransactions = async (
  walletId: string,
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from("multi_sig_transactions")
      .select("*")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((tx) => ({
      id: tx.id,
      walletId: tx.wallet_id,
      destinationWalletAddress: tx.destination_wallet_address,
      value: tx.value,
      data: tx.data,
      nonce: tx.nonce,
      hash: tx.hash,
      executed: tx.executed,
      confirmations: tx.confirmations,
      blockchain: tx.blockchain,
      tokenAddress: tx.token_address,
      tokenSymbol: tx.token_symbol,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get confirmations for a transaction
export const getConfirmations = async (
  transactionId: string,
): Promise<Confirmation[]> => {
  try {
    const { data, error } = await supabase
      .from("multi_sig_confirmations")
      .select("*")
      .eq("transaction_id", transactionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((confirmation) => ({
      id: confirmation.id,
      transactionId: confirmation.transaction_id,
      owner: confirmation.owner,
      signature: confirmation.signature,
      createdAt: confirmation.created_at,
    }));
  } catch (error) {
    console.error("Error fetching confirmations:", error);
    throw error;
  }
};

// Get wallet balance (native token)
export const getWalletBalance = async (walletId: string): Promise<string> => {
  try {
    const wallet = await getMultiSigWallet(walletId);

    // For EVM chains, we can use ethers.js
    if (
      [
        "ethereum",
        "polygon",
        "avalanche",
        "optimism",
        "base",
        "zksync",
        "arbitrum",
        "mantle",
        "hedera",
      ].includes(wallet.blockchain)
    ) {
      const provider = getProvider(wallet.blockchain);
      const balance = await provider.getBalance(wallet.address);
      return ethers.utils.formatEther(balance);
    } else if (wallet.blockchain === "bitcoin") {
      // Bitcoin balance check (placeholder)
      return "0.05"; // Mock balance
    } else if (wallet.blockchain === "ripple") {
      // XRP balance check (placeholder)
      return "100.0"; // Mock balance
    } else {
      // For non-EVM chains, we'll implement blockchain-specific logic
      throw new Error(
        `Balance check for ${wallet.blockchain} not yet implemented`,
      );
    }
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    throw error;
  }
};

// Get token balance for a specific token
export const getTokenBalance = async (
  walletId: string,
  tokenAddress: string,
): Promise<string> => {
  try {
    const wallet = await getMultiSigWallet(walletId);

    // For EVM chains, we can use ethers.js with ERC20 interface
    if (
      [
        "ethereum",
        "polygon",
        "avalanche",
        "optimism",
        "base",
        "zksync",
        "arbitrum",
        "mantle",
        "hedera",
      ].includes(wallet.blockchain)
    ) {
      const provider = getProvider(wallet.blockchain);
      const erc20Interface = new ethers.utils.Interface([
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ]);

      const contract = new ethers.Contract(
        tokenAddress,
        erc20Interface,
        provider,
      );
      const balance = await contract.balanceOf(wallet.address);
      const decimals = await contract.decimals();

      return ethers.utils.formatUnits(balance, decimals);
    } else if (wallet.blockchain === "bitcoin") {
      // Bitcoin doesn't have tokens in the same way as EVM chains
      throw new Error("Bitcoin does not support ERC20-like tokens");
    } else if (wallet.blockchain === "ripple") {
      // XRP token balance check (placeholder)
      return "50.0"; // Mock balance
    } else {
      // For non-EVM chains, we'll implement blockchain-specific logic
      throw new Error(
        `Token balance check for ${wallet.blockchain} not yet implemented`,
      );
    }
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

// Initialize the module
initializeProviders();
