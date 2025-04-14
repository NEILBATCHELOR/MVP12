import { JsonRpcProvider, Wallet } from "ethers";
import * as dotenv from "dotenv";
import { MyNFT__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const nftConfig = {
    name: "MyNFT Collection",      // From tokenForm.name
    symbol: "MNFT",                // From tokenForm.symbol
    baseURI: "ipfs://Qm...",       // From tokenForm.metadata.baseUri
    owner: "0x...",                // From tokenForm.metadata.ownerAddress
    isTransferable: true,          // From tokenForm.metadata.isTransferable
    hasTransferRestrictions: false, // From tokenForm.metadata.transferRestrictions
    royaltyPercentage: 5.0,        // From tokenForm.metadata.royaltyPercentage
    royaltyReceiver: "0x..."       // From tokenForm.metadata.royaltyReceiver
  };

  // Provider and wallet setup
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying NFT collection from: ${wallet.address}`);

  // Deploy the contract
  const NFTFactory = new MyNFT__factory(wallet);
  const nft = await NFTFactory.deploy(
    nftConfig.name,
    nftConfig.symbol,
    nftConfig.baseURI,
    nftConfig.owner || wallet.address,
    nftConfig.isTransferable,
    nftConfig.hasTransferRestrictions
  );

  // Wait for deployment
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`NFT collection deployed to: ${nftAddress}`);

  // Set royalty if specified
  if (nftConfig.royaltyPercentage > 0) {
    const feeNumerator = Math.floor(nftConfig.royaltyPercentage * 100); // 5% = 500 basis points
    const royaltyReceiver = nftConfig.royaltyReceiver || nftConfig.owner || wallet.address;
    
    console.log(`Setting royalty: ${nftConfig.royaltyPercentage}% to ${royaltyReceiver}`);
    const tx = await nft.setDefaultRoyalty(royaltyReceiver, feeNumerator);
    await tx.wait();
    console.log(`Royalty set successfully`);
  }

  // Verify on Etherscan (if on a supported network)
  console.log("Waiting for confirmations...");
  const receipt = await nft.deploymentTransaction()?.wait(5); // Wait for 5 confirmations
  
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [
        nftConfig.name,
        nftConfig.symbol,
        nftConfig.baseURI,
        nftConfig.owner || wallet.address,
        nftConfig.isTransferable,
        nftConfig.hasTransferRestrictions
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
