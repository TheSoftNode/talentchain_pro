// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IReputationOracle.sol";

/**
 * @title OracleLibrary - Solana Compatible
 * @dev Library containing utility functions for oracle management
 * Fully compatible with Solang/Solana compiler
 * @author TalentChain Pro Team
 */
library OracleLibrary {
    // Constants (using lamports for Solana)
    uint256 public constant MIN_ORACLE_STAKE = 1000000000; // 1 SOL in lamports
    uint256 public constant SLASH_PERCENTAGE = 1000; // 10% in basis points
    uint256 public constant MIN_REPUTATION_SCORE = 50;
    uint256 public constant CONSENSUS_THRESHOLD = 6700; // 67% in basis points
    uint256 public constant ORACLE_REWARD_RATE = 100; // 1% in basis points

    // Time constants
    uint64 public constant VERIFICATION_WINDOW = 24 hours;
    uint64 public constant DISPUTE_WINDOW = 72 hours;
    uint64 public constant COOLDOWN_PERIOD = 7 days;

    // Oracle status enum
    enum OracleStatus { Active, Suspended, Slashed, Withdrawn }
    enum VerificationResult { Pending, Verified, Rejected, Disputed }

    /**
     * @dev Validates oracle registration parameters
     */
    function validateOracleRegistration(
        uint256 stakeAmount,
        uint256 reputationScore,
        string memory credentials
    ) internal pure {
        require(stakeAmount >= MIN_ORACLE_STAKE);
        require(reputationScore >= MIN_REPUTATION_SCORE);
        require(bytes(credentials).length > 0);
        require(bytes(credentials).length <= 500);
    }

    /**
     * @dev Calculates slash amount for oracle misbehavior
     */
    function calculateSlashAmount(uint256 stakeAmount) internal pure returns (uint256) {
        return (stakeAmount * SLASH_PERCENTAGE) / 10000;
    }

    /**
     * @dev Calculates oracle reward for verification
     */
    function calculateOracleReward(uint256 verificationValue) internal pure returns (uint256) {
        return (verificationValue * ORACLE_REWARD_RATE) / 10000;
    }

    /**
     * @dev Validates verification parameters
     */
    function validateVerification(
        uint256 tokenId,
        uint8 skillLevel,
        uint64 submittedAt,
        string memory evidence
    ) internal view {
        require(tokenId > 0);
        require(skillLevel >= 1 && skillLevel <= 10);
        require(submittedAt <= block.timestamp);
        require(bytes(evidence).length > 0);
        require(bytes(evidence).length <= 1000);
    }

    /**
     * @dev Checks if verification window is still open
     */
    function isVerificationWindowOpen(uint64 submittedAt) internal view returns (bool) {
        return block.timestamp <= submittedAt + VERIFICATION_WINDOW;
    }

    /**
     * @dev Checks if dispute window is still open
     */
    function isDisputeWindowOpen(uint64 verifiedAt) internal view returns (bool) {
        return block.timestamp <= verifiedAt + DISPUTE_WINDOW;
    }

    /**
     * @dev Calculates consensus from oracle votes
     */
    function calculateConsensus(
        uint256 yesVotes,
        uint256 noVotes
    ) internal pure returns (bool hasConsensus, bool result) {
        uint256 totalVotes = yesVotes + noVotes;
        
        if (totalVotes == 0) {
            return (false, false);
        }

        uint256 yesPercentage = (yesVotes * 10000) / totalVotes;
        uint256 noPercentage = (noVotes * 10000) / totalVotes;

        if (yesPercentage >= CONSENSUS_THRESHOLD) {
            return (true, true);
        } else if (noPercentage >= CONSENSUS_THRESHOLD) {
            return (true, false);
        }

        return (false, false);
    }

    /**
     * @dev Validates oracle status for participation
     */
    function validateOracleForVerification(OracleStatus status) internal pure {
        require(status == OracleStatus.Active);
    }

    /**
     * @dev Calculates reputation update based on verification accuracy
     */
    function calculateReputationUpdate(
        uint256 currentReputation,
        bool wasCorrect,
        uint256 consensusStrength
    ) internal pure returns (uint256) {
        if (wasCorrect) {
            // Reward for correct verification
            uint256 bonus = (consensusStrength * 5) / 100; // Up to 5 points
            if (bonus == 0) bonus = 1; // Minimum 1 point
            return currentReputation + bonus;
        } else {
            // Penalty for incorrect verification
            uint256 penalty = (consensusStrength * 10) / 100; // Up to 10 points
            if (penalty == 0) penalty = 2; // Minimum 2 points penalty
            return currentReputation > penalty ? currentReputation - penalty : 0;
        }
    }

    /**
     * @dev Checks if oracle is in cooldown period
     */
    function isInCooldown(uint64 lastVerificationTime) internal view returns (bool) {
        return block.timestamp < lastVerificationTime + COOLDOWN_PERIOD;
    }

    /**
     * @dev Calculates verification difficulty based on skill level
     */
    function getVerificationDifficulty(uint8 skillLevel) internal pure returns (uint256) {
        // Higher skill levels require more thorough verification
        if (skillLevel >= 9) return 5; // Expert level
        if (skillLevel >= 7) return 4; // Advanced level
        if (skillLevel >= 5) return 3; // Intermediate level
        if (skillLevel >= 3) return 2; // Novice level
        return 1; // Beginner level
    }

    /**
     * @dev Validates evidence format and content
     */
    function validateEvidence(string memory evidence) internal pure returns (bool) {
        bytes memory evidenceBytes = bytes(evidence);
        
        // Check minimum length
        if (evidenceBytes.length < 10) return false;
        
        // Check maximum length
        if (evidenceBytes.length > 1000) return false;
        
        // Evidence should contain some meaningful content
        // Simplified validation for Solana compatibility
        return true;
    }

    /**
     * @dev Calculates minimum oracles required for verification
     */
    function getMinimumOraclesRequired(uint8 skillLevel, uint256 tokenValue) internal pure returns (uint256) {
        uint256 baseRequired = 3;
        
        // More oracles needed for higher skill levels
        if (skillLevel >= 8) baseRequired = 5;
        else if (skillLevel >= 6) baseRequired = 4;
        
        // More oracles needed for higher value tokens
        if (tokenValue > 10000000000) baseRequired += 2; // >10 SOL
        else if (tokenValue > 1000000000) baseRequired += 1; // >1 SOL
        
        return baseRequired;
    }

    /**
     * @dev Calculates time-based verification bonus
     */
    function calculateTimingBonus(uint64 submittedAt, uint64 verifiedAt) internal pure returns (uint256) {
        uint256 timeToVerify = verifiedAt - submittedAt;
        
        if (timeToVerify <= 1 hours) return 20; // 20% bonus for very fast verification
        if (timeToVerify <= 6 hours) return 10; // 10% bonus for fast verification
        if (timeToVerify <= 12 hours) return 5; // 5% bonus for moderate speed
        
        return 0; // No bonus for slow verification
    }

    /**
     * @dev Validates dispute parameters
     */
    function validateDispute(
        uint256 verificationId,
        string memory disputeReason,
        uint256 counterStake
    ) internal pure {
        require(verificationId > 0);
        require(bytes(disputeReason).length >= 20);
        require(bytes(disputeReason).length <= 500);
        require(counterStake >= MIN_ORACLE_STAKE / 10); // Minimum 10% of oracle stake
    }

    /**
     * @dev Calculates dispute resolution rewards
     */
    function calculateDisputeRewards(
        uint256 totalStaked,
        uint256 winningVotes,
        uint256 totalVotes
    ) internal pure returns (uint256) {
        if (totalVotes == 0 || winningVotes == 0) return 0;
        
        uint256 rewardPool = totalStaked / 10; // 10% of total stake as reward pool
        return (rewardPool * winningVotes) / totalVotes;
    }

    /**
     * @dev Checks if oracle meets minimum requirements
     */
    function meetsMinimumRequirements(
        uint256 stakeAmount,
        uint256 reputationScore,
        uint256 completedVerifications
    ) internal pure returns (bool) {
        return stakeAmount >= MIN_ORACLE_STAKE && 
               reputationScore >= MIN_REPUTATION_SCORE &&
               completedVerifications >= 5;
    }

    /**
     * @dev Calculates oracle rank based on performance metrics
     */
    function calculateOracleRank(
        uint256 reputationScore,
        uint256 totalVerifications,
        uint256 accuracyRate
    ) internal pure returns (uint256) {
        uint256 baseScore = reputationScore;
        uint256 experienceBonus = totalVerifications * 2; // 2 points per verification
        uint256 accuracyBonus = accuracyRate; // Direct accuracy percentage
        
        uint256 totalScore = baseScore + experienceBonus + accuracyBonus;
        
        // Cap at maximum rank
        return totalScore > 1000 ? 1000 : totalScore;
    }

    /**
     * @dev Validates oracle performance metrics
     */
    function validatePerformanceMetrics(
        uint256 accuracyRate,
        uint256 responseTime,
        uint256 completionRate
    ) internal pure returns (bool) {
        return accuracyRate >= 80 && // Minimum 80% accuracy
               responseTime <= 24 hours && // Maximum 24 hours response time
               completionRate >= 90; // Minimum 90% completion rate
    }
}
