import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TokenizedVault__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const vaultConfig = {
    name: "Yield Vault",                    // From tokenForm.name
    symbol: "yVault",                       // From tokenForm.symbol
    underlyingAsset: "0x...",               // From tokenForm.metadata.underlyingAsset
    yieldStrategy: "Lending",               // From tokenForm.metadata.yieldStrategy
    owner: "0x...",                         // From tokenForm.metadata.ownerAddress
    initialNav: "1.0",                      // From tokenForm.metadata.initialNAV
    managementFee: 200,                     // From tokenForm.metadata.managementFee (2.00%)
    performanceFee: 2000,                   // From tokenForm.metadata.performanceFee (20.00%)
    feeRecipient: "0x...",                  // From tokenForm.metadata.feeReceiverAddress
    minDeposit: ethers.utils.parseEther("1"), // From tokenForm.metadata.minDeposit
    maxDeposit: 0,                          // From tokenForm.metadata.maxDeposit (0 = unlimited)
    redemptionNoticePeriod: 7,              // From tokenForm.metadata.redemptionNoticeDays
    autoNavEnabled: false,                  // From tokenForm.metadata.navOracleEnabled
    navOracleAddress: "0x..."               // From tokenForm.metadata.oracleAddress
  };

  // Provider and wallet setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying Tokenized Vault from: ${wallet.address}`);

  // Deploy the contract
  const VaultFactory = new TokenizedVault__factory(wallet);
  const vault = await VaultFactory.deploy(
    vaultConfig.underlyingAsset,     // The underlying asset address (e.g., USDC)
    vaultConfig.name,                // Vault name
    vaultConfig.symbol,              // Vault symbol
    vaultConfig.yieldStrategy,       // Description of yield strategy
    vaultConfig.managementFee,       // Management fee (as basis points, 200 = 2.00%)
    vaultConfig.performanceFee,      // Performance fee (as basis points, 2000 = 20.00%)
    vaultConfig.feeRecipient,        // Fee recipient address
    vaultConfig.owner || wallet.address  // Owner address
  );

  await vault.deployed();
  console.log(`Tokenized Vault deployed to: ${vault.address}`);

  // Post-deployment configuration
  console.log("Configuring vault parameters...");
  
  // Set minimum deposit
  if (vaultConfig.minDeposit > 0) {
    console.log(`Setting minimum deposit: ${ethers.utils.formatEther(vaultConfig.minDeposit)} tokens`);
    await vault.setMinDeposit(vaultConfig.minDeposit);
  }
  
  // Set maximum deposit if a limit is specified
  if (vaultConfig.maxDeposit > 0) {
    console.log(`Setting maximum deposit: ${ethers.utils.formatEther(vaultConfig.maxDeposit)} tokens`);
    await vault.setMaxDeposit(vaultConfig.maxDeposit);
  }
  
  // Set redemption notice period
  if (vaultConfig.redemptionNoticePeriod > 0) {
    console.log(`Setting redemption notice period: ${vaultConfig.redemptionNoticePeriod} days`);
    await vault.setRedemptionNoticePeriod(vaultConfig.redemptionNoticePeriod);
  }
  
  // Configure NAV oracle if provided
  if (vaultConfig.navOracleAddress !== "0x...") {
    console.log(`Setting NAV oracle: ${vaultConfig.navOracleAddress}`);
    await vault.setNavOracleAddress(vaultConfig.navOracleAddress);
    
    console.log(`Setting auto NAV updates: ${vaultConfig.autoNavEnabled}`);
    await vault.setAutoNavEnabled(vaultConfig.autoNavEnabled);
  }

  // Verify on Etherscan (if on a supported network)
  console.log("Waiting for confirmations...");
  await vault.deployTransaction.wait(5); // Wait for 5 confirmations
  
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: vault.address,
      constructorArguments: [
        vaultConfig.underlyingAsset,
        vaultConfig.name,
        vaultConfig.symbol,
        vaultConfig.yieldStrategy,
        vaultConfig.managementFee,
        vaultConfig.performanceFee,
        vaultConfig.feeRecipient,
        vaultConfig.owner || wallet.address
      ],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
