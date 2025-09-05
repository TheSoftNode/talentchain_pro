// Connects AI verification with smart contracts using existing wallet state

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useWeb3Auth';
import { 
  AIContractBridge, 
  createAIContractBridge,
  type VerificationBridgeConfig,
  type SkillMintingResult,
  type IntegrationStatus,
  type VerificationCompletedEvent,
} from '../lib/ai-contracts-integration';

interface AIIntegrationState {
  isInitialized: boolean;
  isVerifying: boolean;
  isMinting: boolean;
  progress: number;
  currentStep: string;
  status?: IntegrationStatus;
  lastResult?: {
    success: boolean;
    tokenIds: string[];
    transactionHash?: string;
    errors?: string[];
  };
  error?: string;
}

interface UseAIContractIntegrationOptions {
  contractAddresses?: {
    skillToken: string;
    talentPool: string;
    reputationOracle: string;
  };
  autoConnect?: boolean;
}

export function useAIContractIntegration(options: UseAIContractIntegrationOptions = {}) {
  const { user, isConnected } = useAuth();
  
  const [state, setState] = useState<AIIntegrationState>({
    isInitialized: false,
    isVerifying: false,
    isMinting: false,
    progress: 0,
    currentStep: '',
  });

  const [bridge, setBridge] = useState<AIContractBridge | null>(null);

  // Initialize the AI-Contract bridge when wallet is connected
  const initializeBridge = useCallback(async () => {
    if (!isConnected || !options.contractAddresses) {
      return;
    }

    try {
      setState(prev => ({ ...prev, currentStep: 'Initializing AI-Contract bridge...' }));

      const config: VerificationBridgeConfig = {
        contractAddresses: options.contractAddresses,
        aiConfig: {
          // These would be injected from environment variables
          githubApiKey: process.env.NEXT_PUBLIC_GITHUB_API_KEY,
          linkedinApiKey: process.env.NEXT_PUBLIC_LINKEDIN_API_KEY,
          openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          huggingfaceApiKey: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
        },
        ipfsConfig: {
          endpoint: process.env.NEXT_PUBLIC_IPFS_ENDPOINT || '',
          apiKey: process.env.NEXT_PUBLIC_IPFS_API_KEY,
        },
        skillMappingConfig: {
          mappings: [], // Will use defaults
          defaultCategory: 'Programming',
          minimumConfidence: 0.7,
          levelCalculation: {
            method: 'logarithmic',
            maxLevel: 100,
            minLevel: 1,
          },
        },
        options: {
          autoMint: true,
          batchSize: 10,
          retryAttempts: 3,
          gasOptimization: true,
        },
      };

      const bridgeInstance = createAIContractBridge(config);
      setBridge(bridgeInstance);

      setState(prev => ({ 
        ...prev, 
        isInitialized: true,
        currentStep: 'AI-Contract bridge initialized',
        error: undefined,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize bridge';
      setState(prev => ({ 
        ...prev, 
        isInitialized: false,
        error: errorMessage,
        currentStep: 'Initialization failed',
      }));
    }
  }, [isConnected, options.contractAddresses]);

  // Auto-initialize when options change
  useEffect(() => {
    if (options.autoConnect !== false) {
      initializeBridge();
    }
  }, [initializeBridge, options.autoConnect]);

  // Verify and mint skills from AI analysis
  const verifyAndMintSkills = useCallback(async (
    githubUsername?: string,
    linkedinProfile?: string
  ): Promise<SkillMintingResult | null> => {
    if (!bridge || !user?.walletAddress) {
      setState(prev => ({ ...prev, error: 'Bridge not initialized or user not connected' }));
      return null;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isVerifying: true,
        isMinting: true,
        progress: 0,
        error: undefined,
        currentStep: 'Starting AI verification...',
      }));

      const result = await bridge.verifyAndMintSkills(
        user.walletAddress,
        githubUsername,
        linkedinProfile,
        (status: IntegrationStatus) => {
          setState(prev => ({
            ...prev,
            status,
            progress: status.progress,
            currentStep: status.currentStep,
            error: status.errors.length > 0 ? status.errors[0].message : undefined,
          }));
        }
      );

      const mintingResult: SkillMintingResult = {
        success: result.success,
        tokenIds: result.mintingResult?.tokenIds || [],
        transactionHash: result.mintingResult?.transactionHash,
        errors: result.errors,
      };

      setState(prev => ({
        ...prev,
        isVerifying: false,
        isMinting: false,
        progress: result.success ? 100 : 0,
        currentStep: result.success ? 'Skills minted successfully!' : 'Verification failed',
        lastResult: mintingResult,
        error: result.success ? undefined : result.errors?.[0],
      }));

      return mintingResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      setState(prev => ({
        ...prev,
        isVerifying: false,
        isMinting: false,
        progress: 0,
        currentStep: 'Verification failed',
        error: errorMessage,
        lastResult: {
          success: false,
          tokenIds: [],
          errors: [errorMessage],
        },
      }));

      return null;
    }
  }, [bridge, user?.walletAddress]);

  // Update existing skill levels
  const updateSkillLevels = useCallback(async (
    githubUsername?: string,
    linkedinProfile?: string
  ) => {
    if (!bridge || !user?.walletAddress) {
      return { success: false, updatedSkills: 0, errors: ['Bridge not initialized'] };
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isVerifying: true,
        progress: 0,
        currentStep: 'Updating skill levels...',
      }));

      const result = await bridge.updateSkillLevels(
        user.walletAddress,
        githubUsername,
        linkedinProfile,
        (status: IntegrationStatus) => {
          setState(prev => ({
            ...prev,
            progress: status.progress,
            currentStep: status.currentStep,
          }));
        }
      );

      setState(prev => ({
        ...prev,
        isVerifying: false,
        progress: 100,
        currentStep: `Updated ${result.updatedSkills} skills`,
      }));

      return result;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        progress: 0,
        currentStep: 'Update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      return { success: false, updatedSkills: 0, errors: ['Update failed'] };
    }
  }, [bridge, user?.walletAddress]);

  // Health check
  const checkHealth = useCallback(async () => {
    if (!bridge) return null;
    
    try {
      return await bridge.healthCheck();
    } catch (error) {
      return null;
    }
  }, [bridge]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isInitialized: bridge !== null,
      isVerifying: false,
      isMinting: false,
      progress: 0,
      currentStep: '',
      error: undefined,
    });
  }, [bridge]);

  return {
    // State
    ...state,
    isConnected,
    userAddress: user?.walletAddress,
    
    // Actions
    initializeBridge,
    verifyAndMintSkills,
    updateSkillLevels,
    checkHealth,
    reset,
    
    // Configuration
    setBridgeConfig: bridge?.updateConfiguration.bind(bridge),
    getConfiguration: bridge?.getConfiguration.bind(bridge),
  };
}