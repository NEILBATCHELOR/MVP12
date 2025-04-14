// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact security@mysecuritytoken.com
contract SecurityToken is ERC20, Ownable, Pausable, ERC20Burnable {
    using Strings for uint256;
    
    // ERC1400 Status Codes
    uint8 constant private TRANSFER_SUCCESS = 0;
    uint8 constant private TRANSFER_FAILURE = 1;
    uint8 constant private TRANSFER_INSUFFICIENT_BALANCE = 2;
    uint8 constant private TRANSFER_INVALID_RECEIVER = 3;
    uint8 constant private TRANSFER_INVALID_SENDER = 4;
    uint8 constant private TRANSFER_INVALID_PARTITION = 5;
    uint8 constant private TRANSFER_INVALID_JURISDICTION = 6;
    
    // Security token specifics
    string public securityType;
    string public issuerName;
    uint8 private _decimals;
    
    // Partitions
    struct Partition {
        string name;
        bool exists;
        mapping(address => uint256) balances;
        mapping(address => bool) eligibility;
    }
    
    // Documents
    struct Document {
        string uri;
        bytes32 documentHash;
        uint256 timestamp;
    }
    
    // Investor eligibility
    struct Investor {
        bool kyc;
        string investorType; // "retail", "accredited", "institutional"
        mapping(string => bool) allowedJurisdictions;
        mapping(bytes32 => bool) allowedPartitions;
    }
    
    // Transfer restrictions
    struct TransferRestriction {
        bool hasRestrictions;
        uint256 minimumHoldingPeriod;
        mapping(address => uint256) purchaseTimestamps;
    }
    
    // Mappings
    mapping(bytes32 => Partition) private _partitions;
    mapping(bytes32 => Document) private _documents;
    mapping(address => Investor) private _investors;
    mapping(string => bool) private _restrictedJurisdictions;
    TransferRestriction private _transferRestriction;
    
    // Partition array for iteration
    bytes32[] private _partitionsList;
    string[] private _documentsList;
    
    // Default partition
    bytes32 private _defaultPartition;
    
    // Events
    event DocumentUpdated(bytes32 indexed _name, string _uri, bytes32 _documentHash);
    event KYCUpdated(address indexed investor, bool status);
    event PartitionCreated(bytes32 indexed partition, string name);
    event PartitionTransfer(
        address indexed from,
        address indexed to,
        uint256 value,
        bytes32 indexed partition
    );
    event TransferRestrictionAdded(
        address indexed from,
        address indexed to,
        uint256 timestamp,
        uint256 restrictionEndTime
    );
    
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        string memory securityType_,
        string memory issuerName_,
        string memory defaultPartition_,
        address initialOwner_
    ) ERC20(name_, symbol_) Ownable(initialOwner_) {
        _decimals = decimals_;
        securityType = securityType_;
        issuerName = issuerName_;
        
        // Create default partition
        _defaultPartition = keccak256(abi.encodePacked(defaultPartition_));
        _createPartition(_defaultPartition, defaultPartition_);
        
        // Mint initial supply to owner on default partition
        if (initialSupply_ > 0) {
            _mint(initialOwner_, initialSupply_ * (10 ** decimals_));
            _partitions[_defaultPartition].balances[initialOwner_] = initialSupply_ * (10 ** decimals_);
        }
    }
    
    // Override decimals function
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // KYC Management
    function setKYC(address investor, bool status) public onlyOwner {
        _investors[investor].kyc = status;
        emit KYCUpdated(investor, status);
    }
    
    // Investor type management
    function setInvestorType(address investor, string memory investorType) public onlyOwner {
        _investors[investor].investorType = investorType;
    }
    
    // Jurisdiction management
    function addRestrictedJurisdiction(string memory jurisdiction) public onlyOwner {
        _restrictedJurisdictions[jurisdiction] = true;
    }
    
    function removeRestrictedJurisdiction(string memory jurisdiction) public onlyOwner {
        _restrictedJurisdictions[jurisdiction] = false;
    }
    
    function setInvestorJurisdiction(address investor, string memory jurisdiction, bool allowed) public onlyOwner {
        _investors[investor].allowedJurisdictions[jurisdiction] = allowed;
    }
    
    // Partition management
    function createPartition(string memory name) public onlyOwner returns (bytes32) {
        bytes32 partition = keccak256(abi.encodePacked(name));
        _createPartition(partition, name);
        return partition;
    }
    
    function _createPartition(bytes32 partition, string memory name) internal {
        require(!_partitions[partition].exists, "Partition already exists");
        _partitions[partition].exists = true;
        _partitions[partition].name = name;
        _partitionsList.push(partition);
        emit PartitionCreated(partition, name);
    }
    
    function getPartitions() public view returns (bytes32[] memory) {
        return _partitionsList;
    }
    
    // Investor eligibility for partitions
    function setInvestorPartitionEligibility(
        address investor,
        bytes32 partition,
        bool eligible
    ) public onlyOwner {
        require(_partitions[partition].exists, "Partition does not exist");
        _investors[investor].allowedPartitions[partition] = eligible;
    }
    
    // Transfer restrictions
    function setMinimumHoldingPeriod(uint256 days_) public onlyOwner {
        _transferRestriction.hasRestrictions = true;
        _transferRestriction.minimumHoldingPeriod = days_ * 1 days;
    }
    
    // Document management
    function setDocument(
        string memory name,
        string memory uri,
        bytes32 documentHash
    ) public onlyOwner {
        bytes32 nameHash = keccak256(abi.encodePacked(name));
        _documents[nameHash].uri = uri;
        _documents[nameHash].documentHash = documentHash;
        _documents[nameHash].timestamp = block.timestamp;
        
        // Add to list if not already present
        bool found = false;
        for (uint i = 0; i < _documentsList.length; i++) {
            if (keccak256(abi.encodePacked(_documentsList[i])) == nameHash) {
                found = true;
                break;
            }
        }
        
        if (!found) {
            _documentsList.push(name);
        }
        
        emit DocumentUpdated(nameHash, uri, documentHash);
    }
    
    function getDocument(string memory name) public view returns (string memory, bytes32, uint256) {
        bytes32 nameHash = keccak256(abi.encodePacked(name));
        return (
            _documents[nameHash].uri,
            _documents[nameHash].documentHash,
            _documents[nameHash].timestamp
        );
    }
    
    function getAllDocuments() public view returns (string[] memory) {
        return _documentsList;
    }
    
    // Transfer functionality for partitions
    function transferByPartition(
        bytes32 partition,
        address to,
        uint256 value
    ) public returns (bytes32) {
        bytes32 toPartition = partition;
        uint8 status = _canTransferByPartition(msg.sender, to, partition, value);
        
        require(status == TRANSFER_SUCCESS, string(abi.encodePacked("Transfer failed with status: ", Strings.toString(status))));
        
        _transferByPartition(msg.sender, to, value, partition, toPartition);
        return toPartition;
    }
    
    function _transferByPartition(
        address from,
        address to,
        uint256 value,
        bytes32 fromPartition,
        bytes32 toPartition
    ) internal {
        // Update partition balances
        _partitions[fromPartition].balances[from] -= value;
        _partitions[toPartition].balances[to] += value;
        
        // Set purchase timestamp for transfer restriction
        if (_transferRestriction.hasRestrictions) {
            _transferRestriction.purchaseTimestamps[to] = block.timestamp;
        }
        
        // Emit partition transfer event
        emit PartitionTransfer(from, to, value, fromPartition);
        
        // Execute standard ERC20 transfer
        _transfer(from, to, value);
    }
    
    // Check if transfer is allowed
    function _canTransferByPartition(
        address from,
        address to,
        bytes32 partition,
        uint256 value
    ) internal view returns (uint8) {
        // Check if partition exists
        if (!_partitions[partition].exists) {
            return TRANSFER_INVALID_PARTITION;
        }
        
        // Check KYC status
        if (!_investors[from].kyc || !_investors[to].kyc) {
            return TRANSFER_INVALID_SENDER;
        }
        
        // Check partition eligibility
        if (!_investors[to].allowedPartitions[partition]) {
            return TRANSFER_INVALID_RECEIVER;
        }
        
        // Check partition balance
        if (_partitions[partition].balances[from] < value) {
            return TRANSFER_INSUFFICIENT_BALANCE;
        }
        
        // Check holding period restrictions
        if (_transferRestriction.hasRestrictions) {
            uint256 purchaseTime = _transferRestriction.purchaseTimestamps[from];
            if (purchaseTime > 0 && (block.timestamp - purchaseTime) < _transferRestriction.minimumHoldingPeriod) {
                return TRANSFER_FAILURE;
            }
        }
        
        return TRANSFER_SUCCESS;
    }
    
    // Get balance by partition
    function balanceOfByPartition(address account, bytes32 partition) public view returns (uint256) {
        return _partitions[partition].balances[account];
    }
    
    // Standard ERC20 hooks to enforce partition logic
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        // If not using partition-specific transfers, apply default partition logic
        if (from != address(0) && to != address(0) && msg.sender != owner()) {
            // Check eligibility and restrictions for default partition
            uint8 status = _canTransferByPartition(from, to, _defaultPartition, value);
            require(status == TRANSFER_SUCCESS, string(abi.encodePacked("Default partition transfer failed with status: ", Strings.toString(status))));
            
            // Update partition balances
            _partitions[_defaultPartition].balances[from] -= value;
            _partitions[_defaultPartition].balances[to] += value;
            
            // Set purchase timestamp for transfer restriction
            if (_transferRestriction.hasRestrictions) {
                _transferRestriction.purchaseTimestamps[to] = block.timestamp;
            }
            
            // Emit partition transfer event
            emit PartitionTransfer(from, to, value, _defaultPartition);
        }
        
        // Call parent implementation for standard ERC20 logic
        super._update(from, to, value);
    }
    
    // Pause/unpause functionality
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
