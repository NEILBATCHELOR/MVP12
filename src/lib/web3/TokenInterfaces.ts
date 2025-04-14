// Token interfaces for different ERC standards

// ERC20 - Fungible Token Interface
export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",

  // Write functions
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// ERC721 - Non-Fungible Token Interface
export const ERC721_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",

  // Write functions
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
];

// ERC1155 - Multi Token Interface
export const ERC1155_ABI = [
  // Read-only functions
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function uri(uint256 id) view returns (string)",

  // Write functions
  "function setApprovalForAll(address operator, bool approved)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",

  // Events
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
  "event URI(string value, uint256 indexed id)",
];

// ERC1400 - Security Token Interface
export const ERC1400_ABI = [
  // Core ERC20 functions
  ...ERC20_ABI,

  // Additional ERC1400 functions
  "function getDocument(bytes32 name) view returns (string, bytes32)",
  "function setDocument(bytes32 name, string uri, bytes32 documentHash)",
  "function isControllable() view returns (bool)",
  "function isIssuable() view returns (bool)",
  "function canTransferByPartition(bytes32 partition, address from, address to, uint256 value, bytes data) view returns (byte, bytes32, bytes32)",
  "function transferByPartition(bytes32 partition, address to, uint256 value, bytes data) returns (bytes32)",
  "function operatorTransferByPartition(bytes32 partition, address from, address to, uint256 value, bytes data, bytes operatorData) returns (bytes32)",
  "function issueByPartition(bytes32 partition, address tokenHolder, uint256 value, bytes data)",
  "function redeemByPartition(bytes32 partition, uint256 value, bytes data)",

  // Partition management
  "function totalPartitions() view returns (bytes32[])",
  "function balanceOfByPartition(bytes32 partition, address tokenHolder) view returns (uint256)",
  "function partitionsOf(address tokenHolder) view returns (bytes32[])",

  // Controller operations
  "function controllerTransfer(address from, address to, uint256 value, bytes data, bytes operatorData)",
  "function controllerRedeem(address tokenHolder, uint256 value, bytes data, bytes operatorData)",

  // Events
  "event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash)",
  "event TransferByPartition(bytes32 indexed fromPartition, address operator, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)",
  "event ChangedPartition(bytes32 indexed fromPartition, bytes32 indexed toPartition, uint256 value)",
  "event ControllerTransfer(address controller, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)",
  "event ControllerRedemption(address controller, address indexed tokenHolder, uint256 value, bytes data, bytes operatorData)",
];

// ERC3525 - Semi-Fungible Token Interface
export const ERC3525_ABI = [
  // ERC721 compatibility
  ...ERC721_ABI,

  // Additional ERC3525 functions
  "function valueDecimals() view returns (uint8)",
  "function balanceOf(uint256 tokenId) view returns (uint256)",
  "function slotOf(uint256 tokenId) view returns (uint256)",
  "function valueOf(uint256 tokenId) view returns (uint256)",
  "function approve(uint256 tokenId, address to, uint256 value) returns (bool)",
  "function allowance(uint256 tokenId, address operator) view returns (uint256)",
  "function transferValue(uint256 fromTokenId, uint256 toTokenId, uint256 value) returns (uint256)",
  "function transferValueFrom(uint256 fromTokenId, uint256 toTokenId, uint256 value) returns (uint256)",

  // Events
  "event TransferValue(uint256 indexed fromTokenId, uint256 indexed toTokenId, uint256 value)",
  "event ApprovalValue(uint256 indexed tokenId, address indexed operator, uint256 value)",
];

// ERC4626 - Tokenized Vault Standard Interface
export const ERC4626_ABI = [
  // ERC20 compatibility
  ...ERC20_ABI,

  // Additional ERC4626 functions
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function maxDeposit(address receiver) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function maxMint(address receiver) view returns (uint256)",
  "function previewMint(uint256 shares) view returns (uint256)",
  "function mint(uint256 shares, address receiver) returns (uint256)",
  "function maxWithdraw(address owner) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function maxRedeem(address owner) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",

  // Events
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
];
