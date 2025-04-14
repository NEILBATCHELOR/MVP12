import { ethers } from "ethers";

/**
 * Types of messages that can be signed
 */
export enum MessageType {
  PERSONAL = "personal",
  TYPED_DATA = "typed_data",
  ETH_SIGN = "eth_sign",
}

/**
 * Interface for typed data objects following EIP-712
 */
export interface TypedData {
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  message: Record<string, any>;
}

/**
 * Interface for signature verification result
 */
export interface VerificationResult {
  isValid: boolean;
  recoveredAddress?: string;
  error?: string;
}

/**
 * Service for signing and verifying messages
 */
export class MessageSigner {
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  /**
   * Sign a message using personal_sign (most common)
   * This prepends the Ethereum prefix to the message
   * @param message The message to sign
   * @param privateKey The private key to sign with
   * @returns The signature
   */
  async signPersonalMessage(
    message: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const signature = await wallet.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign personal message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sign a message using eth_sign
   * This does NOT prepend the Ethereum prefix
   * WARNING: This is less secure than personal_sign and should be avoided
   * @param message The message to sign (typically a hex string)
   * @param privateKey The private key to sign with
   * @returns The signature
   */
  async signMessage(
    message: string,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const messageBytes = ethers.utils.arrayify(
        ethers.utils.hexlify(
          typeof message === "string" && message.startsWith("0x")
            ? message
            : ethers.utils.toUtf8Bytes(message)
        )
      );
      const signature = await wallet._signingKey().signDigest(ethers.utils.keccak256(messageBytes));
      return ethers.utils.joinSignature(signature);
    } catch (error) {
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sign typed data according to EIP-712
   * @param typedData The typed data to sign
   * @param privateKey The private key to sign with
   * @returns The signature
   */
  async signTypedData(
    typedData: TypedData,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      
      // Use the internal _signTypedData method from ethers.js
      const signature = await wallet._signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
      );
      
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign typed data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a signature
   * @param message The original message
   * @param signature The signature to verify
   * @param expectedAddress The expected address of the signer
   * @param messageType The type of message that was signed
   * @returns Verification result
   */
  async verifySignature(
    message: string | TypedData,
    signature: string,
    expectedAddress: string,
    messageType: MessageType = MessageType.PERSONAL
  ): Promise<VerificationResult> {
    try {
      let recoveredAddress: string;
      
      if (messageType === MessageType.PERSONAL) {
        // Verify personal_sign signature
        recoveredAddress = ethers.utils.verifyMessage(
          message as string,
          signature
        );
      } else if (messageType === MessageType.ETH_SIGN) {
        // Verify eth_sign signature
        const messageBytes = ethers.utils.arrayify(
          ethers.utils.hexlify(
            typeof message === "string" && message.startsWith("0x")
              ? message
              : ethers.utils.toUtf8Bytes(message as string)
          )
        );
        const msgHash = ethers.utils.keccak256(messageBytes);
        const msgHashBytes = ethers.utils.arrayify(msgHash);
        recoveredAddress = ethers.utils.recoverAddress(msgHashBytes, signature);
      } else if (messageType === MessageType.TYPED_DATA) {
        // Verify EIP-712 typed data signature
        const typedData = message as TypedData;
        const digest = ethers.utils._TypedDataEncoder.hash(
          typedData.domain,
          typedData.types,
          typedData.message
        );
        recoveredAddress = ethers.utils.recoverAddress(digest, signature);
      } else {
        return {
          isValid: false,
          error: `Unsupported message type: ${messageType}`,
        };
      }
      
      const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
      
      return {
        isValid,
        recoveredAddress,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Factory for creating message signers for different blockchains
 */
export class MessageSignerFactory {
  private static signers: Record<string, MessageSigner> = {};

  /**
   * Get a message signer for a specific blockchain
   * @param blockchain The blockchain to get a signer for
   * @param provider The provider to use
   * @returns A message signer
   */
  static getSigner(
    blockchain: string,
    provider: ethers.providers.Provider
  ): MessageSigner {
    // Use a consistent key without relying on provider.connection.url
    // Cast to any to access provider properties that might not be in the type definition
    const providerObj = provider as any;
    const networkKey = 
      (providerObj._network && providerObj._network.chainId) ? 
      providerObj._network.chainId.toString() : 
      'unknown';
    
    const key = `${blockchain}-${networkKey}`;
    
    if (!this.signers[key]) {
      this.signers[key] = new MessageSigner(provider);
    }
    
    return this.signers[key];
  }
}