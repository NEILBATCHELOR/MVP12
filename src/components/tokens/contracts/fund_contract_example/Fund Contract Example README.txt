// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FundSharesToken
 * @dev ERC1155 implementation for tokenized fund shares or tranches
 * representing different classes of ownership in an interval credit fund
 */
contract FundSharesToken is ERC1155, Ownable, Pausable {
    using Strings for uint256;
    
    // Token metadata
    string public name;
    string public symbol;
    
    // Mapping for token ID details
    struct TokenInfo {
        string name;           // Token name (e.g., "Senior Tranche")
        uint256 maxSupply;     // Maximum supply for this token ID
        uint256 currentSupply; // Current circulating supply
        bool isActive;         // Whether this token ID is active
    }
    
    mapping(uint256 => TokenInfo) public tokenInfo;
    
    // Compliance
    mapping(address => bool) public verifiedInvestors;   // KYC/AML whitelist
    mapping(address => bool) public authorizedOperators; // Operators that can mint/burn
    
    // URI handling
    string private baseURI;
    mapping(uint256 => string) private _tokenURIs;
    
    // Events
    event TokenInfoUpdated(uint256 indexed tokenId, string name, uint256 maxSupply, bool isActive);
    event VerifiedInvestorAdded(address indexed investor);
    event VerifiedInvestorRemoved(address indexed investor);
    event AuthorizedOperatorAdded(address indexed operator);
    event AuthorizedOperatorRemoved(address indexed operator);
    
    /**
     * @dev Initializes the contract by setting a `name`, `symbol` and a `baseURI` to the token collection.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC1155(_baseURI) {
        name = _name;
        symbol = _symbol;
        baseURI = _baseURI;
    }
    
    /**
     * @dev Modifier to check if the caller is an authorized operator
     */
    modifier onlyAuthorizedOperator() {
        require(owner() == _msgSender() || authorizedOperators[_msgSender()], "Not authorized");
        _;
    }
    
    /**
     * @dev Override transfer function to enforce restrictions
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override whenNotPaused {
        // Check if receiver is a verified investor (unless it's a special contract with approval)
        if (!authorizedOperators[to]) {
            require(verifiedInvestors[to], "Receiver not verified");
        }
        
        super.safeTransferFrom(from, to, id, amount, data);
    }
    
    /**
     * @dev Override batch transfer function to enforce restrictions
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override whenNotPaused {
        // Check if receiver is a verified investor (unless it's a special contract with approval)
        if (!authorizedOperators[to]) {
            require(verifiedInvestors[to], "Receiver not verified");
        }
        
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
    
    /**
     * @dev Create a new fund share token type
     * @param tokenId The ID for the new token
     * @param tokenName The name of the token (e.g., "Senior Tranche")
     * @param maxSupply The maximum supply for this token
     * @param uri Optional URI for this token's metadata
     */
    function createTokenType(
        uint256 tokenId,
        string memory tokenName,
        uint256 maxSupply,
        string memory uri
    ) external onlyOwner {
        require(tokenInfo[tokenId].isActive == false, "Token ID already exists");
        
        tokenInfo[tokenId] = TokenInfo({
            name: tokenName,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true
        });
        
        if (bytes(uri).length > 0) {
            _tokenURIs[tokenId] = uri;
        }
        
        emit TokenInfoUpdated(tokenId, tokenName, maxSupply, true);
    }
    
    /**
     * @dev Mint tokens to a verified investor
     * @param to The address to mint tokens to
     * @param tokenId The ID of the token to mint
     * @param amount The amount of tokens to mint
     * @param data Additional data
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external onlyAuthorizedOperator {
        require(tokenInfo[tokenId].isActive, "Token ID not active");
        require(verifiedInvestors[to], "Recipient not verified");
        
        // Check max supply
        if (tokenInfo[tokenId].maxSupply > 0) {
            require(
                tokenInfo[tokenId].currentSupply + amount <= tokenInfo[tokenId].maxSupply,
                "Exceeds max supply"
            );
        }
        
        tokenInfo[tokenId].currentSupply += amount;
        _mint(to, tokenId, amount, data);
    }
    
    /**
     * @dev Mint tokens in batch to a verified investor
     * @param to The address to mint tokens to
     * @param tokenIds Array of token IDs to mint
     * @param amounts Array of amounts to mint
     * @param data Additional data
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyAuthorizedOperator {
        require(verifiedInvestors[to], "Recipient not verified");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(tokenInfo[tokenIds[i]].isActive, "Token ID not active");
            
            // Check max supply
            if (tokenInfo[tokenIds[i]].maxSupply > 0) {
                require(
                    tokenInfo[tokenIds[i]].currentSupply + amounts[i] <= tokenInfo[tokenIds[i]].maxSupply,
                    "Exceeds max supply"
                );
            }
            
            tokenInfo[tokenIds[i]].currentSupply += amounts[i];
        }
        
        _mintBatch(to, tokenIds, amounts, data);
    }
    
    /**
     * @dev Burn tokens from an address
     * @param from The address to burn tokens from
     * @param tokenId The ID of the token to burn
     * @param amount The amount of tokens to burn
     */
    function burn(
        address from,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()) || authorizedOperators[_msgSender()],
            "Not authorized to burn"
        );
        
        tokenInfo[tokenId].currentSupply -= amount;
        _burn(from, tokenId, amount);
    }
    
    /**
     * @dev Burn tokens in batch from an address
     * @param from The address to burn tokens from
     * @param tokenIds Array of token IDs to burn
     * @param amounts Array of amounts to burn
     */
    function burnBatch(
        address from,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()) || authorizedOperators[_msgSender()],
            "Not authorized to burn"
        );
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenInfo[tokenIds[i]].currentSupply -= amounts[i];
        }
        
        _burnBatch(from, tokenIds, amounts);
    }
    
    /**
     * @dev Update token information
     * @param tokenId The ID of the token to update
     * @param tokenName The new name of the token
     * @param maxSupply The new maximum supply
     * @param isActive Whether the token is active
     */
    function updateTokenInfo(
        uint256 tokenId,
        string memory tokenName,
        uint256 maxSupply,
        bool isActive
    ) external onlyOwner {
        require(tokenInfo[tokenId].isActive, "Token ID not active");
        
        if (maxSupply > 0) {
            require(tokenInfo[tokenId].currentSupply <= maxSupply, "Max supply less than current supply");
        }
        
        tokenInfo[tokenId].name = tokenName;
        tokenInfo[tokenId].maxSupply = maxSupply;
        tokenInfo[tokenId].isActive = isActive;
        
        emit TokenInfoUpdated(tokenId, tokenName, maxSupply, isActive);
    }
    
    /**
     * @dev Update token URI
     * @param tokenId The ID of the token to update
     * @param uri The new URI
     */
    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(tokenInfo[tokenId].isActive, "Token ID not active");
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Set the base URI for all tokens
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @dev Returns the URI for a given token ID
     * @param tokenId The ID of the token
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        
        // If token has a specific URI, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        
        // Otherwise, return baseURI + tokenId
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }
    
    /**
     * @dev Add a verified investor
     * @param investor The address of the investor to verify
     */
    function addVerifiedInvestor(address investor) external onlyOwner {
        verifiedInvestors[investor] = true;
        emit VerifiedInvestorAdded(investor);
    }
    
    /**
     * @dev Remove a verified investor
     * @param investor The address of the investor to remove
     */
    function removeVerifiedInvestor(address investor) external onlyOwner {
        verifiedInvestors[investor] = false;
        emit VerifiedInvestorRemoved(investor);
    }
    
    /**
     * @dev Add an authorized operator
     * @param operator The address of the operator to authorize
     */
    function addAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
        emit AuthorizedOperatorAdded(operator);
    }
    
    /**
     * @dev Remove an authorized operator
     * @param operator The address of the operator to remove
     */
    function removeAuthorizedOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
        emit AuthorizedOperatorRemoved(operator);
    }
    
    /**
     * @dev Pause all token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause all token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
