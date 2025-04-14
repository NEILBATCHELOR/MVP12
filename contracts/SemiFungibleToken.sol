// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@solvprotocol/erc-3525/contracts/ERC3525.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact security@semift.com
contract SemiFungibleToken is ERC3525, Ownable, ERC2981 {
    using Strings for uint256;
    
    // Slot configuration
    struct SlotConfig {
        string name;
        string description;
        string fungibilityType; // "fungible", "semi-fungible", "non-fungible"
        string navPricingMechanism; // "oracle", "manual", "formula"
        string valueUnit;
        uint256 maxSupply;
        bool exists;
    }
    
    // Token configuration
    struct TokenConfig {
        uint256 slotId;
        string name;
        bool allowSplitting;
        bool allowMerging;
        string metadataUri;
    }
    
    // Slots management
    mapping(uint256 => SlotConfig) private _slotConfigs;
    uint256[] private _slotIds;
    
    // Tokens management
    mapping(uint256 => TokenConfig) private _tokenConfigs;
    
    // NAV (Net Asset Value) information
    mapping(uint256 => uint256) private _slotNavs; // slot ID => NAV (in wei)
    mapping(uint256 => uint256) private _slotNavLastUpdated; // slot ID => last update timestamp
    
    // Events
    event SlotCreated(uint256 indexed slotId, string name, string valueUnit);
    event SlotNavUpdated(uint256 indexed slotId, uint256 oldNav, uint256 newNav);
    event TokenMinted(uint256 indexed tokenId, uint256 indexed slotId, uint256 value);
    event SplitToken(uint256 indexed fromTokenId, uint256 indexed toTokenId, uint256 value);
    event MergeToken(uint256 indexed fromTokenId, uint256 indexed toTokenId, uint256 value);
    
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        address initialOwner_
    ) ERC3525(name_, symbol_, decimals_) Ownable(initialOwner_) {
        // Set total supply. For ERC3525, this is more of a reference than an enforced cap.
        _totalSupply = totalSupply_ * (10 ** decimals_);
    }
    
    ////////////////
    // SLOT MANAGEMENT
    ////////////////
    
    // Create a new slot
    function createSlot(
        uint256 slotId,
        string memory name,
        string memory description,
        string memory fungibilityType,
        string memory navPricingMechanism,
        string memory valueUnit,
        uint256 maxSupply
    ) public onlyOwner {
        require(!_slotConfigs[slotId].exists, "Slot already exists");
        
        _slotConfigs[slotId] = SlotConfig({
            name: name,
            description: description,
            fungibilityType: fungibilityType,
            navPricingMechanism: navPricingMechanism,
            valueUnit: valueUnit,
            maxSupply: maxSupply,
            exists: true
        });
        
        _slotIds.push(slotId);
        
        // Set initial NAV to 1.0 (scaled by decimals)
        _slotNavs[slotId] = 10 ** decimals();
        _slotNavLastUpdated[slotId] = block.timestamp;
        
        emit SlotCreated(slotId, name, valueUnit);
    }
    
    // Get all available slots
    function getSlots() public view returns (uint256[] memory) {
        return _slotIds;
    }
    
    // Get slot details
    function getSlotConfig(uint256 slotId) public view returns (
        string memory name,
        string memory description,
        string memory fungibilityType,
        string memory navPricingMechanism,
        string memory valueUnit,
        uint256 maxSupply
    ) {
        require(_slotConfigs[slotId].exists, "Slot does not exist");
        SlotConfig storage config = _slotConfigs[slotId];
        
        return (
            config.name,
            config.description,
            config.fungibilityType,
            config.navPricingMechanism,
            config.valueUnit,
            config.maxSupply
        );
    }
    
    ////////////////
    // NAV MANAGEMENT
    ////////////////
    
    // Update NAV for a slot
    function updateNav(uint256 slotId, uint256 newNav) public onlyOwner {
        require(_slotConfigs[slotId].exists, "Slot does not exist");
        uint256 oldNav = _slotNavs[slotId];
        _slotNavs[slotId] = newNav;
        _slotNavLastUpdated[slotId] = block.timestamp;
        
        emit SlotNavUpdated(slotId, oldNav, newNav);
    }
    
    // Get current NAV for a slot
    function getNav(uint256 slotId) public view returns (uint256, uint256) {
        require(_slotConfigs[slotId].exists, "Slot does not exist");
        return (_slotNavs[slotId], _slotNavLastUpdated[slotId]);
    }
    
    ////////////////
    // TOKEN MANAGEMENT
    ////////////////
    
    // Mint a new token in a specific slot with value
    function mintToken(
        address to,
        uint256 slotId,
        uint256 value,
        string memory tokenName,
        bool allowSplitting,
        bool allowMerging,
        string memory metadataUri
    ) public onlyOwner returns (uint256) {
        require(_slotConfigs[slotId].exists, "Slot does not exist");
        
        // Check if minting would exceed max supply for the slot
        if (_slotConfigs[slotId].maxSupply > 0) {
            // Calculate total value in this slot
            uint256 totalValueInSlot = 0;
            uint256[] memory tokenIds = _getTokensBySlot(slotId);
            
            for (uint i = 0; i < tokenIds.length; i++) {
                totalValueInSlot += valueOf(tokenIds[i]);
            }
            
            require(totalValueInSlot + value <= _slotConfigs[slotId].maxSupply, "Would exceed max supply for slot");
        }
        
        uint256 tokenId = _mint(to, slotId, value);
        
        // Store token configuration
        _tokenConfigs[tokenId] = TokenConfig({
            slotId: slotId,
            name: tokenName,
            allowSplitting: allowSplitting,
            allowMerging: allowMerging,
            metadataUri: metadataUri
        });
        
        emit TokenMinted(tokenId, slotId, value);
        
        return tokenId;
    }
    
    // Helper function to get all tokens in a slot (for supply calculation)
    function _getTokensBySlot(uint256 slotId) internal view returns (uint256[] memory) {
        uint256 totalTokens = _allTokens.length;
        uint256[] memory tokensInSlot = new uint256[](totalTokens);
        uint256 count = 0;
        
        for (uint i = 0; i < totalTokens; i++) {
            uint256 tokenId = _allTokens[i];
            if (slotOf(tokenId) == slotId) {
                tokensInSlot[count] = tokenId;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = tokensInSlot[i];
        }
        
        return result;
    }
    
    // Split a token into two parts
    function splitToken(
        uint256 tokenId,
        uint256 value,
        string memory newTokenName
    ) public returns (uint256) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not token owner or approved");
        require(_tokenConfigs[tokenId].allowSplitting, "Token does not allow splitting");
        
        uint256 slotId = slotOf(tokenId);
        uint256 newTokenId = _mintValue(_ownerOf(tokenId), slotId, value, tokenId);
        
        // Set config for new token
        _tokenConfigs[newTokenId] = TokenConfig({
            slotId: slotId,
            name: newTokenName,
            allowSplitting: _tokenConfigs[tokenId].allowSplitting,
            allowMerging: _tokenConfigs[tokenId].allowMerging,
            metadataUri: _tokenConfigs[tokenId].metadataUri
        });
        
        emit SplitToken(tokenId, newTokenId, value);
        
        return newTokenId;
    }
    
    // Merge two tokens
    function mergeToken(uint256 fromTokenId, uint256 toTokenId) public {
        require(_isApprovedOrOwner(_msgSender(), fromTokenId), "Not owner of from token");
        require(_isApprovedOrOwner(_msgSender(), toTokenId), "Not owner of to token");
        require(_tokenConfigs[fromTokenId].allowMerging, "From token does not allow merging");
        require(_tokenConfigs[toTokenId].allowMerging, "To token does not allow merging");
        require(slotOf(fromTokenId) == slotOf(toTokenId), "Tokens must be in same slot");
        
        uint256 value = valueOf(fromTokenId);
        _transferValue(fromTokenId, toTokenId, value);
        
        emit MergeToken(fromTokenId, toTokenId, value);
    }
    
    // Get token details
    function getTokenConfig(uint256 tokenId) public view returns (
        uint256 slotId,
        string memory name,
        bool allowSplitting,
        bool allowMerging,
        string memory metadataUri
    ) {
        require(_exists(tokenId), "Token does not exist");
        TokenConfig storage config = _tokenConfigs[tokenId];
        
        return (
            config.slotId,
            config.name,
            config.allowSplitting,
            config.allowMerging,
            config.metadataUri
        );
    }
    
    ////////////////
    // METADATA & ROYALTIES
    ////////////////
    
    // Set token-specific URI
    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _tokenConfigs[tokenId].metadataUri = uri;
    }
    
    // Get token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        string memory baseURI = _baseURI();
        
        // Return custom URI if set
        if (bytes(_tokenConfigs[tokenId].metadataUri).length > 0) {
            return _tokenConfigs[tokenId].metadataUri;
        }
        
        // Otherwise generate a URI from base and ID
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString()))
            : "";
    }
    
    // Set default royalty
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    // Set royalty for a specific token
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
    
    ////////////////
    // OVERRIDES
    ////////////////
    
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override 
        returns (address) 
    {
        return super._update(to, tokenId, auth);
    }
    
    function _updateValue(uint256 fromTokenId, uint256 toTokenId, uint256 value) 
        internal 
        override 
    {
        super._updateValue(fromTokenId, toTokenId, value);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC3525, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
