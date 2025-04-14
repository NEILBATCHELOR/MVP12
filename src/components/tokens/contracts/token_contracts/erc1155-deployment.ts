import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { MultiToken__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const tokenConfig = {
    name: "Multi Token Collection",   // From tokenForm.name
    symbol: "MTK",                    // From tokenForm.symbol
    baseUri: "ipfs://QmBaseURI/",     // From tokenForm.metadata.baseUri
    owner: "0x...",                   // From tokenForm.metadata.ownerAddress
    royaltyPercentage: 2.5,           // From tokenForm.metadata.royaltyPercentage
    royaltyReceiver: "0x...",         // From tokenForm.metadata.royaltyReceiver
    initialTokens: [                  // From tokenForm.metadata.tokens
      {
        id: 1,
        name: "Token 1",
        initialSupply: 1000,
        maxSupply: 10000,
        burnable: true,
        transferable: true,
        uri: "ipfs://QmToken1/",
        traits: "{}"
      },
      {
        id: 2,
        name: "Token 2",
        initialSupply: 1,
        maxSupply: 10,
        burnable: false,
        transferable: true,
        uri: "ipfs://QmToken2/",
        traits: "{}"
      }
    ],
    supportsBatchTransfers: true,     // From tokenForm.metadata.supportsBatchTransfers
    supportsOperatorFiltering: false  // From tokenForm.metadata.supportsOperatorFiltering
  };

  // Provider and wallet setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying ERC1155 Multi Token from: ${wallet.address}`);

  // Deploy the contract
  const TokenFactory = new MultiToken__factory(wallet);
  const token = await TokenFactory.deploy(
    tokenConfig.name,
    tokenConfig.symbol,
    tokenConfig.baseUri,
    tokenConfig.owner || wallet.address
  );

  await token.deployed();
  console.log(`Multi Token deployed to: ${token.address}`);

  // Create initial tokens
  console.log("Creating initial tokens...");
  for (const tokenData of tokenConfig.initialTokens) {
    console.log(`Creating token: ${tokenData.name} (ID: ${tokenData.id})`);
    const tx = await token.createToken(
      tokenData.id,
      tokenData.name,
      tokenData.initialSupply,
      tokenData.maxSupply,
      tokenData.burnable,
      tokenData.transferable,
      tokenData.uri || `${tokenConfig.baseUri}${tokenData.id}`
    );
    await tx.wait();
  }

  // Set royalty if specified
  if (tokenConfig.royaltyPercentage > 0) {
    const feeNumerator = Math.floor(tokenConfig.royaltyPercentage * 100); // 2.5% = 250 basis points
    const royaltyReceiver = tokenConfig.royaltyReceiver || tokenConfig.owner || wallet.address;
    
    console.log(`Setting royalty: ${tokenConfig.royaltyPercentage}% to ${royaltyReceiver}`);
    const tx = await token.setDefaultRoyalty(royaltyReceiver, feeNumerator);
    await tx.wait();
    console.log(`Royalty set successfully`);
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
        tokenConfig.baseUri,
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
