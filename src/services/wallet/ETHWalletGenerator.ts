import { ethers } from 'ethers';
import { WalletGenerator, Wallet, WalletMetadata } from './WalletGenerator';

/**
 * Interface for a generated wallet
 */
export interface GeneratedWallet {
  address: string;
  publicKey: string;
  privateKey?: string; // Optional - only included if explicitly requested
  mnemonic?: string;
}

export interface WalletGenerationOptions {
  chainId?: number;
  entropy?: string;
  includePrivateKey?: boolean;
  includeMnemonic?: boolean;
  path?: string; // Added path property for mnemonic derivation
}

/**
 * Implementation of WalletGenerator for Ethereum wallets
 */
export class ETHWalletGenerator implements WalletGenerator {
  /**
   * Generate a new Ethereum wallet
   * @returns A wallet generation result with address and private key
   */
  public async generateWallet(): Promise<Wallet> {
    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      metadata: this.getMetadata()
    };
  }

  /**
   * Validate an Ethereum address
   * @param address The address to validate
   * @returns True if the address is valid, false otherwise
   */
  public validateAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }

  /**
   * Static helper method to validate an address (alias for backwards compatibility)
   * @param address The address to validate
   * @returns True if the address is valid, false otherwise
   */
  public static isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }

  /**
   * Get the wallet type
   * @returns The string identifier for this wallet type
   */
  public getWalletType(): string {
    return 'ethereum';
  }

  /**
   * Get metadata for the wallet
   * @returns The wallet metadata
   */
  public getMetadata(): WalletMetadata {
    return {
      type: 'ethereum',
      chainId: 1,
      standard: 'ERC20',
      coinType: '60',
      network: 'ethereum'
    };
  }

  /**
   * Create a wallet from a private key
   * @param privateKey The private key
   * @returns The wallet
   */
  public static walletFromPrivateKey(privateKey: string): GeneratedWallet {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    };
  }

  /**
   * Create wallets from a mnemonic phrase
   * @param mnemonic The mnemonic phrase
   * @param numWallets Number of wallets to generate
   * @returns Array of wallets
   */
  public static generateHDWallets(
    mnemonic: string,
    numWallets = 1
  ): GeneratedWallet[] {
    const wallets: GeneratedWallet[] = [];
    for (let i = 0; i < numWallets; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath(path);
      const wallet = new ethers.Wallet(hdNode.privateKey);
      wallets.push({
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey
      });
    }
    return wallets;
  }

  /**
   * Create wallets from a mnemonic phrase using the paths provided
   * @param mnemonic The mnemonic phrase
   * @param paths Derivation paths to use
   * @returns Array of wallets
   */
  public static generateWalletsFromPaths(
    mnemonic: string,
    paths: string[]
  ): GeneratedWallet[] {
    const wallets: GeneratedWallet[] = [];
    for (const path of paths) {
      const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath(path);
      const wallet = new ethers.Wallet(hdNode.privateKey);
      wallets.push({
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey
      });
    }
    return wallets;
  }

  /**
   * Generate multiple wallets at once
   */
  public static generateMultipleWallets(
    count: number, 
    options: WalletGenerationOptions = {}
  ): GeneratedWallet[] {
    const wallets: GeneratedWallet[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create a new random wallet for each count
      const wallet = ethers.Wallet.createRandom();
      wallets.push(ETHWalletGenerator.formatWalletOutput(wallet, options));
    }
    
    return wallets;
  }
  
  /**
   * Generate a single wallet (alias for backwards compatibility)
   * @param options Wallet generation options
   * @returns A single generated wallet
   */
  public static generateWallet(
    options: WalletGenerationOptions = {}
  ): GeneratedWallet {
    return ETHWalletGenerator.generateMultipleWallets(1, options)[0];
  }
  
  /**
   * Create a wallet from a private key
   */
  public static fromPrivateKey(
    privateKey: string,
    options: WalletGenerationOptions = {}
  ): GeneratedWallet {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return ETHWalletGenerator.formatWalletOutput(wallet, options);
    } catch (error) {
      throw new Error(`Invalid private key: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Create a wallet from a mnemonic phrase
   */
  public static fromMnemonic(
    mnemonic: string,
    options: WalletGenerationOptions = {}
  ): GeneratedWallet {
    try {
      // Default derivation path for Ethereum
      const defaultPath = "m/44'/60'/0'/0/0";
      const path = options.path || defaultPath;
      
      // Create wallet from mnemonic using HDNode
      const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath(path);
      const wallet = new ethers.Wallet(hdNode.privateKey);
      
      return ETHWalletGenerator.formatWalletOutput(wallet, { ...options, includeMnemonic: true });
    } catch (error) {
      throw new Error(`Invalid mnemonic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Format wallet output based on options
   * @param wallet The ethers.js wallet
   * @param options Generation options
   * @returns Formatted wallet output
   */
  private static formatWalletOutput(
    wallet: ethers.Wallet,
    options: WalletGenerationOptions = {}
  ): GeneratedWallet {
    const result: GeneratedWallet = {
      address: wallet.address,
      publicKey: wallet.publicKey,
    };

    if (options.includePrivateKey) {
      result.privateKey = wallet.privateKey;
    }

    if (options.includeMnemonic && wallet.mnemonic) {
      result.mnemonic = wallet.mnemonic.phrase;
    }

    return result;
  }
  
  /**
   * Encrypt a wallet for secure storage
   * Returns a JSON string that you can store
   */
  public static async encryptWallet(
    wallet: ethers.Wallet, 
    password: string
  ): Promise<string> {
    return wallet.encrypt(password);
  }
  
  /**
   * Decrypt a wallet from storage
   */
  public static async decryptWallet(
    encryptedJson: string,
    password: string
  ): Promise<ethers.Wallet> {
    return ethers.Wallet.fromEncryptedJson(encryptedJson, password);
  }
}