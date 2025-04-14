import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { MyToken__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const tokenConfig = {
    name: "MyToken",              // From tokenForm.name
    symbol: "MTK",                // From tokenForm.symbol
    decimals: 18,                 // From tokenForm.decimals
    totalSupply: 1000000,         // From tokenForm.totalSupply
    owner: "0x...",               // From tokenForm.metadata.ownerAddress
    capSupply: true,              // From tokenForm.metadata.capSupply
    maxSupply: 2000000,           // Equal to totalSupply * 2 if capped
    mintable: true,               // From tokenForm.metadata.mintable
    burnable: true,               // From tokenForm.metadata.burnable
    pausable: true                // From tokenForm.metadata.pausable
  };

  // Provider and wallet setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying ERC20 token from: ${wallet.address}`);

  // Deploy the contract
  const TokenFactory = new MyToken__factory(wallet);
  const token = await TokenFactory.deploy(
    tokenConfig.name,
    tokenConfig.symbol,
    tokenConfig.decimals,
    tokenConfig.totalSupply,
    tokenConfig.owner || wallet.address,
    tokenConfig.capSupply,
    tokenConfig.capSupply ? tokenConfig.maxSupply : 0
  );

  await token.deployed();
  console.log(`Token deployed to: ${token.address}`);

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
        tokenConfig.owner || wallet.address,
        tokenConfig.capSupply,
        tokenConfig.capSupply ? tokenConfig.maxSupply : 0
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
