// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @custom:security-contact security@yieldfarm.com
contract TokenizedVault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Vault management
    string public yieldStrategy;      // Description of the yield strategy
    uint256 public initialNAV;        // Initial NAV (Net Asset Value) in underlying asset terms
    
    // Fees
    uint256 public managementFeePercentage;  // Annual management fee (scaled by FEE_SCALE)
    uint256 public performanceFeePercentage; // Performance fee (scaled by FEE_SCALE)
    address public feeRecipient;             // Address where fees are sent
    uint256 private constant FEE_SCALE = 10000; // 1% = 100
    
    // Fee tracking
    uint256 public lastFeeCollectionTimestamp;
    uint256 public highWaterMark;     // For performance fee calculation
    
    // Deposit/withdrawal limits
    uint256 public minDeposit;        // Minimum deposit amount
    uint256 public maxDeposit;        // Maximum deposit amount (0 = unlimited)
    uint256 public redemptionNoticePeriodDays; // Notice period before withdrawal
    mapping(address => uint256) public withdrawalRequests; // User => earliest withdrawal timestamp
    
    // Oracle integration for automated NAV updates
    address public navOracleAddress;
    bool public autoNavEnabled;
    
    // Events
    event ManagementFeeCollected(uint256 amount);
    event PerformanceFeeCollected(uint256 amount);
    event NAVUpdated(uint256 oldNav, uint256 newNav, string source);
    event WithdrawalRequested(address indexed user, uint256 assets, uint256 unlockTime);
    
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        string memory yieldStrategy_,
        uint256 managementFee_,
        uint256 performanceFee_,
        address feeRecipient_,
        address initialOwner_
    ) ERC20(name_, symbol_) ERC4626(asset_) Ownable(initialOwner_) {
        yieldStrategy = yieldStrategy_;
        managementFeePercentage = managementFee_; // e.g., 200 = 2.00%
        performanceFeePercentage = performanceFee_; // e.g., 2000 = 20.00%
        feeRecipient = feeRecipient_ != address(0) ? feeRecipient_ : initialOwner_;
        
        // Initialize fee collection timestamp and high water mark
        lastFeeCollectionTimestamp = block.timestamp;
        highWaterMark = 10 ** decimals(); // 1.0 with decimals
        initialNAV = 10 ** decimals();    // 1.0 with decimals
    }
    
    ////////////////
    // CONFIGURATION
    ////////////////
    
    // Update management fee percentage
    function setManagementFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee too high"); // Max 5%
        
        // Collect fees before changing fee structure
        collectFees();
        
        managementFeePercentage = newFee;
    }
    
    // Update performance fee percentage
    function setPerformanceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 3000, "Fee too high"); // Max 30%
        
        // Collect fees before changing fee structure
        collectFees();
        
        performanceFeePercentage = newFee;
    }
    
    // Update fee recipient
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    // Set minimum deposit amount
    function setMinDeposit(uint256 amount) external onlyOwner {
        minDeposit = amount;
    }
    
    // Set maximum deposit amount
    function setMaxDeposit(uint256 amount) external onlyOwner {
        maxDeposit = amount;
    }
    
    // Set redemption notice period
    function setRedemptionNoticePeriod(uint256 days_) external onlyOwner {
        redemptionNoticePeriodDays = days_;
    }
    
    // Set NAV oracle address
    function setNavOracleAddress(address oracle) external onlyOwner {
        navOracleAddress = oracle;
    }
    
    // Enable/disable automated NAV updates
    function setAutoNavEnabled(bool enabled) external onlyOwner {
        autoNavEnabled = enabled;
    }
    
    ////////////////
    // NAV MANAGEMENT
    ////////////////
    
    // Manually update NAV (for authorized users)
    function updateNAV(uint256 newNav) external onlyOwner {
        _updateNAV(newNav, "manual");
    }
    
    // Internal function to update NAV
    function _updateNAV(uint256 newNav, string memory source) internal {
        uint256 oldNav = totalAssets();
        
        emit NAVUpdated(oldNav, newNav, source);
        
        // If NAV increased, update high water mark
        if (newNav > highWaterMark) {
            highWaterMark = newNav;
        }
    }
    
    ////////////////
    // FEE MANAGEMENT
    ////////////////
    
    // Collect fees (can be called by anyone, but fees go to feeRecipient)
    function collectFees() public nonReentrant returns (uint256) {
        // Don't collect fees if paused
        if (paused()) {
            return 0;
        }
        
        uint256 totalFees = 0;
        
        // Management fee (time-based)
        uint256 managementFee = _calculateManagementFee();
        if (managementFee > 0) {
            totalFees += managementFee;
            emit ManagementFeeCollected(managementFee);
        }
        
        // Performance fee (based on NAV growth above high water mark)
        uint256 performanceFee = _calculatePerformanceFee();
        if (performanceFee > 0) {
            totalFees += performanceFee;
            emit PerformanceFeeCollected(performanceFee);
        }
        
        // Update last fee collection timestamp
        lastFeeCollectionTimestamp = block.timestamp;
        
        // Mint vault tokens to fee recipient
        if (totalFees > 0) {
            // For fees, we mint corresponding shares to the fee recipient
            uint256 sharesToMint = convertToShares(totalFees);
            _mint(feeRecipient, sharesToMint);
        }
        
        return totalFees;
    }
    
    // Calculate management fee (time-based)
    function _calculateManagementFee() internal view returns (uint256) {
        if (managementFeePercentage == 0 || totalAssets() == 0) {
            return 0;
        }
        
        // Calculate time since last fee collection
        uint256 timeElapsed = block.timestamp - lastFeeCollectionTimestamp;
        if (timeElapsed == 0) {
            return 0;
        }
        
        // Management fee pro-rated for time elapsed
        // fee = (assets * fee% * timeElapsed) / (365 days * FEE_SCALE)
        uint256 assets = totalAssets();
        return (assets * managementFeePercentage * timeElapsed) / (365 days * FEE_SCALE);
    }
    
    // Calculate performance fee (based on NAV growth)
    function _calculatePerformanceFee() internal view returns (uint256) {
        if (performanceFeePercentage == 0 || totalAssets() == 0) {
            return 0;
        }
        
        uint256 currentNav = totalAssets();
        
        // Only charge performance fee if we exceed the high water mark
        if (currentNav <= highWaterMark) {
            return 0;
        }
        
        // Performance fee on gains above high water mark
        // fee = (currentNav - highWaterMark) * fee% / FEE_SCALE
        uint256 gain = currentNav - highWaterMark;
        return (gain * performanceFeePercentage) / FEE_SCALE;
    }
    
    ////////////////
    // WITHDRAW MANAGEMENT
    ////////////////
    
    // Request withdrawal (starts the notice period)
    function requestWithdrawal(uint256 assets) external {
        address owner = _msgSender();
        
        // Calculate shares required for this withdrawal
        uint256 shares = convertToShares(assets);
        require(balanceOf(owner) >= shares, "Insufficient shares");
        
        // Calculate unlock time
        uint256 unlockTime = block.timestamp + (redemptionNoticePeriodDays * 1 days);
        
        // Store withdrawal request
        withdrawalRequests[owner] = unlockTime;
        
        emit WithdrawalRequested(owner, assets, unlockTime);
    }
    
    // Check if withdrawal is allowed for the user
    function canWithdraw(address user) public view returns (bool) {
        // If no notice period, anyone can withdraw anytime
        if (redemptionNoticePeriodDays == 0) {
            return true;
        }
        
        // If no withdrawal request, cannot withdraw
        if (withdrawalRequests[user] == 0) {
            return false;
        }
        
        // Can withdraw if unlock time has passed
        return block.timestamp >= withdrawalRequests[user];
    }
    
    ////////////////
    // ERC4626 OVERRIDES
    ////////////////
    
    // Override totalAssets to account for yield strategy returns
    function totalAssets() public view override returns (uint256) {
        // Base implementation just returns the balance of the underlying asset
        // In a real implementation, this would be adjusted based on the yield strategy
        return IERC20(asset()).balanceOf(address(this));
    }
    
    // Override maxDeposit to enforce deposit limits
    function maxDeposit(address) public view override returns (uint256) {
        if (paused()) {
            return 0;
        }
        
        if (maxDeposit > 0) {
            return maxDeposit;
        }
        
        return type(uint256).max;
    }
    
    // Override maxWithdraw to enforce withdrawal notice period
    function maxWithdraw(address owner) public view override returns (uint256) {
        if (paused()) {
            return 0;
        }
        
        if (!canWithdraw(owner)) {
            return 0;
        }
        
        return super.maxWithdraw(owner);
    }
    
    // Override deposit to enforce min deposit and collect fees before deposit
    function deposit(uint256 assets, address receiver) public override nonReentrant returns (uint256) {
        require(assets >= minDeposit, "Below minimum deposit");
        
        // Collect fees before deposit to ensure proper share valuation
        collectFees();
        
        return super.deposit(assets, receiver);
    }
    
    // Override withdraw to enforce withdrawal notice period
    function withdraw(uint256 assets, address receiver, address owner) public override nonReentrant returns (uint256) {
        require(canWithdraw(owner), "Withdrawal not allowed yet");
        
        // Collect fees before withdrawal to ensure proper share valuation
        collectFees();
        
        // Reset withdrawal request after successful withdrawal
        withdrawalRequests[owner] = 0;
        
        return super.withdraw(assets, receiver, owner);
    }
    
    // Override redeem to enforce withdrawal notice period
    function redeem(uint256 shares, address receiver, address owner) public override nonReentrant returns (uint256) {
        require(canWithdraw(owner), "Withdrawal not allowed yet");
        
        // Collect fees before redemption to ensure proper share valuation
        collectFees();
        
        // Reset withdrawal request after successful redemption
        withdrawalRequests[owner] = 0;
        
        return super.redeem(shares, receiver, owner);
    }
    
    ////////////////
    // PAUSE CONTROL
    ////////////////
    
    // Pause the vault (emergency stop)
    function pause() external onlyOwner {
        _pause();
    }
    
    // Unpause the vault
    function unpause() external onlyOwner {
        _unpause();
    }
}
