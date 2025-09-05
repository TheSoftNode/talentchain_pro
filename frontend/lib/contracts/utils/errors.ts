// Contract Error Handling - Enterprise-grade error management for smart contract interactions

export class ContractError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly transactionHash?: string;
  public readonly timestamp: number;

  constructor(
    code: string,
    message: string,
    details?: any,
    transactionHash?: string
  ) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.details = details;
    this.transactionHash = transactionHash;
    this.timestamp = Date.now();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContractError);
    }
  }

  /**
   * Create ContractError from unknown error
   */
  static fromError(error: any, fallbackMessage?: string): ContractError {
    if (error instanceof ContractError) {
      return error;
    }

    // Extract error information
    const message = error?.message || error?.reason || fallbackMessage || 'Unknown contract error';
    const code = ContractError.extractErrorCode(error);
    const details = ContractError.extractErrorDetails(error);
    const transactionHash = error?.transactionHash || error?.hash;

    return new ContractError(code, message, details, transactionHash);
  }

  /**
   * Extract error code from various error formats
   */
  private static extractErrorCode(error: any): string {
    // Check for standard error codes
    if (error?.code) {
      return String(error.code);
    }

    // Check for revert reasons
    if (error?.reason) {
      return ContractError.mapRevertReasonToCode(error.reason);
    }

    // Check for error message patterns
    if (error?.message) {
      return ContractError.mapErrorMessageToCode(error.message);
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Extract additional error details
   */
  private static extractErrorDetails(error: any): any {
    const details: any = {};

    if (error?.data) {
      details.data = error.data;
    }

    if (error?.transaction) {
      details.transaction = error.transaction;
    }

    if (error?.receipt) {
      details.receipt = error.receipt;
    }

    if (error?.gasUsed) {
      details.gasUsed = error.gasUsed.toString();
    }

    if (error?.gasLimit) {
      details.gasLimit = error.gasLimit.toString();
    }

    if (error?.gasPrice) {
      details.gasPrice = error.gasPrice.toString();
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  /**
   * Map revert reasons to error codes
   */
  private static mapRevertReasonToCode(reason: string): string {
    const reasonLower = reason.toLowerCase();

    // Common revert reasons
    if (reasonLower.includes('insufficient balance')) return 'INSUFFICIENT_BALANCE';
    if (reasonLower.includes('unauthorized') || reasonLower.includes('access denied')) return 'UNAUTHORIZED';
    if (reasonLower.includes('not found') || reasonLower.includes('does not exist')) return 'NOT_FOUND';
    if (reasonLower.includes('already exists') || reasonLower.includes('duplicate')) return 'ALREADY_EXISTS';
    if (reasonLower.includes('expired') || reasonLower.includes('deadline')) return 'EXPIRED';
    if (reasonLower.includes('invalid') || reasonLower.includes('bad')) return 'INVALID_PARAMETER';
    if (reasonLower.includes('paused')) return 'CONTRACT_PAUSED';
    if (reasonLower.includes('slippage')) return 'SLIPPAGE_EXCEEDED';
    if (reasonLower.includes('reentrancy')) return 'REENTRANCY_DETECTED';

    return 'CONTRACT_REVERT';
  }

  /**
   * Map error messages to error codes
   */
  private static mapErrorMessageToCode(message: string): string {
    const messageLower = message.toLowerCase();

    // Network and connection errors
    if (messageLower.includes('network') || messageLower.includes('connection')) return 'NETWORK_ERROR';
    if (messageLower.includes('timeout')) return 'TIMEOUT_ERROR';
    if (messageLower.includes('rate limit')) return 'RATE_LIMITED';

    // Transaction errors
    if (messageLower.includes('nonce') || messageLower.includes('already known')) return 'NONCE_ERROR';
    if (messageLower.includes('gas') && messageLower.includes('low')) return 'INSUFFICIENT_GAS';
    if (messageLower.includes('gas') && messageLower.includes('limit')) return 'GAS_LIMIT_EXCEEDED';
    if (messageLower.includes('replacement')) return 'REPLACEMENT_UNDERPRICED';

    // Wallet errors
    if (messageLower.includes('user rejected') || messageLower.includes('user denied')) return 'USER_REJECTED';
    if (messageLower.includes('wallet') || messageLower.includes('metamask')) return 'WALLET_ERROR';
    if (messageLower.includes('signature')) return 'SIGNATURE_ERROR';

    // Contract errors
    if (messageLower.includes('execution reverted')) return 'EXECUTION_REVERTED';
    if (messageLower.includes('call exception')) return 'CALL_EXCEPTION';
    if (messageLower.includes('transaction failed')) return 'TRANSACTION_FAILED';

    // Validation errors
    if (messageLower.includes('validation')) return 'VALIDATION_ERROR';
    if (messageLower.includes('parse') || messageLower.includes('format')) return 'PARSE_ERROR';

    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMITED',
      'NONCE_ERROR',
      'REPLACEMENT_UNDERPRICED',
    ];

    return retryableCodes.includes(this.code);
  }

  /**
   * Check if error is user-actionable
   */
  isUserActionable(): boolean {
    const userActionableCodes = [
      'INSUFFICIENT_BALANCE',
      'INSUFFICIENT_GAS',
      'USER_REJECTED',
      'VALIDATION_ERROR',
      'INVALID_PARAMETER',
      'EXPIRED',
      'UNAUTHORIZED',
    ];

    return userActionableCodes.includes(this.code);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'INSUFFICIENT_BALANCE':
        return 'Insufficient balance to complete this transaction.';
      case 'INSUFFICIENT_GAS':
        return 'Insufficient gas to complete this transaction. Please increase the gas limit.';
      case 'GAS_LIMIT_EXCEEDED':
        return 'Transaction requires more gas than the block limit allows.';
      case 'USER_REJECTED':
        return 'Transaction was rejected by the user.';
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'ALREADY_EXISTS':
        return 'This resource already exists.';
      case 'EXPIRED':
        return 'This transaction has expired. Please try again.';
      case 'INVALID_PARAMETER':
        return 'Invalid parameters provided. Please check your input.';
      case 'CONTRACT_PAUSED':
        return 'The contract is currently paused. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Transaction timed out. Please try again.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'NONCE_ERROR':
        return 'Transaction nonce error. Please refresh and try again.';
      case 'WALLET_ERROR':
        return 'Wallet connection error. Please check your wallet.';
      case 'SIGNATURE_ERROR':
        return 'Invalid signature. Please try signing again.';
      case 'EXECUTION_REVERTED':
        return 'Transaction failed during execution.';
      case 'VALIDATION_ERROR':
        return 'Input validation failed. Please check your data.';
      case 'SLIPPAGE_EXCEEDED':
        return 'Price slippage exceeded tolerance. Please adjust your slippage settings.';
      case 'REENTRANCY_DETECTED':
        return 'Reentrancy attack detected. Transaction rejected for security.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Get suggested actions for the error
   */
  getSuggestedActions(): string[] {
    switch (this.code) {
      case 'INSUFFICIENT_BALANCE':
        return [
          'Add funds to your wallet',
          'Reduce the transaction amount',
          'Check token balances',
        ];
      case 'INSUFFICIENT_GAS':
        return [
          'Increase gas limit',
          'Increase gas price',
          'Wait for lower network congestion',
        ];
      case 'USER_REJECTED':
        return [
          'Approve the transaction in your wallet',
          'Check transaction details',
          'Try again if canceled by mistake',
        ];
      case 'UNAUTHORIZED':
        return [
          'Check wallet permissions',
          'Verify you own the required tokens',
          'Contact administrator if needed',
        ];
      case 'NETWORK_ERROR':
        return [
          'Check internet connection',
          'Try switching RPC endpoints',
          'Wait a moment and retry',
        ];
      case 'TIMEOUT_ERROR':
        return [
          'Increase timeout settings',
          'Check network congestion',
          'Try again with higher gas price',
        ];
      case 'VALIDATION_ERROR':
        return [
          'Check input parameters',
          'Verify data format',
          'Review transaction details',
        ];
      case 'EXPIRED':
        return [
          'Create a new transaction',
          'Check deadline settings',
          'Ensure transaction is processed quickly',
        ];
      default:
        return [
          'Check transaction details',
          'Try again after a moment',
          'Contact support if issue persists',
        ];
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      transactionHash: this.transactionHash,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Create a sanitized version for client-side display
   */
  toClientSafe(): object {
    return {
      code: this.code,
      message: this.getUserMessage(),
      suggestedActions: this.getSuggestedActions(),
      isRetryable: this.isRetryable(),
      timestamp: this.timestamp,
    };
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
}

/**
 * Enhanced error with additional metadata
 */
export class EnhancedContractError extends ContractError {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly userContext?: any;

  constructor(
    code: string,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    details?: any,
    transactionHash?: string,
    userContext?: any
  ) {
    super(code, message, details, transactionHash);
    this.name = 'EnhancedContractError';
    this.severity = severity;
    this.category = category;
    this.userContext = userContext;
  }

  /**
   * Create from base ContractError
   */
  static fromContractError(
    error: ContractError,
    severity?: ErrorSeverity,
    category?: ErrorCategory,
    userContext?: any
  ): EnhancedContractError {
    return new EnhancedContractError(
      error.code,
      error.message,
      severity || ErrorSeverity.MEDIUM,
      category || ErrorCategory.SYSTEM,
      error.details,
      error.transactionHash,
      userContext
    );
  }

  /**
   * Check if error requires immediate attention
   */
  requiresImmediateAttention(): boolean {
    return this.severity === ErrorSeverity.CRITICAL || this.severity === ErrorSeverity.HIGH;
  }

  /**
   * Get error priority score (1-10)
   */
  getPriorityScore(): number {
    const severityScores = {
      [ErrorSeverity.LOW]: 2,
      [ErrorSeverity.MEDIUM]: 5,
      [ErrorSeverity.HIGH]: 8,
      [ErrorSeverity.CRITICAL]: 10,
    };

    return severityScores[this.severity];
  }

  /**
   * Convert to enhanced JSON
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      severity: this.severity,
      category: this.category,
      userContext: this.userContext,
      priorityScore: this.getPriorityScore(),
      requiresImmediateAttention: this.requiresImmediateAttention(),
    };
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Log error with appropriate level
   */
  static logError(error: ContractError | EnhancedContractError): void {
    const severity = error instanceof EnhancedContractError ? error.severity : ErrorSeverity.MEDIUM;
    
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL CONTRACT ERROR:', error.toJSON());
        break;
      case ErrorSeverity.HIGH:
        console.error('HIGH SEVERITY CONTRACT ERROR:', error.toJSON());
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('CONTRACT ERROR:', error.toJSON());
        break;
      case ErrorSeverity.LOW:
        console.log('LOW SEVERITY CONTRACT ERROR:', error.toJSON());
        break;
    }
  }

  /**
   * Handle error with retry logic
   */
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: ContractError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = ContractError.fromError(error);
        
        if (!lastError.isRetryable() || attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }

  /**
   * Create user-friendly error notification
   */
  static createUserNotification(error: ContractError): {
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    actions: string[];
  } {
    const severity = error instanceof EnhancedContractError ? error.severity : ErrorSeverity.MEDIUM;
    
    return {
      title: severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Transaction Error',
      message: error.getUserMessage(),
      type: severity === ErrorSeverity.LOW ? 'warning' : 'error',
      actions: error.getSuggestedActions(),
    };
  }
}