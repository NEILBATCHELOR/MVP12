# Context Directory

This directory contains React Context providers that manage global state and provide functionality across the application. These context providers create a centralized way to share state without prop drilling.

## Key Files

### NotificationContext.tsx

A context provider for managing application notifications with features for:

- Managing notification state
- Adding notifications with automatic UUID generation
- Dismissing individual notifications
- Marking notifications as read
- Clearing all notifications
- Persisting notifications to local storage
- Browser notification integration

#### Key Interfaces:
- `NotificationItem`: Structure of notification data
- `NotificationContextType`: API exposed by the context

#### Key Functions:
- `addNotification()`: Add a new notification
- `dismissNotification()`: Remove a notification by ID
- `markAsRead()`: Mark a notification as read
- `markAllAsRead()`: Mark all notifications as read
- `clearAll()`: Remove all notifications

#### Usage:
```tsx
import { useNotifications } from '@/context/NotificationContext';

function MyComponent() {
  const { notifications, addNotification } = useNotifications();
  
  const handleAction = () => {
    addNotification({
      title: 'Action Completed',
      description: 'Your action was successful',
      type: 'system'
    });
  };
  
  return (
    <div>
      <button onClick={handleAction}>Do Action</button>
    </div>
  );
}
```

### Web3Context.tsx

A context provider for web3/blockchain integration that manages:

- Wallet connection state
- Chain ID information
- Account address
- Message signing
- Connection/disconnection logic

#### Key Interfaces:
- `Web3ContextType`: API exposed by the context

#### Key Functions:
- `connect()`: Connect to a wallet
- `disconnect()`: Disconnect from a wallet
- `signMessage()`: Sign a message with the connected wallet

#### Usage:
```tsx
import { useWeb3 } from '@/context/Web3Context';

function WalletComponent() {
  const { account, connect, disconnect, signMessage } = useWeb3();
  
  return (
    <div>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={() => signMessage('Hello')}>Sign Message</button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Context Organization

Note that there is also a separate `contexts` (plural) directory that contains additional context providers. This directory appears to focus on more specialized contexts, while the `contexts` directory contains more foundational contexts like authentication.

## Best Practices

1. Use the context hook pattern (`useNotifications`, `useWeb3`) for accessing context
2. Provide default values that make sense even when accessed outside providers
3. Include proper TypeScript typing for context values
4. Handle error states appropriately
5. Implement proper cleanup in `useEffect` hooks
6. Keep context providers focused on specific concerns
7. Document the API exposed by each context provider