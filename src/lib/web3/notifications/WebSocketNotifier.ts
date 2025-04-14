import { ethers } from "ethers";
import { EventEmitter } from "events";
import { TransactionDetails, TransactionEvent, TransactionStatus } from "./TransactionNotifier";

/**
 * WebSocket connection status
 */
export enum WebSocketStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

/**
 * WebSocket notification events
 */
export enum WebSocketEvent {
  STATUS_CHANGE = "statusChange",
  NEW_BLOCK = "newBlock",
  NEW_TRANSACTION = "newTransaction",
  NEW_LOG = "newLog",
  ERROR = "error",
}

/**
 * Block information
 */
export interface BlockInfo {
  blockchain: string;
  number: number;
  hash: string;
  timestamp: number;
}

/**
 * Log information
 */
export interface LogInfo {
  blockchain: string;
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  address: string;
  topics: string[];
  data: string;
  timestamp: number;
}

/**
 * WebSocket notification service that listens for real-time blockchain events
 */
export class WebSocketNotifier extends EventEmitter {
  private provider: ethers.providers.WebSocketProvider;
  private blockchain: string;
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectTimeoutId?: NodeJS.Timeout;
  private logFilters: ethers.providers.Filter[] = [];
  private pendingTransactions: Set<string> = new Set();

  constructor(
    wsUrl: string,
    blockchain: string
  ) {
    super();
    this.blockchain = blockchain;
    this.provider = new ethers.providers.WebSocketProvider(wsUrl);
    this.setupListeners();
  }

  /**
   * Connect to the WebSocket
   */
  connect(): void {
    if (this.status === WebSocketStatus.CONNECTED) {
      return;
    }

    this.setStatus(WebSocketStatus.CONNECTING);
    this.setupListeners();
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    this.clearListeners();
    this.provider.removeAllListeners();
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = undefined;
    }
    
    this.setStatus(WebSocketStatus.DISCONNECTED);
  }

  /**
   * Get the current WebSocket status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Subscribe to logs matching a filter
   * @param filter The filter to match logs against
   */
  subscribeToLogs(filter: ethers.providers.Filter): void {
    this.logFilters.push(filter);
    this.provider.on(filter, (log) => {
      const logInfo: LogInfo = {
        blockchain: this.blockchain,
        blockHash: log.blockHash,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        address: log.address,
        topics: log.topics,
        data: log.data,
        timestamp: Date.now(),
      };
      this.emit(WebSocketEvent.NEW_LOG, logInfo);
    });
  }

  /**
   * Subscribe to transactions from/to an address
   * @param address The address to monitor
   */
  subscribeToAddress(address: string): void {
    // Subscribe to pending transactions first
    this.provider.on("pending", (txHash) => {
      if (!this.pendingTransactions.has(txHash)) {
        this.pendingTransactions.add(txHash);
        this.checkTransaction(txHash, address);
      }
    });
  }

  /**
   * Set the WebSocket status and emit an event
   * @param status The new status
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit(WebSocketEvent.STATUS_CHANGE, status);
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupListeners(): void {
    // Listen for WebSocket connection events
    // Check if the provider has a WebSocket connection
    // Note: This is a workaround as the type definitions don't fully reflect the structure
    const wsProvider = this.provider as any;
    const websocket = wsProvider._websocket || wsProvider.websocket || 
                      (wsProvider.connection && wsProvider.connection.websocket);
    
    if (websocket) {
      websocket.onopen = () => {
        this.setStatus(WebSocketStatus.CONNECTED);
        this.reconnectAttempts = 0;
        
        // Set up blockchain listeners after connection is established
        this.setupBlockchainListeners();
      };
      
      websocket.onclose = () => {
        this.setStatus(WebSocketStatus.DISCONNECTED);
        this.attemptReconnect();
      };
      
      websocket.onerror = (error) => {
        this.setStatus(WebSocketStatus.ERROR);
        this.emit(WebSocketEvent.ERROR, error);
        this.attemptReconnect();
      };
    }
  }

  /**
   * Set up blockchain event listeners
   */
  private setupBlockchainListeners(): void {
    // Listen for new blocks
    this.provider.on("block", (blockNumber) => {
      this.provider.getBlock(blockNumber).then((block) => {
        if (block) {
          const blockInfo: BlockInfo = {
            blockchain: this.blockchain,
            number: block.number,
            hash: block.hash,
            timestamp: Date.now(),
          };
          this.emit(WebSocketEvent.NEW_BLOCK, blockInfo);
        }
      });
    });
    
    // Re-add any log filters
    for (const filter of this.logFilters) {
      this.provider.on(filter, (log) => {
        const logInfo: LogInfo = {
          blockchain: this.blockchain,
          blockHash: log.blockHash,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          address: log.address,
          topics: log.topics,
          data: log.data,
          timestamp: Date.now(),
        };
        this.emit(WebSocketEvent.NEW_LOG, logInfo);
      });
    }
  }

  /**
   * Clear all blockchain event listeners
   */
  private clearListeners(): void {
    this.provider.removeAllListeners("block");
    
    for (const filter of this.logFilters) {
      this.provider.removeAllListeners(filter);
    }
  }

  /**
   * Attempt to reconnect to the WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit(WebSocketEvent.ERROR, "Max reconnect attempts reached");
      return;
    }
    
    this.reconnectAttempts++;
    
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Check a transaction to see if it involves the monitored address
   * @param txHash Transaction hash
   * @param address Address to check against
   */
  private async checkTransaction(txHash: string, address: string): Promise<void> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      
      if (!tx) {
        return;
      }
      
      const normalizedAddress = address.toLowerCase();
      
      if (
        (tx.from && tx.from.toLowerCase() === normalizedAddress) ||
        (tx.to && tx.to.toLowerCase() === normalizedAddress)
      ) {
        const transactionDetails: TransactionDetails = {
          hash: tx.hash,
          blockchain: this.blockchain,
          from: tx.from,
          to: tx.to || "",
          value: tx.value.toString(),
          status: tx.blockNumber ? TransactionStatus.CONFIRMED : TransactionStatus.PENDING,
          timestamp: Date.now(),
        };
        
        this.emit(WebSocketEvent.NEW_TRANSACTION, transactionDetails);
      }
    } catch (error) {
      this.emit(WebSocketEvent.ERROR, error);
    }
  }
}

/**
 * Factory for creating WebSocket notifiers for different blockchains
 */
export class WebSocketNotifierFactory {
  private static notifiers: Map<string, WebSocketNotifier> = new Map();

  /**
   * Get a WebSocket notifier for a specific blockchain
   * @param blockchain The blockchain to get a notifier for
   * @param wsUrl The WebSocket URL to connect to
   * @returns A WebSocket notifier
   */
  static getNotifier(
    blockchain: string,
    wsUrl: string
  ): WebSocketNotifier {
    const key = `${blockchain}-${wsUrl}`;
    
    if (!this.notifiers.has(key)) {
      const notifier = new WebSocketNotifier(wsUrl, blockchain);
      this.notifiers.set(key, notifier);
    }
    
    return this.notifiers.get(key)!;
  }
}