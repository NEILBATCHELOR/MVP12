import { BlockchainAdapter } from "../BlockchainFactory";
import * as nearAPI from 'near-api-js';
import { 
  connect, 
  keyStores, 
  utils, 
  transactions, 
  providers, 
  Account,
  WalletConnection
} from 'near-api-js';
import { KeyPair } from 'near-api-js/lib/utils/key_pair';
import { PublicKey } from 'near-api-js/lib/utils/key_pair';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers/provider';
import BN from 'bn.js';

/**
 * Adapter for NEAR Protocol blockchain
 */
export class NEARAdapter implements BlockchainAdapter {
  private rpcUrl: string;
  private network: string;
  private keyStore: keyStores.InMemoryKeyStore;
  private nearConnection: nearAPI.Near | null = null;

  constructor(rpcUrl: string, network: string) {
    this.rpcUrl = rpcUrl;
    this.network = network;
    this.keyStore = new keyStores.InMemoryKeyStore();
  }

  private async getConnection(): Promise<nearAPI.Near> {
    if (!this.nearConnection) {
      this.nearConnection = await connect({
        networkId: this.network,
        nodeUrl: this.rpcUrl,
        keyStore: this.keyStore,
        headers: {}
      });
    }
    return this.nearConnection;
  }

  getChainName(): string {
    return "near";
  }

  getChainId(): number {
    return 0; // NEAR doesn't use chain IDs in the same way as EVM chains
  }

  async generateAddress(publicKey: string): Promise<string> {
    try {
      // Convert from hex if needed
      let pubKeyValue = publicKey;
      if (publicKey.startsWith('0x')) {
        pubKeyValue = publicKey.substring(2);
      }
      
      // Create a PublicKey from the provided key - using the correct method
      const pubKey = PublicKey.fromString(pubKeyValue);
      
      // Generate an implicit account ID (more like an address)
      const accountId = Buffer.from(pubKey.data).toString('hex');
      
      return accountId;
    } catch (error) {
      throw new Error(`Failed to generate NEAR address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createMultiSigWallet(
    owners: string[],
    threshold: number,
  ): Promise<string> {
    try {
      const near = await this.getConnection();
      const accountId = `multisig-${Date.now()}.${this.network}`;
      
      // In a real implementation, we would deploy a multisig contract
      // and initialize it with the owners and threshold
      
      // Generate a new key pair for the multisig account
      const keyPair = KeyPair.fromRandom('ed25519');
      await this.keyStore.setKey(this.network, accountId, keyPair);
      
      // Create a transaction to create the account and deploy the contract
      // For brevity, we're not including the full contract deployment code
      
      return accountId;
    } catch (error) {
      throw new Error(`Failed to create NEAR multisig wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const near = await this.getConnection();
      const account = await near.account(address);
      const balance = await account.getAccountBalance();
      
      // Convert yoctoNEAR (10^-24) to NEAR
      const nearBalance = utils.format.formatNearAmount(balance.available);
      
      return nearBalance;
    } catch (error) {
      throw new Error(`Failed to get NEAR balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTokenBalance(
    address: string,
    tokenAddress: string,
  ): Promise<string> {
    try {
      const near = await this.getConnection();
      const account = await near.account(address);
      
      // Call the ft_balance_of method on the token contract
      const balance = await account.viewFunction({
        contractId: tokenAddress,
        methodName: 'ft_balance_of',
        args: { account_id: address }
      });
      
      // Most NEAR tokens use a decimal of 18 or 24
      // This would need to be fetched from the token contract for accuracy
      const decimals = await account.viewFunction({
        contractId: tokenAddress,
        methodName: 'ft_metadata',
        args: {}
      }).then(metadata => metadata.decimals || 18).catch(() => 18);
      
      // Format the balance based on the decimals
      const formattedBalance = new BN(balance).div(new BN(10).pow(new BN(decimals))).toString();
      
      return formattedBalance;
    } catch (error) {
      throw new Error(`Failed to get NEAR token balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async proposeTransaction(
    walletAddress: string,
    to: string,
    value: string,
    data: string = "",
  ): Promise<string> {
    try {
      const near = await this.getConnection();
      const account = await near.account(walletAddress);
      
      // Convert NEAR to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
      const amount = utils.format.parseNearAmount(value);
      
      if (!amount) {
        throw new Error('Invalid amount');
      }
      
      // Create a transfer transaction
      const actions = [transactions.transfer(new BN(amount))];
      
      // Get latest block hash for the transaction
      const provider = new providers.JsonRpcProvider({ url: this.rpcUrl });
      const blockInfo = await provider.block({ finality: 'final' });
      const blockHash = utils.serialize.base_decode(blockInfo.header.hash);
      
      // Get access key information
      const accessKeyInfo = await account.findAccessKey(to, actions);
      if (!accessKeyInfo) {
        throw new Error('No access key found for this account');
      }
      
      // Create a transaction with correct types
      const nonce = Number(accessKeyInfo.accessKey.nonce) + 1;
      
      // Use the publicKey from accessKeyInfo directly
      const transaction = transactions.createTransaction(
        walletAddress,
        accessKeyInfo.publicKey,
        to,
        nonce,
        actions,
        blockHash
      );
      
      // Serialize the transaction (using any to bypass type issues)
      const serializedTx = utils.serialize.serialize(
        transactions.SCHEMA as any,
        transaction
      );
      
      return Buffer.from(serializedTx).toString('base64');
    } catch (error) {
      throw new Error(`Failed to propose NEAR transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async proposeTokenTransaction(
    walletAddress: string,
    to: string,
    tokenAddress: string,
    amount: string,
    data: string = "",
  ): Promise<string> {
    try {
      const near = await this.getConnection();
      const account = await near.account(walletAddress);
      
      // Get token metadata for decimals
      const metadata = await account.viewFunction({
        contractId: tokenAddress,
        methodName: 'ft_metadata',
        args: {}
      }).catch(() => ({ decimals: 18 }));
      
      // Convert token amount to smallest denomination
      const decimalAmount = new BN(parseFloat(amount) * 10 ** (metadata.decimals || 18)).toString();
      
      // Create ft_transfer action
      const actions = [
        transactions.functionCall(
          'ft_transfer',
          {
            receiver_id: to,
            amount: decimalAmount,
            memo: data || undefined
          },
          new BN('30000000000000'), // 30 TGas
          new BN('1') // 1 yoctoNEAR for the ft_transfer attachment requirement
        )
      ];
      
      // Get latest block hash for the transaction
      const provider = new providers.JsonRpcProvider({ url: this.rpcUrl });
      const blockInfo = await provider.block({ finality: 'final' });
      const blockHash = utils.serialize.base_decode(blockInfo.header.hash);
      
      // Get access key information
      const accessKeyInfo = await account.findAccessKey(tokenAddress, actions);
      if (!accessKeyInfo) {
        throw new Error('No access key found for this account');
      }
      
      // Create a transaction with correct types
      const nonce = Number(accessKeyInfo.accessKey.nonce) + 1;
      
      // Use the publicKey from accessKeyInfo directly
      const transaction = transactions.createTransaction(
        walletAddress,
        accessKeyInfo.publicKey,
        tokenAddress,
        nonce,
        actions,
        blockHash
      );
      
      // Serialize the transaction (using any to bypass type issues)
      const serializedTx = utils.serialize.serialize(
        transactions.SCHEMA as any,
        transaction
      );
      
      return Buffer.from(serializedTx).toString('base64');
    } catch (error) {
      throw new Error(`Failed to propose NEAR token transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async signTransaction(
    serializedTx: string,
    privateKey: string,
  ): Promise<string> {
    try {
      // Create a key pair from the private key using the actual signature
      const keyPair = KeyPair.fromString(privateKey as any);
      
      // Deserialize the transaction (using any to bypass type issues)
      const transaction = utils.serialize.deserialize(
        transactions.SCHEMA as any,
        transactions.Transaction as any,
        Buffer.from(serializedTx, 'base64') as any
      );
      
      // Sign the transaction
      const signature = keyPair.sign(utils.serialize.serialize(
        transactions.SCHEMA as any,
        transaction
      ));
      
      // Create a signed transaction
      const signedTx = new transactions.SignedTransaction({
        transaction,
        signature
      } as any);
      
      // Serialize the signed transaction (using any to bypass type issues)
      const serializedSignedTx = utils.serialize.serialize(
        transactions.SCHEMA as any,
        signedTx
      );
      
      return Buffer.from(serializedSignedTx).toString('base64');
    } catch (error) {
      throw new Error(`Failed to sign NEAR transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeTransaction(
    walletAddress: string,
    signedSerializedTx: string,
    signatures: string[],
  ): Promise<string> {
    try {
      const near = await this.getConnection();
      
      // Create a provider instance
      const provider = new providers.JsonRpcProvider({ url: this.rpcUrl });
      
      // Deserialize the signed transaction (using any to bypass type issues)
      const signedTx = utils.serialize.deserialize(
        transactions.SCHEMA as any,
        transactions.SignedTransaction as any,
        Buffer.from(signedSerializedTx, 'base64') as any
      );
      
      // Send the transaction to the network
      const result = await provider.sendTransaction(signedTx as any);
      
      // Return the transaction hash
      return result.transaction.hash;
    } catch (error) {
      throw new Error(`Failed to execute NEAR transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isValidAddress(address: string): boolean {
    // NEAR account IDs can have various formats
    // This is a simplified validation
    try {
      // Check if it's a valid account ID according to NEAR rules
      // Account IDs must be between 2-64 characters
      // Account IDs can only use lowercase alphanumeric characters, '_' and '.'
      // Account IDs cannot start or end with '_' or '.'
      // Account IDs cannot contain two consecutive '_' or '.'
      
      if (address.length < 2 || address.length > 64) {
        return false;
      }
      
      // Check for valid characters
      if (!/^[a-z0-9_\.]+$/.test(address)) {
        return false;
      }
      
      // Check for invalid starts/ends
      if (address.startsWith('_') || address.startsWith('.') || 
          address.endsWith('_') || address.endsWith('.')) {
        return false;
      }
      
      // Check for consecutive special characters
      if (address.includes('__') || address.includes('..') || 
          address.includes('_.') || address.includes('._')) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
}