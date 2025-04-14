import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { SemiFungibleToken__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const tokenConfig = {
    name: "Semi Fungible Token",      // From tokenForm.name
    symbol: "SFT",                    // From tokenForm.symbol
    decimals: 18,                     // From tokenForm.metadata.decimals
    totalSupply: 1000000,             // From tokenForm.totalSupply
    owner: "0x...",                   // From tokenForm.metadata.ownerAddress
    royaltyPercentage: 2.5,           // From tokenForm.metadata.royaltyPercentage
    royaltyReceiver: "0x...",         // From tokenForm.metadata.royaltyReceiver
    slots: [                          // From tokenForm.metadata.slots
      {
        id: 1,
        name: "Investment Fund A",
        description: "High-yield investment fund",
        fungibilityType: "semi-fungible",
        navPricingMechanism: "manual",
        valueUnit: "USD",
        maxSupply: 100000
      },
      {
        id: 2,
        name: "Investment Fund B",
        description: "Low-risk stable fund",
        fungibilityType: "fungible",
        navPricingMechanism: "oracle",
        valueUnit: "USD",
        maxSupply: 500000
      }
    ],
    initialTokens: [                  // From tokenForm.metadata.tokens
      {
        slotId: 1,
        name: "Token A-1",
        balance: 1000,
        allowSplitting: true,
        allowMerging: true,
        metadataUri: "ipfs://Qm..."
      },
      {
        slotId: 2,
        name: "Token B-1",
        balance: 2000,
        allowSplitting: true,
        allowMerging: true,
        metadataUri: "ipfs://Qm..."
      }
    ],
    navValues: {                      // From tokenForm.metadata.navValues
      "1": "1050000000000000000",     // 1.05 with 18 decimals
      "2": "980000000000000000"       // 0.98 with 18 decimals
    }
  };

  // Provider and wallet setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying Semi-Fungible Token from: ${wallet.address}`);

  // Deploy the contract
  const TokenFactory = new SemiFungibleToken__factory(wallet);
  const token = await TokenFactory.deploy(
    tokenConfig.name,
    tokenConfig.symbol,
    tokenConfig.decimals,
    tokenConfig.totalSupply,
    tokenConfig.owner || wallet.address
  );

  await token.deployed();
  console.log(`Semi-Fungible Token deployed to: ${token.address}`);

  // Create slots
  console.log("Creating slots...");
  for (const slot of tokenConfig.slots) {
    console.log(`Creating slot: ${slot.name} (ID: ${slot.id})`);
    await token.createSlot(
      slot.id,
      slot.name,
      slot.description,
      slot.fungibilityType,
      slot.navPricingMechanism,
      slot.valueUnit,
      slot.maxSupply
    );
    
    // If custom NAV is specified, update it
    if (tokenConfig.navValues && tokenConfig.navValues[slot.id.toString()]) {
      console.log(`  - Setting NAV for slot ${slot.id} to ${tokenConfig.navValues[slot.id.toString()]}`);
      await token.updateNav(slot.id, tokenConfig.navValues[slot.id.toString()]);
    }
  }

  // Mint initial tokens
  console.log("Minting initial tokens...");
  for (const tokenData of tokenConfig.initialTokens) {
    console.log(`Minting token: ${tokenData.name} (Slot: ${tokenData.slotId}, Value: ${tokenData.balance})`);
    await token.mintToken(
      tokenConfig.owner || wallet.address,
      tokenData.slotId,
      tokenData.balance,
      tokenData.name,
      tokenData.allowSplitting,
      tokenData.allowMerging,
      tokenData.metadataUri
    );
  }

  // Set royalty if specified
  if (tokenConfig.royaltyPercentage > 0) {
    const feeNumerator = Math.floor(tokenConfig.royaltyPercentage * 100); // 2.5% = 250 basis points
    const royaltyReceiver = tokenConfig.royaltyReceiver || tokenConfig.owner || wallet.address;
    
    console.log(`Setting royalty: ${tokenConfig.royaltyPercentage}% to ${royaltyReceiver}`);
    await token.setDefaultRoyalty(royaltyReceiver, feeNumerator);
  }

  // Verify on Etherscan (if on a supported network)
  console.log("Waiting for confirmations...");
  await token.deployTransaction.wait(5); // Wait for 5 confirmations
  
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [
        tokenConfig.name,
        tokenConfig.symbol,
        tokenConfig.decimals,
        tokenConfig.totalSupply,
        tokenConfig.owner || wallet.address
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
