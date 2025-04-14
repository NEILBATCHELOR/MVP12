import { BlockchainAdapter } from "../BlockchainFactory";
import * as ripple from "ripple-lib";
import { RippleAPI } from "ripple-lib";

/**
 * Adapter for Ripple (XRP) blockchain
 */
export class RippleAdapter implements BlockchainAdapter {
  private api: RippleAPI;
  private network: string;
  private isConnected: boolean = false;

  constructor(rpcUrl: string, network: string) {
    this.api = new RippleAPI({
      server: rpcUrl
    });
    this.network = network;
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.api.connect();
      this.isConnected = true;
    }
  }

  getChainName(): string {
    return "ripple";
  }

  getChainId(): number {
    return 0; // XRP doesn't use chain IDs in the same way as EVM chains
  }

  async generateAddress(publicKey: string): Promise<string> {
    try {
      await this.ensureConnection();
      
      // If the publicKey is a hex string, convert it
      if (publicKey.startsWith("0x")) {
        publicKey = publicKey.slice(2);
      }
      
      // Generate an XRP address from the public key
      const address = this.api.deriveAddress(publicKey);
      return address;
    } catch (error) {
      throw new Error(`Failed to generate XRP address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createMultiSigWallet(
    owners: string[],
    threshold: number,
  ): Promise<string> {
    try {
      await this.ensureConnection();
      
      // XRP supports multi-signing via SignerList
      // In a production implementation, we would set up a SignerList transaction
      // For now, we'll return the first owner's address as a placeholder
      return owners[0];
    } catch (error) {
      throw new Error(`Failed to create XRP multisig wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      await this.ensureConnection();
      
      // Get account info including XRP balance
      const accountInfo = await this.api.getAccountInfo(address);
      return accountInfo.xrpBalance;
    } catch (error) {
      throw new Error(`Failed to get XRP balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTokenBalance(
    address: string,
    tokenAddress: string,
  ): Promise<string> {
    try {
      await this.ensureConnection();
      
      // In XRP, tokens are referred to as "issued currencies"
      // The tokenAddress should be in format "currency/issuer"
      const [currency, issuer] = tokenAddress.split('/');
      
      if (!currency || !issuer) {
        throw new Error("Invalid token format. Expected 'currency/issuer'");
      }
      
      // Get all trust lines (including issued currencies)
      const trustlines = await this.api.getTrustlines(address);
      
      // Find the specified currency
      const trustline = trustlines.find(line => 
        line.specification.currency === currency && 
        line.specification.counterparty === issuer
      );
      
      return trustline ? trustline.state.balance : "0";
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async proposeTransaction(
    walletAddress: string,
    to: string,
    value: string,
    data: string = "",
  ): Promise<string> {
    try {
      await this.ensureConnection();
      
      // Prepare an XRP payment transaction
      const payment = {
        source: {
          address: walletAddress,
          maxAmount: {
            value,
            currency: 'XRP'
          }
        },
        destination: {
          address: to,
          amount: {
            value,
            currency: 'XRP'
          }
        }
      };
      
      // Prepare the transaction
      const prepared = await this.api.preparePayment(walletAddress, payment, {
        // Additional options like maxLedgerVersionOffset could be included here
      });
      
      // Return the prepared transaction as a serialized string
      return JSON.stringify(prepared);
    } catch (error) {
      throw new Error(`Failed to propose XRP transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async signTransaction(
    transactionJson: string,
    privateKey: string,
  ): Promise<string> {
    try {
      await this.ensureConnection();
      
      // Parse the prepared transaction
      const prepared = JSON.parse(transactionJson);
      
      // Sign the transaction with the private key
      const { signedTransaction } = this.api.sign(prepared.txJSON, privateKey);
      
      // Return the signed transaction
      return signedTransaction;
    } catch (error) {
      throw new Error(`Failed to sign XRP transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeTransaction(
    walletAddress: string,
    signedTransaction: string,
    signatures: string[],
  ): Promise<string> {
    try {
      await this.ensureConnection();
      
      // Submit the signed transaction to the XRP Ledger
      const result = await this.api.submit(signedTransaction);
      
      // Check if the transaction was successfully submitted
      if (result.resultCode !== 'tesSUCCESS') {
        throw new Error(`Transaction submission failed: ${result.resultMessage}`);
      }
      
      // Return the transaction hash (cast as any to access tx_json property)
      return (result as any).tx_json?.hash || '';
    } catch (error) {
      throw new Error(`Failed to execute XRP transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isValidAddress(address: string): boolean {
    try {
      // Use the RippleAPI to validate the address
      return this.api.isValidAddress(address);
    } catch (error) {
      return false;
    }
  }
  
  // Clean up resources when the adapter is no longer needed
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.api.disconnect();
      this.isConnected = false;
    }
  }
}