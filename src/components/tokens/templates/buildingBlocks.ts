export const BUILDING_BLOCKS = {
  compliance: [
    { id: "kyc", name: "KYC", description: "Know Your Customer verification" },
    {
      id: "aml",
      name: "AML",
      description: "Anti-Money Laundering checks",
    },
    {
      id: "accredited",
      name: "Accredited Investors Only",
      description: "Restrict to accredited/qualified investors",
    },
    {
      id: "jurisdiction",
      name: "Jurisdiction Restrictions",
      description: "Restrict based on investor jurisdiction",
    },
    {
      id: "max_investors",
      name: "Maximum Investors",
      description: "Limit the total number of investors",
    },
  ],
  features: [
    {
      id: "voting",
      name: "Voting",
      description: "Enable governance voting rights",
    },
    {
      id: "dividends",
      name: "Dividends",
      description: "Enable dividend/distribution payments",
    },
    {
      id: "transfer_restrictions",
      name: "Transfer Restrictions",
      description: "Restrict token transfers based on rules",
    },
    {
      id: "redemption",
      name: "Redemption Rights",
      description: "Allow token redemption under specific conditions",
    },
    {
      id: "lockup",
      name: "Lockup Period",
      description: "Enforce token lockup periods",
    },
    {
      id: "vesting",
      name: "Vesting Schedule",
      description: "Implement token vesting schedules",
    },
  ],
  governance: [
    {
      id: "issuer_control",
      name: "Issuer Control",
      description: "Issuer maintains full control over token",
    },
    {
      id: "board_approval",
      name: "Board Approval",
      description: "Require board approval for certain actions",
    },
    {
      id: "dao",
      name: "DAO Governance",
      description: "Decentralized Autonomous Organization governance",
    },
    {
      id: "multi_sig",
      name: "Multi-Signature",
      description: "Require multiple signatures for key actions",
    },
  ],
};
