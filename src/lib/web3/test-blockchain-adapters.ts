/**
 * Test script for blockchain adapters
 * 
 * This script demonstrates how to use the blockchain adapters
 * and transaction builders to interact with different blockchains.
 * 
 * To run:
 * 1. Install dependencies: ./install-blockchain-deps.sh
 * 2. Run with ts-node: npx ts-node src/lib/web3/test-blockchain-adapters.ts
 */

import { BlockchainFactory } from './BlockchainFactory';
import { BlockchainType, TransactionBuilderFactory } from './transactions/TransactionBuilderFactory';

async function testBlockchainAdapters() {
  try {
    console.log('🔍 Testing Blockchain Adapters...');
    
    // Test EVM (Ethereum) adapter
    console.log('\n🔷 Testing Ethereum adapter:');
    const ethereumAdapter = BlockchainFactory.getAdapter('ethereum');
    console.log('Chain name:', ethereumAdapter.getChainName ? ethereumAdapter.getChainName() : 'ethereum');
    console.log('Chain ID:', ethereumAdapter.getChainId ? ethereumAdapter.getChainId() : '(Not available)');
    
    // Generate an Ethereum address from a random public key
    const randomKey = '0x' + Buffer.from(Math.random().toString()).toString('hex').padEnd(64, '0');
    const ethAddress = await ethereumAdapter.generateAddress(randomKey);
    console.log('Generated address:', ethAddress);
    console.log('Valid address check:', ethereumAdapter.isValidAddress(ethAddress));
    
    // Test Solana adapter
    console.log('\n🔶 Testing Solana adapter:');
    const solanaAdapter = BlockchainFactory.getAdapter('solana');
    console.log('Chain name:', solanaAdapter.getChainName ? solanaAdapter.getChainName() : 'solana');
    console.log('Chain ID:', solanaAdapter.getChainId ? solanaAdapter.getChainId() : '(Not available)');
    
    // Test Ripple adapter
    console.log('\n💧 Testing Ripple adapter:');
    const rippleAdapter = BlockchainFactory.getAdapter('ripple');
    console.log('Chain name:', rippleAdapter.getChainName ? rippleAdapter.getChainName() : 'ripple');
    console.log('Chain ID:', rippleAdapter.getChainId ? rippleAdapter.getChainId() : '(Not available)');
    
    // Test NEAR adapter
    console.log('\n🌐 Testing NEAR adapter:');
    const nearAdapter = BlockchainFactory.getAdapter('near');
    console.log('Chain name:', nearAdapter.getChainName ? nearAdapter.getChainName() : 'near');
    console.log('Chain ID:', nearAdapter.getChainId ? nearAdapter.getChainId() : '(Not available)');
    
    // Test Transaction Builders
    console.log('\n🏗️ Testing Transaction Builders:');
    
    // Check all supported blockchains
    const supportedChains = Object.values(BlockchainType);
    console.log('Supported blockchains:', supportedChains);
    
    // Check EVM-compatible chains
    const evmChains = TransactionBuilderFactory.getEVMBlockchains();
    console.log('EVM-compatible blockchains:', evmChains);
    
    // Check non-EVM chains
    const nonEvmChains = TransactionBuilderFactory.getNonEVMBlockchains();
    console.log('Non-EVM blockchains:', nonEvmChains);
    
    console.log('\n✅ Blockchain adapter tests completed successfully!');
    console.log('Note: Some functionality requires a working RPC connection to test properly.');
    console.log('To test specific blockchain functionality, you need to provide valid provider details and credentials.');
  } catch (error) {
    console.error('❌ Error testing blockchain adapters:', error);
  }
}

// Uncomment the following line to run the tests when this file is executed directly
// testBlockchainAdapters();

export { testBlockchainAdapters }; 