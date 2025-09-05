// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/ITalentPool.sol";

/**
 * @title PoolLibrary - Solana Compatible
 * @dev Library containing utility functions for talent pool management
 * Fully compatible with Solang/Solana compiler
 * @author TalentChain Pro Team
 */
library PoolLibrary {
    // Constants (using lamports for Solana)
    uint256 public constant MIN_POOL_STAKE = 100000000; // 0.1 SOL in lamports
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10%
    uint256 public constant MIN_APPLICATION_STAKE = 10000000; // 0.01 SOL in lamports
    uint256 public constant MATCH_SCORE_BASE = 1000;
    uint256 public constant SKILL_WEIGHT = 100;
    uint256 public constant LEVEL_WEIGHT = 50;

    // Pool duration constants
    uint256 public constant MIN_POOL_DURATION = 1 days;
    uint256 public constant MAX_POOL_DURATION = 180 days;
    uint256 public constant DEFAULT_POOL_DURATION = 30 days;

    // Enums are imported from ITalentPool interface

    /**
     * @dev Validates pool creation parameters
     */
    function validatePoolCreation(
        uint256 stakeAmount,
        uint256 salaryMin,
        uint256 salaryMax,
        uint64 deadline,
        string[] memory requiredSkills,
        uint8[] memory minimumLevels
    ) internal view {
        require(stakeAmount >= MIN_POOL_STAKE);
        require(salaryMin < salaryMax);

        uint256 duration = deadline - block.timestamp;
        require(duration >= MIN_POOL_DURATION && duration <= MAX_POOL_DURATION);
        require(requiredSkills.length > 0);
        require(requiredSkills.length == minimumLevels.length);
    }

    /**
     * @dev Validates application parameters
     */
    function validateApplication(
        uint256 stakeAmount,
        uint256[] memory skillTokenIds,
        ITalentPool.PoolStatus poolStatus,
        uint64 deadline
    ) internal view {
        require(poolStatus == ITalentPool.PoolStatus.Active);
        require(block.timestamp < deadline);
        require(stakeAmount >= MIN_APPLICATION_STAKE);
        require(skillTokenIds.length > 0);
    }

    /**
     * @dev Validates platform fee
     */
    function validatePlatformFee(uint256 fee) internal pure {
        require(fee <= MAX_PLATFORM_FEE);
    }

    /**
     * @dev Calculates match score based on skills and levels
     */
    function calculateMatchScore(
        string[] memory requiredSkills,
        uint8[] memory minimumLevels,
        string[] memory candidateSkills,
        uint8[] memory candidateLevels
    ) internal pure returns (uint256 score) {
        require(requiredSkills.length == minimumLevels.length);
        require(candidateSkills.length == candidateLevels.length);

        uint256 totalPossibleScore = requiredSkills.length * 100; // 100 points per required skill
        uint256 earnedScore = 0;

        for (uint256 i = 0; i < requiredSkills.length; i++) {
            for (uint256 j = 0; j < candidateSkills.length; j++) {
                if (keccak256(bytes(requiredSkills[i])) == keccak256(bytes(candidateSkills[j]))) {
                    uint256 skillScore = 50; // Base 50 points for having the skill

                    // Bonus for exceeding minimum level
                    if (candidateLevels[j] >= minimumLevels[i]) {
                        skillScore += 30; // +30 for meeting requirement

                        // Additional bonus for exceeding requirements (up to 20 more points)
                        uint256 levelBonus = (candidateLevels[j] - minimumLevels[i]) * 2;
                        if (levelBonus > 20) levelBonus = 20; // Cap at 20 bonus points
                        skillScore += levelBonus;
                    } else {
                        // Penalty for not meeting minimum level
                        uint256 penalty = (minimumLevels[i] - candidateLevels[j]) * 10;
                        skillScore = skillScore > penalty ? skillScore - penalty : 0;
                    }

                    earnedScore += skillScore;
                    break;
                }
            }
        }

        // Calculate percentage score
        score = totalPossibleScore > 0 ? (earnedScore * 100) / totalPossibleScore : 0;

        // Cap at 100
        if (score > 100) {
            score = 100;
        }
    }

    /**
     * @dev Calculates platform fee amount
     */
    function calculatePlatformFee(uint256 amount, uint256 feeRate) internal pure returns (uint256) {
        return (amount * feeRate) / 10000;
    }

    /**
     * @dev Calculates withdrawal penalty based on timing
     */
    function calculateWithdrawalPenalty(
        uint64 appliedAt,
        uint64 deadline,
        uint256 stakeAmount
    ) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - appliedAt;
        uint256 totalDuration = deadline - appliedAt;

        if (timeElapsed >= totalDuration) {
            return stakeAmount; // 100% penalty if withdrawing after deadline
        }

        // Linear penalty: 0% at start, 50% at deadline
        uint256 penaltyRate = (timeElapsed * 5000) / totalDuration;
        return (stakeAmount * penaltyRate) / 10000;
    }

    /**
     * @dev Calculates pool completion bonus
     */
    function calculateCompletionBonus(
        uint256 totalStaked,
        uint256 applicationCount,
        uint64 createdAt
    ) internal view returns (uint256) {
        uint256 timeToFill = block.timestamp - createdAt;

        // Quick fill bonus (within 7 days)
        if (timeToFill <= 7 days) {
            return totalStaked / 20; // 5% bonus
        }

        // Standard completion bonus
        if (applicationCount >= 5) {
            return totalStaked / 50; // 2% bonus
        }

        return 0;
    }

    /**
     * @dev Determines if pool should auto-expire
     */
    function shouldAutoExpire(uint64 deadline, uint256 applicationCount) internal view returns (bool) {
        return block.timestamp >= deadline || (block.timestamp >= deadline - 1 days && applicationCount == 0);
    }

    /**
     * @dev Validates job type
     */
    function validateJobType(ITalentPool.JobType jobType) internal pure {
        require(uint8(jobType) <= 3);
    }

    /**
     * @dev Calculates expected pool value
     */
    function calculatePoolValue(
        uint256 stakeAmount,
        uint256 salaryMin,
        uint256 salaryMax,
        ITalentPool.JobType jobType
    ) internal pure returns (uint256) {
        uint256 avgSalary = (salaryMin + salaryMax) / 2;

        // Weight based on job type
        uint256 multiplier = 12; // Default for full-time (annual)

        if (jobType == ITalentPool.JobType.PartTime) {
            multiplier = 6;
        } else if (jobType == ITalentPool.JobType.Contract) {
            multiplier = 3;
        } else if (jobType == ITalentPool.JobType.Freelance) {
            multiplier = 1;
        }

        return stakeAmount + (avgSalary * multiplier) / 12; // Monthly equivalent
    }

    /**
     * @dev Calculates average from array of scores
     */
    function calculateAverage(uint256[] memory scores) internal pure returns (uint256) {
        if (scores.length == 0) return 0;
        uint256 total = 0;
        for (uint256 i = 0; i < scores.length; i++) {
            total += scores[i];
        }
        return total / scores.length;
    }

    /**
     * @dev Calculates refund with penalty
     */
    function calculateRefundWithPenalty(
        uint256 stakeAmount,
        uint256 penaltyRate
    ) internal pure returns (uint256, uint256) {
        uint256 penalty = (stakeAmount * penaltyRate) / 10000; // penaltyRate in basis points
        uint256 refund = stakeAmount - penalty;
        return (refund, penalty);
    }

    /**
     * @dev Simplified string comparison
     */
    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @dev Validates skill requirements array
     */
    function validateSkillRequirements(
        string[] memory skills,
        uint8[] memory levels
    ) internal pure {
        require(skills.length > 0);
        require(skills.length == levels.length);
        
        for (uint256 i = 0; i < levels.length; i++) {
            require(levels[i] >= 1 && levels[i] <= 10);
        }
    }

    /**
     * @dev Calculates time-based scoring bonus
     */
    function calculateTimingBonus(uint64 appliedAt, uint64 deadline) internal pure returns (uint256) {
        uint256 totalTime = deadline - appliedAt;
        
        if (appliedAt <= deadline - (totalTime * 3 / 4)) {
            return 10; // 10% bonus for early application
        } else if (appliedAt <= deadline - (totalTime / 2)) {
            return 5; // 5% bonus for moderately early application
        }
        
        return 0; // No bonus for late applications
    }

    /**
     * @dev Normalizes location string (simplified for Solana)
     */
    function normalizeLocation(string memory location) internal pure returns (string memory) {
        // Simplified normalization for Solana compatibility
        return location;
    }

    /**
     * @dev Checks if a skill is required
     */
    function isSkillRequired(
        string memory skill,
        string[] memory requiredSkills
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < requiredSkills.length; i++) {
            if (stringsEqual(skill, requiredSkills[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Calculates experience multiplier
     */
    function calculateExperienceMultiplier(uint256 yearsExperience) internal pure returns (uint256) {
        if (yearsExperience >= 10) return 150; // 50% bonus for 10+ years
        if (yearsExperience >= 5) return 125;  // 25% bonus for 5-9 years
        if (yearsExperience >= 2) return 110;  // 10% bonus for 2-4 years
        return 100; // No bonus for <2 years
    }
}
