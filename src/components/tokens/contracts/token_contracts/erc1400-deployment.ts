import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { SecurityToken__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Get configuration from the form (this would be passed from your React app)
  const tokenConfig = {
    name: "Security Token",          // From tokenForm.name
    symbol: "SEC",                   // From tokenForm.symbol 
    decimals: 18,                    // From tokenForm.metadata.decimals
    initialSupply: 1000000,          // Total initial supply
    securityType: "equity",          // From tokenForm.metadata.securityType
    issuerName: "Company Inc.",      // From tokenForm.metadata.issuerName
    defaultPartition: "Common Stock", // From tokenForm.metadata.defaultPartition
    owner: "0x...",                  // From tokenForm.metadata.ownerAddress
    multiplePartitions: true,        // From tokenForm.metadata.multiplePartitions
    partitions: [                    // From tokenForm.metadata.partitions
      {
        id: "partition-1",
        name: "Class A Shares",
        supply: "500000",
        investorClass: "accredited"
      },
      {
        id: "partition-2",
        name: "Class B Shares", 
        supply: "500000",
        investorClass: "institutional"
      }
    ],
    investors: [                     // From tokenForm.metadata.investorEligibility
      {
        address: "0x123...",
        eligiblePartitions: ["partition-1"],
        kycStatus: "approved",
        investorType: "accredited"
      }
    ],
    restrictedJurisdictions: [       // From tokenForm.metadata.restrictedJurisdictions
      "Cuba", "North Korea", "Iran"
    ],
    documents: [                     // Additional offering documents
      {
        name: "Offering Memorandum",
        uri: "ipfs://QmDoc1",
        documentHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("document1"))
      }
    ],
    transferRestrictions: true,      // From tokenForm.metadata.transferRestrictions
    minimumHoldingPeriod: 90         // 90 days holding period
  };

  // Provider and wallet setup
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log(`Deploying Security Token from: ${wallet.address}`);

  // Deploy the contract
  const SecurityTokenFactory = new SecurityToken__factory(wallet);
  const token = await SecurityTokenFactory.deploy(
    tokenConfig.name,
    tokenConfig.symbol,
    tokenConfig.decimals,
    tokenConfig.initialSupply,
    tokenConfig.securityType,
    tokenConfig.issuerName,
    tokenConfig.defaultPartition,
    tokenConfig.owner || wallet.address
  );

  await token.deployed();
  console.log(`Security Token deployed to: ${token.address}`);

  // Post-deployment configuration
  
  // Add restricted jurisdictions
  console.log("Setting restricted jurisdictions...");
  for (const jurisdiction of tokenConfig.restrictedJurisdictions) {
    console.log(`  - Adding restricted jurisdiction: ${jurisdiction}`);
    await token.addRestrictedJurisdiction(jurisdiction);
  }
  
  // Create additional partitions if multiple partitions are enabled
  if (tokenConfig.multiplePartitions && tokenConfig.partitions.length > 0) {
    console.log("Creating partitions...");
    for (const partition of tokenConfig.partitions) {
      if (partition.name !== tokenConfig.defaultPartition) {
        console.log(`  - Creating partition: ${partition.name}`);
        await token.createPartition(partition.name);
      }
    }
  }
  
  // Add approved investors with KYC and partition eligibility
  if (tokenConfig.investors.length > 0) {
    console.log("Setting up investors...");
    for (const investor of tokenConfig.investors) {
      console.log(`  - Setting up investor: ${investor.address}`);
      
      // Set KYC status
      await token.setKYC(investor.address, investor.kycStatus === "approved");
      
      // Set investor type
      await token.setInvestorType(investor.address, investor.investorType);
      
      // Set partition eligibility
      if (tokenConfig.multiplePartitions && investor.eligiblePartitions) {
        for (const partitionId of investor.eligiblePartitions) {
          // Find the corresponding partition
          const partition = tokenConfig.partitions.find(p => p.id === partitionId);
          if (partition) {
            const partitionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(partition.name));
            await token.setInvestorPartitionEligibility(investor.address, partitionHash, true);
          }
        }
      }
    }
  }
  
  // Set transfer restrictions if enabled
  if (tokenConfig.transferRestrictions && tokenConfig.minimumHoldingPeriod > 0) {
    console.log(`Setting minimum holding period: ${tokenConfig.minimumHoldingPeriod} days`);
    await token.setMinimumHoldingPeriod(tokenConfig.minimumHoldingPeriod);
  }
  
  // Add documents
  if (tokenConfig.documents.length > 0) {
    console.log("Adding documents...");
    for (const doc of tokenConfig.documents) {
      console.log(`  - Adding document: ${doc.name}`);
      await token.setDocument(doc.name, doc.uri, doc.documentHash);
    }
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
        tokenConfig.initialSupply,
        tokenConfig.securityType,
        tokenConfig.issuerName,
        tokenConfig.defaultPartition,
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
