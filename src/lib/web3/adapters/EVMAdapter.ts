import { ethers } from "ethers";
import { BlockchainAdapter } from "../BlockchainFactory";

/**
 * Adapter for EVM-compatible blockchains (Ethereum, Polygon, Avalanche, etc.)
 */
export class EVMAdapter implements BlockchainAdapter {
  private provider: ethers.providers.Provider;
  private chainId: number;
  private multiSigFactoryAddress: string;
  private chainName: string;

  constructor(rpcUrl: string, chainId: number, chainName: string, multiSigFactoryAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.chainId = chainId;
    this.chainName = chainName;
    this.multiSigFactoryAddress = multiSigFactoryAddress;
  }

  getChainName(): string {
    return this.chainName;
  }

  getChainId(): number {
    return this.chainId;
  }

  async generateAddress(publicKey: string): Promise<string> {
    return ethers.utils.computeAddress(publicKey);
  }

  async createMultiSigWallet(
    owners: string[],
    threshold: number,
  ): Promise<string> {
    // In a real implementation, we would deploy a multi-sig contract
    // For now, we'll just return a placeholder address
    return `0x${Math.random().toString(16).substring(2, 42)}`;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getTokenBalance(
    address: string,
    tokenAddress: string,
  ): Promise<string> {
    const erc20Interface = new ethers.utils.Interface([
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ]);

    const contract = new ethers.Contract(
      tokenAddress,
      erc20Interface,
      this.provider,
    );
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();

    return ethers.utils.formatUnits(balance, decimals);
  }

  async proposeTransaction(
    walletAddress: string,
    to: string,
    value: string,
    data: string = "0x",
  ): Promise<string> {
    // In a real implementation, we would call the multi-sig contract
    // For now, we'll just return a placeholder transaction hash
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256", "bytes"],
        [walletAddress, to, ethers.utils.parseEther(value), data],
      ),
    );
    return hash;
  }

  async signTransaction(
    transactionHash: string,
    privateKey: string,
  ): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(
      ethers.utils.arrayify(transactionHash),
    );
    return signature;
  }

  async executeTransaction(
    walletAddress: string,
    transactionHash: string,
    signatures: string[],
  ): Promise<string> {
    // In a real implementation, we would call the multi-sig contract
    // For now, we'll just return a placeholder transaction hash
    return `0x${Math.random().toString(16).substring(2, 66)}`;
  }

  isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }
}