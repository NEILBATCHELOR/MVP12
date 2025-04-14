Overview of the Swap Contract
I've developed a CliffwaterWrappedToken contract to handle the conversion between ERC-1400 security tokens and ERC-20 tokens, which enables improved liquidity while maintaining compliance with security token regulations.
Key Features

Compliance-Preserving Wrapper:

Tokenizes the Cliffwater Interval Credit Fund using ERC-1400 standard for regulatory compliance
Wraps these security tokens into ERC-20 tokens for exchange trading
Maintains KYC/AML restrictions during transfers between wallets


NAV-Based Conversion:

Uses Chainlink Oracle for price feeds to determine current NAV
Calculates conversion rates between underlying security tokens and wrapped tokens
Ensures accurate value representation during wrapping/unwrapping


Redemption Management:

Implements redemption queue for processing unwrap requests
Enforces redemption caps and periods from underlying fund
Prevents redemption requests that exceed fund liquidity limits


Owner Controls:

Allows fund administrators to process redemption requests in batches
Provides emergency pause functionality
Enables NAV updates when oracle data is unavailable



How It Works

Wrapping Process (ERC-1400 → ERC-20):
CopyInvestor → Deposit ERC-1400 Security Tokens → Receive Wrapped ERC-20 Tokens
The investor deposits their ERC-1400 tokens into the contract, which locks them and mints equivalent ERC-20 tokens based on current NAV.
Trading on Exchanges:
CopyInvestor → Trade Wrapped ERC-20 Tokens on Exchanges
The wrapped ERC-20 tokens can be freely traded on compatible exchanges while still maintaining compliance checks.
Unwrapping Process (ERC-20 → ERC-1400):
CopyInvestor → Burn Wrapped ERC-20 Tokens → Queue Redemption Request → Receive ERC-1400 Tokens
When an investor wants to redeem, they unwrap their ERC-20 tokens, which queues a redemption request in the underlying fund.
Redemption Processing:
CopyFund Manager → Process Redemption Queue → Transfer Assets to Investors
Fund administrators process the redemption queue according to fund rules and liquidity constraints.

Advantages of This Implementation

Maintains Compliance: All transfers, even on secondary markets, respect the KYC/AML requirements of the underlying security token.
Liquidity Efficiency: Allows trading on ERC-20 compatible exchanges while respecting redemption caps and fund liquidity.
NAV Accuracy: Real-time NAV updates through oracle integration ensure accurate token valuation.
Redemption Controls: Implements the interval fund's liquidity management with weekly redemption limits.
Regulatory Alignment: Follows the security token standards while enabling secondary market trading.