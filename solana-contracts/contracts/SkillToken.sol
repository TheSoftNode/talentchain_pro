// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SkillToken - Solana Compatible
 * @dev Enterprise-grade Soulbound Token implementation for verifiable skills
 * Fully compatible with Solang/Solana while maintaining all original features
 * @author TalentChain Pro Team
 */

import "../libraries/SkillLibrary.sol";
import "../interfaces/ISkillToken.sol";

// ============================================================================
// LIBRARIES AND UTILITIES
// ============================================================================

library ErrorHandler {
    string internal constant INVALID_ADDRESS = "Invalid address";
    string internal constant UNAUTHORIZED = "Unauthorized access";
    string internal constant INVALID_SKILL_LEVEL = "Invalid skill level (1-10)";
    string internal constant SKILL_EXPIRED = "Skill has expired";
    string internal constant TOKEN_REVOKED = "Token has been revoked";
    string internal constant NOT_FOUND = "Not found";
    string internal constant INVALID_PARAMS = "Invalid parameters";
    string internal constant ALREADY_EXISTS = "Already exists";
}

// SkillLibrary is imported from ../libraries/SkillLibrary.sol

contract Counter {
    uint256 private _value;
    
    function current() public view returns (uint256) {
        return _value;
    }
    
    function increment() public {
        _value += 1;
    }
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

contract AccessManager {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    address private _admin;
    
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    
    function initialize(address admin) public {
        require(_admin == address(0));
        require(admin != address(0));
        _admin = admin;
    }
    
    function msgSender() internal view returns (address) {
        return _admin;
    }
    
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msgSender()));
        _;
    }
    
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }
    
    function grantRole(bytes32 role, address account) external onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }
    
    function getRoleAdmin(bytes32 role) public view returns (bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }
    
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msgSender());
        }
    }
}

contract PausableManager is AccessManager {
    bool private _paused;
    
    event Paused(address account);
    event Unpaused(address account);
    
    modifier whenNotPaused() {
        require(!_paused);
        _;
    }
    
    function paused() public view returns (bool) {
        return _paused;
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _paused = true;
        emit Paused(msgSender());
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _paused = false;
        emit Unpaused(msgSender());
    }
}

// ISkillToken interface is imported from ../interfaces/ISkillToken.sol

contract SkillToken is PausableManager, ISkillToken {
    using SkillLibrary for uint8;
    using SkillLibrary for string;

    // State variables
    uint256 private _tokenIdCounter;
    
    // Core mappings
    mapping(uint256 => ISkillToken.SkillData) private _skillData;
    mapping(uint256 => ISkillToken.SkillEndorsement[]) private _skillEndorsements;
    mapping(uint256 => uint64) private _lastEndorsementTime;
    mapping(uint256 => bool) private _revokedTokens;
    mapping(uint256 => string) private _revocationReasons;
    
    // Index mappings
    mapping(string => uint256[]) private _tokensByCategory;
    mapping(address => uint256[]) private _tokensByOwner;
    mapping(string => uint256) private _totalByCategory;
    
    // Token mappings (ERC721-like)
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    
    // Nonces for meta-transactions
    mapping(address => uint256) private _nonces;

    // Contract metadata
    string private _name;
    string private _symbol;

    // Additional events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event SkillTokenExpired(uint256 indexed tokenId, address indexed owner);
    event SkillTokenRenewed(uint256 indexed tokenId, uint64 newExpiryDate, address indexed renewedBy);

    // Modifiers
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), ErrorHandler.NOT_FOUND);
        _;
    }

    modifier notRevoked(uint256 tokenId) {
        require(!_revokedTokens[tokenId], ErrorHandler.TOKEN_REVOKED);
        _;
    }

    modifier validSkillLevel(uint8 level) {
        SkillLibrary.validateSkillLevel(level);
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msgSender(), ErrorHandler.UNAUTHORIZED);
        _;
    }

    constructor() {
        _name = "TalentChainPro Skill Token";
        _symbol = "TCSKILL";
    }

    // ========================================================================
    // INITIALIZATION (Solana-specific)
    // ========================================================================
    
    function initializeContract(address admin) external {
        initialize(admin);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
        _grantRole(UPDATER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // ========================================================================
    // CORE FUNCTIONALITY
    // ========================================================================

    function _mintSkillTokenInternal(
        address recipient,
        string memory category,
        string memory subcategory,
        uint8 level,
        uint64 expiryDate,
        string memory metadata,
        string memory tokenURIData
    ) 
        internal
        validSkillLevel(level)
        returns (uint256 tokenId)
    {
        require(recipient != address(0), ErrorHandler.INVALID_ADDRESS);
        SkillLibrary.validateSkillCategory(category);
        
        if (expiryDate == 0) {
            expiryDate = SkillLibrary.getDefaultExpiryDate();
        } else {
            SkillLibrary.validateExpiryDate(expiryDate);
        }

        tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        // Mint token
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURIData);

        // Store skill data
        string memory normalizedCategory = SkillLibrary.normalizeCategory(category);
        _skillData[tokenId] = SkillData({
            category: normalizedCategory,
            level: level,
            subcategory: subcategory,
            issuedAt: uint64(block.timestamp),
            expiryDate: expiryDate,
            issuer: msgSender(),
            isActive: true,
            metadata: metadata
        });

        // Update indexes
        _tokensByCategory[normalizedCategory].push(tokenId);
        _tokensByOwner[recipient].push(tokenId);
        _totalByCategory[normalizedCategory]++;

        emit SkillTokenMinted(tokenId, recipient, normalizedCategory, level, msgSender());
        
        return tokenId;
    }

    function mintSkillToken(
        address recipient,
        string calldata category,
        string calldata subcategory,
        uint8 level,
        uint64 expiryDate,
        string calldata metadata,
        string calldata tokenURIData
    ) 
        external 
        override 
        onlyRole(MINTER_ROLE) 
        whenNotPaused
        returns (uint256 tokenId)
    {
        return _mintSkillTokenInternal(
            recipient,
            category,
            subcategory,
            level,
            expiryDate,
            metadata,
            tokenURIData
        );
    }

    function batchMintSkillTokens(
        address recipient,
        string[] calldata categories,
        string[] calldata subcategories,
        uint8[] calldata levels,
        uint64[] calldata expiryDates,
        string[] calldata metadataArray,
        string[] calldata tokenURIs
    ) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused
        returns (uint256[] memory tokenIds)
    {
        require(recipient != address(0), ErrorHandler.INVALID_ADDRESS);
        require(categories.length == subcategories.length, ErrorHandler.INVALID_PARAMS);
        require(categories.length == levels.length, ErrorHandler.INVALID_PARAMS);
        require(categories.length == expiryDates.length, ErrorHandler.INVALID_PARAMS);
        require(categories.length == metadataArray.length, ErrorHandler.INVALID_PARAMS);
        require(categories.length == tokenURIs.length, ErrorHandler.INVALID_PARAMS);

        uint256 length = categories.length;
        tokenIds = new uint256[](uint32(length));

        for (uint256 i = 0; i < length; i++) {
            tokenIds[i] = _mintSkillTokenInternal(
                recipient,
                categories[i],
                subcategories[i],
                levels[i],
                expiryDates[i],
                metadataArray[i],
                tokenURIs[i]
            );
        }

        return tokenIds;
    }

    function updateSkillLevel(
        uint256 tokenId,
        uint8 newLevel,
        string calldata evidence
    ) 
        external 
        override 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused
        tokenExists(tokenId)
        notRevoked(tokenId)
        validSkillLevel(newLevel)
    {
        SkillData storage skill = _skillData[tokenId];
        require(skill.isActive, "Skill is inactive");
        require(!SkillLibrary.isSkillExpired(skill.expiryDate), ErrorHandler.SKILL_EXPIRED);

        uint8 oldLevel = skill.level;
        require(newLevel != oldLevel, "Same level provided");

        skill.level = newLevel;

        emit SkillLevelUpdated(tokenId, oldLevel, newLevel, msgSender(), evidence);
    }

    function revokeSkillToken(
        uint256 tokenId,
        string calldata reason
    ) 
        external 
        override 
        tokenExists(tokenId)
        notRevoked(tokenId)
    {
        address tokenOwner = ownerOf(tokenId);
        require(
            msgSender() == tokenOwner ||
            hasRole(ORACLE_ROLE, msgSender()) ||
            hasRole(DEFAULT_ADMIN_ROLE, msgSender()),
            ErrorHandler.UNAUTHORIZED
        );

        _revokedTokens[tokenId] = true;
        _revocationReasons[tokenId] = reason;
        _skillData[tokenId].isActive = false;

        emit SkillTokenRevoked(tokenId, reason, msgSender());
    }

    function endorseSkillToken(
        uint256 tokenId,
        string calldata endorsementData
    ) 
        external 
        override 
        whenNotPaused
        tokenExists(tokenId)
        notRevoked(tokenId)
    {
        address tokenOwner = ownerOf(tokenId);
        SkillLibrary.validateEndorser(tokenOwner, msgSender());

        require(
            SkillLibrary.canEndorse(_lastEndorsementTime[tokenId]),
            "Endorsement cooldown active"
        );

        SkillData storage skill = _skillData[tokenId];
        require(skill.isActive, "Skill is inactive");
        require(!SkillLibrary.isSkillExpired(skill.expiryDate), ErrorHandler.SKILL_EXPIRED);

        _skillEndorsements[tokenId].push(SkillEndorsement({
            endorser: msgSender(),
            endorsementData: endorsementData,
            timestamp: uint64(block.timestamp),
            isActive: true
        }));

        _lastEndorsementTime[tokenId] = uint64(block.timestamp);

        emit SkillTokenEndorsed(tokenId, msgSender(), endorsementData);
    }

    function renewSkillToken(
        uint256 tokenId,
        uint64 newExpiryDate
    ) 
        external 
        onlyRole(UPDATER_ROLE)
        tokenExists(tokenId)
        notRevoked(tokenId)
    {
        SkillLibrary.validateExpiryDate(newExpiryDate);
        
        _skillData[tokenId].expiryDate = newExpiryDate;
        _skillData[tokenId].isActive = true;

        emit SkillTokenRenewed(tokenId, newExpiryDate, msgSender());
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), ErrorHandler.INVALID_ADDRESS);
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), ErrorHandler.NOT_FOUND);
        return owner;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), ErrorHandler.NOT_FOUND);
        return _tokenURIs[tokenId];
    }

    function getSkillData(uint256 tokenId) 
        external 
        view 
        override 
        tokenExists(tokenId)
        returns (SkillData memory) 
    {
        return _skillData[tokenId];
    }

    function getSkillEndorsements(uint256 tokenId) 
        external 
        view 
        override 
        tokenExists(tokenId)
        returns (SkillEndorsement[] memory) 
    {
        return _skillEndorsements[tokenId];
    }

    function getTokensByCategory(string calldata category) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _tokensByCategory[SkillLibrary.normalizeCategory(category)];
    }

    function getTokensByOwner(address owner) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _tokensByOwner[owner];
    }

    function isSkillActive(uint256 tokenId) 
        external 
        view 
        override 
        tokenExists(tokenId)
        returns (bool) 
    {
        if (_revokedTokens[tokenId]) return false;
        
        SkillData memory skill = _skillData[tokenId];
        return skill.isActive && !SkillLibrary.isSkillExpired(skill.expiryDate);
    }

    function getTotalSkillsByCategory(string calldata category) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return _totalByCategory[SkillLibrary.normalizeCategory(category)];
    }

    function getRevocationReason(uint256 tokenId) 
        external 
        view 
        tokenExists(tokenId)
        returns (string memory) 
    {
        require(_revokedTokens[tokenId], "Token not revoked");
        return _revocationReasons[tokenId];
    }

    function nonces(address owner) external view returns (uint256) {
        return _nonces[owner];
    }

    // ========================================================================
    // INTERNAL FUNCTIONS
    // ========================================================================

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), ErrorHandler.INVALID_ADDRESS);
        require(!_exists(tokenId), ErrorHandler.ALREADY_EXISTS);

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint256 tokenId) internal {
        address owner = ownerOf(tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];
        delete _tokenURIs[tokenId];
        delete _skillData[tokenId];
        delete _skillEndorsements[tokenId];
        delete _lastEndorsementTime[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), ErrorHandler.NOT_FOUND);
        _tokenURIs[tokenId] = uri;
    }

    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================

    function markExpiredTokens(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (_exists(tokenId) && !_revokedTokens[tokenId]) {
                SkillData storage skill = _skillData[tokenId];
                if (skill.isActive && SkillLibrary.isSkillExpired(skill.expiryDate)) {
                    skill.isActive = false;
                    emit SkillTokenExpired(tokenId, ownerOf(tokenId));
                }
            }
        }
    }

    // Note: Tokens are soulbound - no transfer functions implemented
    // This maintains the soulbound nature while being Solana-compatible
}
