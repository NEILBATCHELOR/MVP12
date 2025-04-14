# README Summaries

This document provides summaries of key README files found throughout the project.

## Main Web3 Integration README (`/src/lib/web3/README.md`)

The Web3 Integration module provides integrated blockchain support for multiple networks with a focus on consistent interfaces and chain-specific implementations. 

### Architecture
- **Adapters**: Chain-specific implementations of the `BlockchainAdapter` interface
- **Factory**: `BlockchainFactory` for creating and retrieving blockchain adapters
- **Transactions**: Chain-specific transaction handlers and a unified transaction interface
- **Crypto Utils**: Common cryptographic utilities and blockchain configuration

### Supported Blockchains
- **EVM-Compatible Chains**: Ethereum, Polygon, Avalanche, Optimism, Base, zkSync Era, Arbitrum, Mantle, Hedera
- **Non-EVM Chains**: Bitcoin (BTC), Ripple (XRP), Solana (SOL), Aptos, Sui, Stellar (XLM), NEAR Protocol

### Usage
The README provides code examples for:
- Using the `BlockchainAdapter` interface for common blockchain operations
- Transaction handling through the transaction system
- Adding support for new blockchains

## Wallet Services README (`/src/services/wallet/README.md`)

The Wallet Services module provides multi-chain wallet support with wallet generation, transaction handling, and address validation for each supported blockchain.

### Supported Blockchains
- **EVM-Compatible Chains**: Ethereum, Polygon, Avalanche, Optimism, Base, zkSync Era, Arbitrum, Mantle, Hedera
- **Non-EVM Chains**: Bitcoin (BTC), Ripple (XRP), Solana (SOL), Aptos, Sui, Stellar (XLM), NEAR

### Key Features
- **Wallet Generation**: Through the `WalletGeneratorFactory`
- **Transaction Handling**: Using the `TransactionHandlerRegistry`
- **WebSocket Connection**: Real-time wallet address reception

### Usage Examples
The README provides code examples for:
- Generating wallets for different blockchains
- Building and executing transactions
- Working with the WebSocket connection for real-time wallet addresses

## Main Application README (`/README.md`)

The main README describes "Chain Capital" as a blockchain-based financial infrastructure designed to enable investment professionals to securitize and tokenize traditional and alternative assets.

### Key Features
1. **Investor & Issuer Onboarding**: KYC/KYB, AML compliance, role-based access control
2. **Tokenization Engine**: Support for various ERC standards (ERC-1400, ERC-1155, ERC-3525, ERC-4626)
3. **Asset Lifecycle Management**: Automated corporate actions, redemptions, and distributions
4. **Compliance & Governance**: Guardian Compliance Oracles, policy enforcement
5. **Secondary Markets & Liquidity Solutions**: Tokenized financial products, cap table management

### Supported Use Cases
- Tokenizing Credit & Private Debt
- Issuance of Digital Securities
- Alternative Asset Repackaging
- Institutional Compliance & Risk Mitigation

### Integrations
1. **Onfido**: Digital identity verification and KYC compliance
   - Document verification
   - Biometric verification
   - Global compliance support
   - Implementation in `src/lib/services/onfidoService.ts`

2. **CUBE3**: Crypto wallet risk assessment and transaction security
   - Wallet risk assessment
   - Transaction security
   - Contract analysis
   - Implementation across several files in `src/lib/services/cube3Service.ts` and UI components

3. **Blockchain Integration**:
   - Support for multiple blockchains (EVM and non-EVM)
   - Transaction builders for each supported blockchain
   - Crypto utilities for key operations
   - Installation using `./install-blockchain-deps.sh`