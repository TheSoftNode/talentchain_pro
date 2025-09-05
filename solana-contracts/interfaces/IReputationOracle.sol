// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IReputationOracle - Solana Compatible
 * @dev Interface for the ReputationOracle contract - AI-powered reputation scoring
 * Fully compatible with Solang/Solana compiler
 * @author TalentChain Pro Team
 */
interface IReputationOracle {
    // Events
    event ReputationScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        string category,
        address indexed oracle
    );
    
    event WorkEvaluationCompleted(
        uint256 indexed evaluationId,
        address indexed user,
        uint256[] skillTokenIds,
        uint256 overallScore,
        string ipfsHash
    );
    
    event OracleRegistered(
        address indexed oracle,
        string name,
        string[] specializations
    );
    
    event OracleStatusChanged(
        address indexed oracle,
        bool isActive,
        string reason
    );

    event EvaluationChallenged(
        uint256 indexed evaluationId,
        uint256 indexed challengeId,
        address indexed challenger,
        string reason
    );

    event ChallengeResolved(
        uint256 indexed challengeId,
        bool upholdOriginal,
        string resolution,
        address resolver
    );

    // Structs
    struct ReputationScore {
        uint256 overallScore;
        uint256 totalEvaluations;
        uint64 lastUpdated;
        bool isActive;
    }

    struct WorkEvaluation {
        uint256 id;
        address user;
        uint256[] skillTokenIds;
        string workDescription;
        string workContent;
        uint256 overallScore;
        string feedback;
        address evaluatedBy;
        uint64 timestamp;
        string ipfsHash;
        bool isActive;
    }

    struct OracleInfo {
        address oracle;
        string name;
        string[] specializations;
        uint256 evaluationsCompleted;
        uint256 averageScore;
        uint64 registeredAt;
        bool isActive;
        uint256 stake;
    }

    struct Challenge {
        uint256 id;
        uint256 evaluationId;
        address challenger;
        string reason;
        uint256 stakeAmount;
        bool resolved;
        bool upholdOriginal;
        string resolution;
        uint64 timestamp;
    }

    // Core functions (modified for Solana - no payable)
    function registerOracle(
        string calldata name,
        string[] calldata specializations,
        uint256 stakeAmount
    ) external returns (uint256 oracleId);

    function submitWorkEvaluation(
        address user,
        uint256[] calldata skillTokenIds,
        string calldata workDescription,
        string calldata workContent,
        uint256 overallScore,
        uint256[] calldata skillScores,
        string calldata feedback,
        string calldata ipfsHash
    ) external returns (uint256 evaluationId);

    function updateReputationScore(
        address user,
        string calldata category,
        uint256 newScore,
        string calldata evidence
    ) external;

    function challengeEvaluation(
        uint256 evaluationId,
        string calldata reason,
        uint256 stakeAmount
    ) external returns (uint256 challengeId);

    function resolveChallenge(
        uint256 challengeId,
        bool upholdOriginal,
        string calldata resolution
    ) external;

    // View functions
    function getReputationScore(address user) 
        external 
        view 
        returns (ReputationScore memory);

    function getCategoryScore(address user, string calldata category) 
        external 
        view 
        returns (uint256);

    function getWorkEvaluation(uint256 evaluationId) 
        external 
        view 
        returns (WorkEvaluation memory);

    function getOracleInfo(address oracle) 
        external 
        view 
        returns (OracleInfo memory);

    function getActiveOracles() 
        external 
        view 
        returns (address[] memory);

    function getUserEvaluations(address user) 
        external 
        view 
        returns (uint256[] memory);

    function isAuthorizedOracle(address oracle) 
        external 
        view 
        returns (bool);

    function getMinimumOracleStake() 
        external 
        view 
        returns (uint256);

    function getTotalEvaluations() 
        external 
        view 
        returns (uint256);

    function getChallenge(uint256 challengeId)
        external
        view
        returns (Challenge memory);

    function getEvaluationChallenges(uint256 evaluationId)
        external
        view
        returns (uint256[] memory);
}
