Key Components of the Solution
I've created two contracts that work together to provide a comprehensive tokenized fund solution with ERC-1155 to ERC-20 swap functionality:

FundSharesToken (ERC-1155) - Represents different share classes or tranches of your fund
ERC1155ToERC20SwapContract - Handles the redemption process from ERC-1155 to ERC-20

How the Swap Contract Works
The swap contract allows investors to:

Redeem ERC-1155 tokens for ERC-20 stablecoins based on the current NAV
Handle different share classes with different NAV multipliers (e.g., senior vs. junior tranches)
Enforce compliance by only allowing verified investors
Manage redemption periods with caps to prevent liquidity issues
Process redemptions in batches for gas efficiency

Key Features

NAV-Based Pricing: Uses Chainlink Oracle to get accurate pricing for redemptions
Tranched Structure: Supports different token IDs with different properties (risk levels, redemption delays, etc.)
KYC/AML Compliance: Only verified investors can redeem tokens
Redemption Queue: Orderly processing of redemptions with periodic caps
Fee Management: Configurable redemption fees for the fund manager

Integration with Your Existing System
This solution integrates with your existing TokenizedCapTable contract by:

Using the same NAV Oracle for consistent pricing
Maintaining the same KYC/AML verification system
Respecting the same redemption caps and periods

Example Usage Scenario

Fund manager creates different token types (e.g., Senior Tranche, Mezzanine Tranche, Junior Tranche)
Investors receive ERC-1155 tokens representing their fund shares
When an investor wants to redeem, they submit a redemption request to the swap contract
The contract calculates the equivalent ERC-20 amount based on NAV and token properties
The redemption is queued and processed according to the redemption schedule

Advantages Over Your Current Contract

Multi-Class Support: Can handle multiple share classes in one contract
Advanced Redemption Logic: Different rules for different tranches
Compliance Built-In: Transfer restrictions and KYC verification
Liquidity Management: Controlled redemption process
Gas Efficiency: Batch processing for redemptions

Next Steps
To implement this solution:

Deploy the FundSharesToken contract for your ERC-1155 tokens
Deploy the ERC1155ToERC20SwapContract
Configure token types, NAV multipliers, and redemption parameters
Add verified investors to both contracts
Add the swap contract as an authorized operator for the FundSharesToken