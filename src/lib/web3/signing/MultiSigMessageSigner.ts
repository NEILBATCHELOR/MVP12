import { ethers } from "ethers";
import { MessageType, TypedData, VerificationResult } from "./MessageSigner";

/**
 * Interface for a signature with its signer
 */
export interface SignatureWithSigner {
  signature: string;
  signer: string;
}

/**
 * Result of verifying multiple signatures
 */
export interface MultiSigVerificationResult {
  isValid: boolean;
  validSignatures: SignatureWithSigner[];
  invalidSignatures: SignatureWithSigner[];
  error?: string;
}

/**
 * Service for handling message signing with multiple signatures
 */
export class MultiSigMessageSigner {
  private provider: ethers.providers.Provider;
  
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }
  
  /**
   * Combine multiple signatures into a single signature string
   * @param signatures Array of signatures to combine
   * @returns Combined signature string
   */
  combineSignatures(signatures: string[]): string {
    // Simple concatenation with a separator
    return signatures.join(":");
  }
  
  /**
   * Split a combined signature string into individual signatures
   * @param combinedSignature Combined signature string
   * @returns Array of individual signatures
   */
  splitSignatures(combinedSignature: string): string[] {
    return combinedSignature.split(":");
  }
  
  /**
   * Verify multiple signatures against a message
   * @param message The message that was signed
   * @param signatures Array of signatures with their signers
   * @param requiredSigners Array of addresses that are required to sign (subset of all possible signers)
   * @param threshold Minimum number of valid signatures required
   * @param messageType The type of message that was signed
   * @returns Verification result
   */
  async verifyMultipleSignatures(
    message: string | TypedData,
    signatures: SignatureWithSigner[],
    requiredSigners: string[] = [],
    threshold: number = 1,
    messageType: MessageType = MessageType.PERSONAL
  ): Promise<MultiSigVerificationResult> {
    const validSignatures: SignatureWithSigner[] = [];
    const invalidSignatures: SignatureWithSigner[] = [];
    
    // Normalize required signers to lowercase
    const normalizedRequiredSigners = requiredSigners.map(s => s.toLowerCase());
    
    for (const { signature, signer } of signatures) {
      try {
        const verificationResult = await this.verifySignature(
          message,
          signature,
          signer,
          messageType
        );
        
        if (verificationResult.isValid) {
          validSignatures.push({ signature, signer });
        } else {
          invalidSignatures.push({ signature, signer });
        }
      } catch (error) {
        invalidSignatures.push({ signature, signer });
      }
    }
    
    // Check if all required signers have valid signatures
    if (normalizedRequiredSigners.length > 0) {
      const validSignerAddresses = validSignatures.map(s => s.signer.toLowerCase());
      const missingRequiredSigners = normalizedRequiredSigners.filter(
        required => !validSignerAddresses.includes(required)
      );
      
      if (missingRequiredSigners.length > 0) {
        return {
          isValid: false,
          validSignatures,
          invalidSignatures,
          error: `Missing signatures from required signers: ${missingRequiredSigners.join(", ")}`,
        };
      }
    }
    
    // Check if threshold is met
    const isValid = validSignatures.length >= threshold;
    
    return {
      isValid,
      validSignatures,
      invalidSignatures,
      error: isValid ? undefined : `Threshold not met. Required: ${threshold}, Valid: ${validSignatures.length}`,
    };
  }
  
  /**
   * Verify a single signature
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param expectedSigner The expected signer address
   * @param messageType The type of message that was signed
   * @returns Verification result
   */
  private async verifySignature(
    message: string | TypedData,
    signature: string,
    expectedSigner: string,
    messageType: MessageType
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
      
      const isValid = recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
      
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
 * Factory for creating MultiSig message signers for different blockchains
 */
export class MultiSigMessageSignerFactory {
  private static signers: Record<string, MultiSigMessageSigner> = {};

  /**
   * Get a MultiSig message signer for a specific blockchain
   * @param blockchain The blockchain to get a signer for
   * @param provider The provider to use
   * @returns A MultiSig message signer
   */
  static getSigner(
    blockchain: string,
    provider: ethers.providers.Provider
  ): MultiSigMessageSigner {
    // Use a consistent key without relying on provider.connection.url
    // Cast to any to access provider properties that might not be in the type definition
    const providerObj = provider as any;
    const networkKey = 
      (providerObj._network && providerObj._network.chainId) ? 
      providerObj._network.chainId.toString() : 
      'unknown';
    
    const key = `${blockchain}-${networkKey}`;
    
    if (!this.signers[key]) {
      this.signers[key] = new MultiSigMessageSigner(provider);
    }
    
    return this.signers[key];
  }
}