// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @custom:security-contact security@mynft.com
contract MyNFT is ERC721, ERC721URIStorage, ERC721Burnable, ERC721Enumerable, ERC721Pausable, Ownable, ERC2981 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    string private _baseURIStorage;
    bool private _isTransferable;
    bool private _hasTransferRestrictions;
    
    // Constructor to initialize the NFT collection
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address initialOwner,
        bool isTransferable,
        bool hasTransferRestrictions
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _baseURIStorage = baseURI;
        _isTransferable = isTransferable;
        _hasTransferRestrictions = hasTransferRestrictions;
    }

    // Set the base URI for all token metadata
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURIStorage = baseURI;
    }

    // Override _baseURI function to return our custom base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseURIStorage;
    }

    // Mint a new NFT with URI
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    // Set royalty information
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    // Set royalty information for a specific token
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    // Pause all token transfers
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause all token transfers
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // Check if token transfers are allowed
    function _isTransferAllowed(address from, address to) internal view returns (bool) {
        if (!_isTransferable) {
            return from == address(0) || to == address(0) || from == owner() || to == owner();
        }
        
        if (_hasTransferRestrictions) {
            // Implement custom transfer restriction logic here
            // For example, only allow transfers to/from whitelisted addresses
            // This is just a placeholder
            return from == address(0) || to == address(0) || from == owner() || to == owner();
        }
        
        return true;
    }

    // Before token transfer hook
    function _update(address to, uint256 tokenId, address auth) 
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable) 
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(_isTransferAllowed(from, to), "Transfer not allowed");
        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
