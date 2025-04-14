// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @custom:security-contact security@multitoken.com
contract MultiToken is ERC1155, ERC1155Burnable, ERC1155Pausable, ERC1155Supply, ERC1155URIStorage, Ownable, ERC2981 {
    using Strings for uint256;
    
    string public name;
    string public symbol;
    
    // Token configuration
    struct TokenConfig {
        string name;
        uint256 maxSupply;
        bool burnable;
        bool transferable;
    }
    
    // Mapping from token ID to token configuration
    mapping(uint256 => TokenConfig) private _tokenConfigs;
    
    // Mapping for approved operators that can manage tokens
    mapping(address => bool) private _operatorFilter;
    
    // Events
    event TokenCreated(uint256 indexed id, string name, uint256 initialSupply, uint256 maxSupply);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        address initialOwner
    ) ERC1155(_uri) Ownable(initialOwner) {
        name = _name;
        symbol = _symbol;
    }
    
    // Create a new token type
    function createToken(
        uint256 id,
        string memory tokenName,
        uint256 initialSupply,
        uint256 maxSupply,
        bool burnable,
        bool transferable,
        string memory tokenURI
    ) public onlyOwner {
        require(_tokenConfigs[id].maxSupply == 0, "Token ID already exists");
        
        // Set token configuration
        _tokenConfigs[id] = TokenConfig({
            name: tokenName,
            maxSupply: maxSupply,
            burnable: burnable,
            transferable: transferable
        });
        
        // Set token URI
        _setURI(id, tokenURI);
        
        // Mint initial supply to the contract owner
        if (initialSupply > 0) {
            _mint(msg.sender, id, initialSupply, "");
        }
        
        emit TokenCreated(id, tokenName, initialSupply, maxSupply);
    }
    
    // Set the base URI for all token metadata
    function setURI(string memory newuri) public onlyOwner {
        _setBaseURI(newuri);
    }
    
    // Set token-specific URI
    function setTokenURI(uint256 id, string memory tokenURI) public onlyOwner {
        _setURI(id, tokenURI);
    }
    
    // Mint tokens
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }
    
    // Mint multiple tokens in a batch
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
    
    // Check if token is burnable
    function isBurnable(uint256 id) public view returns (bool) {
        return _tokenConfigs[id].burnable;
    }
    
    // Check if token is transferable
    function isTransferable(uint256 id) public view returns (bool) {
        return _tokenConfigs[id].transferable;
    }
    
    // Get token details
    function getTokenConfig(uint256 id) public view returns (TokenConfig memory) {
        return _tokenConfigs[id];
    }
    
    // Set royalty information for the contract
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    // Custom overrides for transfers to enforce token transfer restrictions
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        // Check if the transfer is a mint (from == address(0)) or a burn (to == address(0))
        bool isMint = from == address(0);
        bool isBurn = to == address(0);
        
        // If it's not a mint or burn, check transfer restrictions
        if (!isMint && !isBurn && from != owner() && to != owner()) {
            for (uint256 i = 0; i < ids.length; i++) {
                // Enforce transfer restrictions if token is not transferable
                require(_tokenConfigs[ids[i]].transferable, "Token not transferable");
                
                // Check max supply when minting
                if (isMint && _tokenConfigs[ids[i]].maxSupply > 0) {
                    require(totalSupply(ids[i]) + amounts[i] <= _tokenConfigs[ids[i]].maxSupply, "Exceeds max supply");
                }
                
                // Check if token is burnable when burning
                if (isBurn) {
                    require(_tokenConfigs[ids[i]].burnable, "Token not burnable");
                }
            }
        }
        
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
    
    // Pause all token transfers
    function pause() public onlyOwner {
        _pause();
    }
    
    // Unpause all token transfers
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // Filter operators who can transfer tokens
    function setOperatorFilter(address operator, bool approved) public onlyOwner {
        _operatorFilter[operator] = approved;
    }
    
    // Override isApprovedForAll to include operator filtering
    function isApprovedForAll(address account, address operator) public view override returns (bool) {
        // If operator filtering is enabled, check if the operator is approved
        if (_operatorFilter[operator]) {
            return super.isApprovedForAll(account, operator);
        }
        
        // If owner is involved, always allow
        if (account == owner() || operator == owner()) {
            return true;
        }
        
        return super.isApprovedForAll(account, operator);
    }
    
    // The following functions are overrides required by Solidity
    
    function uri(uint256 tokenId) 
        public
        view
        override(ERC1155, ERC1155URIStorage)
        returns (string memory) 
    {
        return super.uri(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
