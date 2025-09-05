// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GovernanceLibrary - Solana Compatible
 * @dev Library containing utility functions for governance management
 * Fully compatible with Solang/Solana compiler
 * @author TalentChain Pro Team
 */
library GovernanceLibrary {
    // Constants
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 14 days;
    uint256 public constant QUORUM_PERCENTAGE = 2000; // 20% in basis points
    uint256 public constant APPROVAL_THRESHOLD = 5100; // 51% in basis points
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100; // 1% in basis points
    uint256 public constant EXECUTION_DELAY = 2 days;

    // Proposal types
    enum ProposalType { 
        ParameterChange, 
        FeatureAddition, 
        Upgrade, 
        Treasury, 
        Emergency 
    }
    
    enum ProposalStatus { 
        Pending, 
        Active, 
        Succeeded, 
        Defeated, 
        Queued, 
        Executed, 
        Cancelled 
    }

    enum VoteType { Against, For, Abstain }

    /**
     * @dev Validates proposal creation parameters
     */
    function validateProposalCreation(
        string memory title,
        string memory description,
        uint256 proposerVotingPower,
        uint256 totalVotingPower,
        uint64 votingPeriod
    ) internal pure {
        require(bytes(title).length > 0 && bytes(title).length <= 100);
        require(bytes(description).length >= 50 && bytes(description).length <= 2000);
        require(votingPeriod >= MIN_VOTING_PERIOD && votingPeriod <= MAX_VOTING_PERIOD);
        
        // Check if proposer meets minimum threshold
        uint256 requiredPower = (totalVotingPower * MIN_PROPOSAL_THRESHOLD) / 10000;
        require(proposerVotingPower >= requiredPower);
    }

    /**
     * @dev Validates voting parameters
     */
    function validateVote(
        ProposalStatus status,
        uint64 votingDeadline,
        uint256 voterPower,
        VoteType voteType
    ) internal view {
        require(status == ProposalStatus.Active);
        require(block.timestamp <= votingDeadline);
        require(voterPower > 0);
        require(uint8(voteType) <= 2);
    }

    /**
     * @dev Calculates voting power based on token balance and lock duration
     */
    function calculateVotingPower(
        uint256 tokenBalance,
        uint64 lockDuration,
        uint64 maxLockDuration
    ) internal pure returns (uint256) {
        if (lockDuration == 0) return 0;
        
        // Base voting power equals token balance
        uint256 basePower = tokenBalance;
        
        // Lock duration multiplier (1x to 4x based on lock duration)
        uint256 multiplier = 100 + (lockDuration * 300) / maxLockDuration;
        
        return (basePower * multiplier) / 100;
    }

    /**
     * @dev Checks if proposal has reached quorum
     */
    function hasQuorum(
        uint256 totalVotes,
        uint256 totalVotingPower
    ) internal pure returns (bool) {
        if (totalVotingPower == 0) return false;
        uint256 quorumRequired = (totalVotingPower * QUORUM_PERCENTAGE) / 10000;
        return totalVotes >= quorumRequired;
    }

    /**
     * @dev Determines proposal outcome
     */
    function determineProposalOutcome(
        uint256 forVotes,
        uint256 againstVotes,
        uint256 totalVotingPower
    ) internal pure returns (bool succeeded) {
        uint256 totalVotes = forVotes + againstVotes;
        
        // Check quorum first
        if (!hasQuorum(totalVotes, totalVotingPower)) {
            return false;
        }
        
        // Check if for votes exceed threshold
        if (totalVotes == 0) return false;
        uint256 forPercentage = (forVotes * 10000) / totalVotes;
        return forPercentage >= APPROVAL_THRESHOLD;
    }

    /**
     * @dev Validates proposal execution
     */
    function validateExecution(
        ProposalStatus status,
        uint64 queuedAt,
        bool hasSucceeded
    ) internal view {
        require(status == ProposalStatus.Queued);
        require(hasSucceeded);
        require(block.timestamp >= queuedAt + EXECUTION_DELAY);
    }

    /**
     * @dev Calculates proposal execution time
     */
    function calculateExecutionTime(uint64 votingEndTime) internal pure returns (uint64) {
        return votingEndTime + uint64(EXECUTION_DELAY);
    }

    /**
     * @dev Validates proposal type and parameters
     */
    function validateProposalType(
        ProposalType proposalType,
        bytes memory proposalData
    ) internal pure {
        require(uint8(proposalType) <= 4);
        
        if (proposalType == ProposalType.Emergency) {
            // Emergency proposals have reduced requirements
            require(proposalData.length > 0);
        } else {
            require(proposalData.length >= 32); // Minimum data for regular proposals
        }
    }

    /**
     * @dev Calculates delegate voting power
     */
    function calculateDelegateVotingPower(
        address[] memory delegators,
        uint256[] memory delegatedAmounts,
        uint64 snapshotTime
    ) internal view returns (uint256) {
        require(delegators.length == delegatedAmounts.length);
        
        uint256 totalPower = 0;
        for (uint256 i = 0; i < delegators.length; i++) {
            // In a real implementation, this would check delegation at snapshot time
            totalPower += delegatedAmounts[i];
        }
        
        return totalPower;
    }

    /**
     * @dev Validates delegation parameters
     */
    function validateDelegation(
        address delegator,
        address delegate,
        uint256 amount
    ) internal pure {
        require(delegator != address(0));
        require(delegate != address(0));
        require(delegator != delegate);
        require(amount > 0);
    }

    /**
     * @dev Calculates proposal participation rate
     */
    function calculateParticipationRate(
        uint256 totalVotes,
        uint256 totalVotingPower
    ) internal pure returns (uint256) {
        if (totalVotingPower == 0) return 0;
        return (totalVotes * 10000) / totalVotingPower;
    }

    /**
     * @dev Validates emergency proposal parameters
     */
    function validateEmergencyProposal(
        address proposer,
        uint256 proposerPower,
        uint256 totalPower,
        string memory justification
    ) internal pure {
        require(proposer != address(0));
        require(bytes(justification).length >= 100); // Detailed justification required
        
        // Emergency proposals need higher threshold
        uint256 requiredPower = (totalPower * 500) / 10000; // 5%
        require(proposerPower >= requiredPower);
    }

    /**
     * @dev Calculates time-weighted voting power
     */
    function calculateTimeWeightedVotingPower(
        uint256 baseVotingPower,
        uint64 voteTime,
        uint64 proposalStart,
        uint64 proposalEnd
    ) internal pure returns (uint256) {
        // Earlier votes get slightly higher weight
        uint256 totalVotingPeriod = proposalEnd - proposalStart;
        uint256 timeFromStart = voteTime - proposalStart;
        
        if (timeFromStart <= totalVotingPeriod / 4) {
            return (baseVotingPower * 110) / 100; // 10% bonus for very early votes
        } else if (timeFromStart <= totalVotingPeriod / 2) {
            return (baseVotingPower * 105) / 100; // 5% bonus for early votes
        }
        
        return baseVotingPower; // No bonus for late votes
    }

    /**
     * @dev Validates treasury proposal parameters
     */
    function validateTreasuryProposal(
        uint256 amount,
        address recipient,
        string memory purpose
    ) internal pure {
        require(amount > 0);
        require(recipient != address(0));
        require(bytes(purpose).length >= 20);
        require(bytes(purpose).length <= 500);
    }

    /**
     * @dev Calculates proposal priority score
     */
    function calculateProposalPriority(
        ProposalType proposalType,
        uint256 proposerReputation,
        uint256 communitySupport
    ) internal pure returns (uint256) {
        uint256 baseScore = 100;
        
        // Type-based scoring
        if (proposalType == ProposalType.Emergency) {
            baseScore = 200;
        } else if (proposalType == ProposalType.Upgrade) {
            baseScore = 150;
        }
        
        // Reputation bonus
        uint256 reputationBonus = proposerReputation / 10;
        if (reputationBonus > 50) reputationBonus = 50;
        
        // Community support bonus
        uint256 supportBonus = communitySupport / 100;
        if (supportBonus > 30) supportBonus = 30;
        
        return baseScore + reputationBonus + supportBonus;
    }

    /**
     * @dev Checks if proposal can be cancelled
     */
    function canCancelProposal(
        address proposer,
        address caller,
        ProposalStatus status,
        uint64 votingStart
    ) internal view returns (bool) {
        // Proposer can always cancel their own proposal before voting starts
        if (caller == proposer && block.timestamp < votingStart) {
            return true;
        }
        
        // Admin can cancel in specific circumstances
        return status == ProposalStatus.Pending || 
               (status == ProposalStatus.Active && block.timestamp < votingStart + 1 days);
    }

    /**
     * @dev Validates vote delegation chain
     */
    function validateDelegationChain(
        address[] memory chain,
        uint256 maxChainLength
    ) internal pure returns (bool) {
        if (chain.length > maxChainLength) return false;
        
        // Check for circular delegation
        for (uint256 i = 0; i < chain.length; i++) {
            for (uint256 j = i + 1; j < chain.length; j++) {
                if (chain[i] == chain[j]) return false;
            }
        }
        
        return true;
    }
}
