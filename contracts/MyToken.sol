// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @custom:security-contact security@mytoken.com
contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    // Additional token properties
    uint8 private _decimals;
    bool public capSupply;
    uint256 public maxSupply;

    // Constructor for token initialization
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply,
        address initialOwner,
        bool hasCappedSupply,
        uint256 supplyCap
    ) ERC20(name, symbol) Ownable(initialOwner) ERC20Permit(name) {
        _decimals = decimalsValue;
        capSupply = hasCappedSupply;
        maxSupply = hasCappedSupply ? supplyCap : type(uint256).max;
        
        // Mint initial supply to the initial owner
        _mint(initialOwner, initialSupply * (10 ** decimalsValue));
    }

    // Override decimals to allow custom decimal places
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // Mint additional tokens (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        if (capSupply) {
            require(totalSupply() + amount <= maxSupply, "Exceeds maximum supply cap");
        }
        _mint(to, amount);
    }

    // Pause token transfers (only owner)
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause token transfers (only owner)
    function unpause() public onlyOwner {
        _unpause();
    }

    // Override required by Solidity for ERC20Pausable
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
