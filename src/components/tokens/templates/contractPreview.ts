import { TokenFormState } from "./tokenTemplate";

export const generateContractPreview = (tokenForm: TokenFormState): string => {
  const { name, symbol, standard, blocks, metadata, totalSupply, decimals } =
    tokenForm;
  let preview = "";

  if (standard === "ERC-20") {
    preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC20, Ownable {
    constructor() ERC20("${name}", "${symbol}") {
        // Initial setup
        _mint(msg.sender, ${totalSupply} * 10**${decimals});
    }
`;

    // Add compliance features
    if (blocks.compliance.includes("KYC")) {
      preview += `
    // KYC Implementation
    mapping(address => bool) private _kycApproved;
    
    function setKycStatus(address account, bool status) external onlyOwner {
        _kycApproved[account] = status;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(from == address(0) || _kycApproved[from], "KYC not approved for sender");
        require(to == address(0) || _kycApproved[to], "KYC not approved for recipient");
    }
`;
    }

    // Add features
    if (blocks.features.includes("Dividends")) {
      preview += `
    // Dividend Distribution
    function distributeTokenDividends(uint256 amount) external onlyOwner {
        // Dividend distribution logic
    }
`;
    }

    preview += "}"; // Close contract
  } else if (standard === "ERC-1400") {
    preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC20, Ownable {
    // ERC-1400 Security Token Implementation
    constructor() ERC20("${name}", "${symbol}") {
        // Initial setup
        _mint(msg.sender, ${totalSupply} * 10**${decimals});
    }
`;

    // Add compliance features
    if (blocks.compliance.length > 0) {
      preview += `
    // Compliance Controls
    mapping(address => bool) private _whitelisted;
    ${metadata.whitelistEnabled ? "bool private _whitelistEnabled = true;" : "bool private _whitelistEnabled = false;"}
    
    function setWhitelistStatus(address account, bool status) external onlyOwner {
        _whitelisted[account] = status;
    }
    
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        _whitelistEnabled = enabled;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (_whitelistEnabled) {
            require(from == address(0) || _whitelisted[from], "Sender not whitelisted");
            require(to == address(0) || _whitelisted[to], "Recipient not whitelisted");
        }
    }
`;
    }

    // Add jurisdiction restrictions if any
    if (
      metadata.jurisdictionRestrictions &&
      metadata.jurisdictionRestrictions.length > 0
    ) {
      preview += `
    // Jurisdiction Restrictions
    mapping(string => bool) private _restrictedJurisdictions;
    
    constructor() {
        ${metadata.jurisdictionRestrictions.map((j) => `_restrictedJurisdictions["${j}"] = true;`).join("\n        ")}
    }
    
    function setJurisdictionRestriction(string memory jurisdiction, bool restricted) external onlyOwner {
        _restrictedJurisdictions[jurisdiction] = restricted;
    }
    
    function isJurisdictionRestricted(string memory jurisdiction) public view returns (bool) {
        return _restrictedJurisdictions[jurisdiction];
    }
`;
    }

    preview += "}"; // Close contract
  } else if (standard === "ERC-3525") {
    preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC721Enumerable, Ownable {
    // ERC-3525 Semi-Fungible Token Implementation for Structured Products
    
    // Token details
    string private _name = "${name}";
    string private _symbol = "${symbol}";
    uint8 private _decimals = ${decimals};
    uint256 private _totalSupply = ${totalSupply};
    
    // Tranche/Slot structure
    struct Tranche {
        uint256 slotId;
        string name;
        uint256 value;
        uint256 interestRate; // Basis points (1% = 100)
    }
    
    // Mapping from slot ID to tranche details
    mapping(uint256 => Tranche) private _tranches;
    
    // Mapping from token ID to slot ID
    mapping(uint256 => uint256) private _tokenSlots;
    
    // Mapping from token ID to value
    mapping(uint256 => uint256) private _tokenValues;
    
    // Issuance and maturity dates
    uint256 private _issuanceDate = ${metadata.issuanceDate ? `${new Date(metadata.issuanceDate).getTime() / 1000}` : "block.timestamp"};
    uint256 private _maturityDate = ${metadata.maturityDate ? `${new Date(metadata.maturityDate).getTime() / 1000}` : "block.timestamp + 157680000"}; // Default: 5 years
    
    // Conversion rate to ERC-20
    uint256 private _conversionRate = ${metadata.conversionRate || 100};
    
    // Events
    event SlotCreated(uint256 indexed slotId, string name, uint256 value, uint256 interestRate);
    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 indexed slotId, uint256 value);
    
    constructor() ERC721("${name}", "${symbol}") {
        // Initialize tranches
${metadata.tranches && metadata.tranches.map ? metadata.tranches.map((tranche) => `        _createTranche(${tranche.id}, "${tranche.name}", ${tranche.value}, ${tranche.interestRate * 100});`).join("\n") : ""}
    }
    
    function _createTranche(uint256 slotId, string memory name, uint256 value, uint256 interestRate) internal {
        require(_tranches[slotId].slotId == 0, "Tranche already exists");
        _tranches[slotId] = Tranche(slotId, name, value, interestRate);
        emit SlotCreated(slotId, name, value, interestRate);
    }
    
    function mintToken(address to, uint256 slotId, uint256 value) external onlyOwner {
        require(_tranches[slotId].slotId != 0, "Tranche does not exist");
        require(value > 0, "Value must be greater than 0");
        
        uint256 tokenId = totalSupply() + 1;
        _mint(to, tokenId);
        _tokenSlots[tokenId] = slotId;
        _tokenValues[tokenId] = value;
        
        emit TokenMinted(to, tokenId, slotId, value);
    }
    
    function getTokenSlot(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenSlots[tokenId];
    }
    
    function getTokenValue(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenValues[tokenId];
    }
    
    function getTrancheDetails(uint256 slotId) external view returns (string memory, uint256, uint256) {
        require(_tranches[slotId].slotId != 0, "Tranche does not exist");
        Tranche memory tranche = _tranches[slotId];
        return (tranche.name, tranche.value, tranche.interestRate);
    }
    
    function getMaturityDate() external view returns (uint256) {
        return _maturityDate;
    }
    
    function getIssuanceDate() external view returns (uint256) {
        return _issuanceDate;
    }
    
    function getConversionRate() external view returns (uint256) {
        return _conversionRate;
    }
`;

    // Add compliance features
    if (blocks.compliance.length > 0) {
      preview += `
    // Compliance Controls
    mapping(address => bool) private _whitelisted;
    ${metadata.whitelistEnabled ? "bool private _whitelistEnabled = true;" : "bool private _whitelistEnabled = false;"}
    
    function setWhitelistStatus(address account, bool status) external onlyOwner {
        _whitelisted[account] = status;
    }
    
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        _whitelistEnabled = enabled;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (_whitelistEnabled) {
            require(from == address(0) || _whitelisted[from], "Sender not whitelisted");
            require(to == address(0) || _whitelisted[to], "Recipient not whitelisted");
        }
    }
`;
    }

    preview += "}"; // Close contract
  }

  return preview;
};
