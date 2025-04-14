import { useState, useEffect, useCallback } from 'react';

/**
 * Interface for the wallet address message received from WebSocket
 */
export interface WalletAddressMessage {
  address: string;
  network: string; // ethereum, polygon, etc.
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Class handling WebSocket connection for real-time ETH wallet addresses
 */
export class WalletAddressReceiver {
  private websocket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000; // 2 seconds
  private onNewAddressCallback: ((address: WalletAddressMessage) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private isDevelopmentUrl: boolean;
  private isDisabled: boolean = false;

  constructor(url: string) {
    this.url = url;
    // Check if this is a development/example URL that doesn't actually exist
    this.isDevelopmentUrl = url.includes('localhost') || 
                           url.includes('127.0.0.1') || 
                           url.includes('example.com');
    
    // Disable WebSocket in development if VITE_ENABLE_WS is not set to true
    this.isDisabled = this.isDevelopmentUrl && 
                     import.meta.env.VITE_ENABLE_WS !== 'true';
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    // Don't attempt connection if disabled
    if (this.isDisabled) {
      if (this.onErrorCallback) {
        this.onErrorCallback(new Event('WebSocket disabled in development'));
      }
      return;
    }

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      this.websocket = new WebSocket(this.url);
      
      this.websocket.onopen = () => {
        if (!this.isDisabled) {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          if (this.onConnectedCallback) {
            this.onConnectedCallback();
          }
        }
      };

      this.websocket.onmessage = (event) => {
        if (this.isDisabled) return;
        
        try {
          const data = JSON.parse(event.data) as WalletAddressMessage;
          if (data.address && this.onNewAddressCallback) {
            this.onNewAddressCallback(data);
          }
        } catch (error) {
          if (!this.isDevelopmentUrl) {
            console.error('Error parsing WebSocket message:', error);
          }
        }
      };

      this.websocket.onerror = (error) => {
        if (this.isDisabled) return;
        
        if (!this.isDevelopmentUrl) {
          console.error('WebSocket error:', error);
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      };

      this.websocket.onclose = () => {
        if (this.isDisabled) return;
        
        if (!this.isDevelopmentUrl) {
          console.log('WebSocket connection closed');
        }
        this.attemptReconnect();
      };
    } catch (error) {
      if (this.isDisabled) return;
      
      if (!this.isDevelopmentUrl) {
        console.error('Failed to establish WebSocket connection:', error);
      }
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.isDisabled) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (!this.isDevelopmentUrl) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      }
      
      setTimeout(() => {
        if (!this.isDisabled) {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else if (!this.isDevelopmentUrl) {
      console.error('Maximum reconnection attempts reached.');
    }
  }

  /**
   * Set callback for when a new address is received
   */
  public onNewAddress(callback: (address: WalletAddressMessage) => void): void {
    this.onNewAddressCallback = callback;
  }

  /**
   * Set callback for when connection is established
   */
  public onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  /**
   * Set callback for when an error occurs
   */
  public onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

/**
 * React hook for using the wallet address receiver
 */
export function useWalletAddressReceiver(wsUrl: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [addresses, setAddresses] = useState<WalletAddressMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<WalletAddressReceiver | null>(null);

  // Initialize the receiver
  useEffect(() => {
    const addressReceiver = new WalletAddressReceiver(wsUrl);
    
    addressReceiver.onConnected(() => {
      setIsConnected(true);
      setError(null);
    });
    
    addressReceiver.onNewAddress((address) => {
      setAddresses(prev => [...prev, address]);
    });
    
    addressReceiver.onError(() => {
      setIsConnected(false);
      setError('WebSocket connection disabled in development mode');
    });
    
    addressReceiver.connect();
    setReceiver(addressReceiver);
    
    return () => {
      addressReceiver.disconnect();
    };
  }, [wsUrl]);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    if (receiver) {
      receiver.disconnect();
      receiver.connect();
    }
  }, [receiver]);

  return {
    isConnected,
    addresses,
    error,
    reconnect,
    clearAddresses: () => setAddresses([])
  };
}