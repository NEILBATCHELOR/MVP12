import { BlockchainAdapter } from "../BlockchainFactory";
import * as web3 from "@solana/web3.js";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as spl from "@solana/spl-token";

/**
 * Adapter for Solana blockchain
 */
export class SolanaAdapter implements BlockchainAdapter {
  private connection: web3.Connection;
  private networkName: string;

  constructor(rpcUrl: string, networkName: string) {
    this.connection = new web3.Connection(rpcUrl, "confirmed");
    this.networkName = networkName;
  }

  getChainName(): string {
    return "solana";
  }

  getChainId(): number {
    return 0; // Solana doesn't use chain IDs in the same way as EVM chains
  }

  async generateAddress(publicKey: string): Promise<string> {
    try {
      // If the publicKey is a hex string, convert it to base58
      if (publicKey.startsWith("0x")) {
        const pubKeyBuffer = Buffer.from(publicKey.slice(2), "hex");
        return new PublicKey(pubKeyBuffer).toString();
      }
      
      // Otherwise, assume it's already a valid Solana public key
      return new PublicKey(publicKey).toString();
    } catch (error) {
      throw new Error(`Failed to generate Solana address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createMultiSigWallet(
    owners: string[],
    threshold: number,
  ): Promise<string> {
    // Solana doesn't have native multisig wallets in the same way as Ethereum
    // In a real implementation, we would deploy a multisig program
    try {
      // Convert owner addresses to PublicKey objects
      const ownerKeys = owners.map(owner => new PublicKey(owner));
      
      // Create a multisig account
      const multisigProgramId = new PublicKey("AjAqnZwcMKjYB9fZHCGw2YaFLCxTZHxnxh8xwhkLA2Zw"); // Example program ID, replace with actual multisig program
      
      // Generate a new keypair for the multisig account
      const multisigKeypair = Keypair.generate();
      
      // In a complete implementation, we would create and send a transaction
      // to initialize the multisig account with the provided owners and threshold
      
      return multisigKeypair.publicKey.toString();
    } catch (error) {
      throw new Error(`Failed to create Solana multisig wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return (balance / web3.LAMPORTS_PER_SOL).toString();
    } catch (error) {
      throw new Error(`Failed to get Solana balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTokenBalance(
    address: string,
    tokenAddress: string,
  ): Promise<string> {
    try {
      const owner = new PublicKey(address);
      const mint = new PublicKey(tokenAddress);
      
      // Find the associated token account for this mint and owner
      const tokenAccount = await spl.getAssociatedTokenAddress(
        mint,
        owner,
        false
      );
      
      try {
        // Get the token account info
        const tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
        return tokenAccountInfo.value.uiAmount?.toString() || "0";
      } catch (error) {
        // Token account might not exist
        return "0";
      }
    } catch (error) {
      throw new Error(`Failed to get Solana token balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async proposeTransaction(
    walletAddress: string,
    to: string,
    value: string,
    data: string = "",
  ): Promise<string> {
    try {
      const fromPubkey = new PublicKey(walletAddress);
      const toPubkey = new PublicKey(to);
      
      // Create a transfer instruction
      const transaction = new Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: Math.floor(parseFloat(value) * web3.LAMPORTS_PER_SOL),
        })
      );
      
      // Set a recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      
      // Serialize the transaction
      const serializedTransaction = transaction.serializeMessage().toString("base64");
      
      // In a real implementation, we would return a transaction ID
      return serializedTransaction;
    } catch (error) {
      throw new Error(`Failed to propose Solana transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async proposeTokenTransaction(
    walletAddress: string,
    to: string,
    tokenAddress: string,
    amount: string,
    decimals: number = 9
  ): Promise<string> {
    try {
      const fromPubkey = new PublicKey(walletAddress);
      const toPubkey = new PublicKey(to);
      const mintPubkey = new PublicKey(tokenAddress);
      
      // Find the source token account
      const sourceTokenAccount = await spl.getAssociatedTokenAddress(
        mintPubkey,
        fromPubkey,
        false
      );
      
      // Find or create the destination token account
      const destinationTokenAccount = await spl.getAssociatedTokenAddress(
        mintPubkey,
        toPubkey,
        false
      );
      
      // Check if the destination token account exists
      const destinationAccountInfo = await this.connection.getAccountInfo(destinationTokenAccount);
      
      // Create a transaction
      const transaction = new Transaction();
      
      // If the destination token account doesn't exist, create it
      if (!destinationAccountInfo) {
        transaction.add(
          spl.createAssociatedTokenAccountInstruction(
            fromPubkey, // payer
            destinationTokenAccount, // associated token account
            toPubkey, // owner
            mintPubkey // mint
          )
        );
      }
      
      // Add the transfer instruction
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** decimals));
      
      transaction.add(
        spl.createTransferInstruction(
          sourceTokenAccount, // source
          destinationTokenAccount, // destination
          fromPubkey, // owner
          BigInt(amountBigInt.toString()) // amount in the smallest units
        )
      );
      
      // Set a recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      
      // Serialize the transaction
      return transaction.serializeMessage().toString("base64");
    } catch (error) {
      throw new Error(`Failed to propose Solana token transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async signTransaction(
    transactionString: string,
    privateKey: string,
  ): Promise<string> {
    try {
      // Create a keypair from the private key
      const keypair = Keypair.fromSecretKey(
        Buffer.from(privateKey.replace(/^0x/i, ""), "hex")
      );
      
      // Deserialize the transaction message
      const message = Transaction.from(Buffer.from(transactionString, "base64"));
      
      // Sign the transaction - fix the incorrect method call
      message.partialSign(keypair);
      
      // Serialize the signed transaction
      return message.serialize().toString("base64");
    } catch (error) {
      throw new Error(`Failed to sign Solana transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeTransaction(
    walletAddress: string,
    signedTransactionString: string,
    signatures: string[],
  ): Promise<string> {
    try {
      // Deserialize the signed transaction
      const signedTransaction = Transaction.from(Buffer.from(signedTransactionString, "base64"));
      
      // Send the transaction to the network
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      throw new Error(`Failed to execute Solana transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  async createTokenAccount(
    ownerAddress: string,
    tokenAddress: string
  ): Promise<string> {
    try {
      const owner = new PublicKey(ownerAddress);
      const mint = new PublicKey(tokenAddress);
      
      // Get the associated token account address
      const tokenAccount = await spl.getAssociatedTokenAddress(
        mint,
        owner,
        false
      );
      
      // Check if the token account already exists
      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      
      if (accountInfo) {
        // Account already exists
        return tokenAccount.toString();
      }
      
      // Create a transaction to create the associated token account
      const transaction = new Transaction().add(
        spl.createAssociatedTokenAccountInstruction(
          owner, // payer
          tokenAccount, // associated token account
          owner, // owner
          mint // mint
        )
      );
      
      // Add recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = owner;
      
      // Return the serialized transaction for signing
      return transaction.serializeMessage().toString("base64");
    } catch (error) {
      throw new Error(`Failed to create Solana token account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}