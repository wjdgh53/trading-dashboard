/**
 * Advanced Error Handling and Recovery System
 * Comprehensive error management with fallback strategies
 */

// Error types and classifications
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Error context interface
export interface ErrorContext {
  operation: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  params?: Record<string, any>;
  stackTrace?: string;
  correlationId?: string;
}

// Enhanced error interface
export interface EnhancedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context: ErrorContext;
  retryable: boolean;
  fallbackAvailable: boolean;
  userMessage: string;
}

// Recovery strategy interface
export interface RecoveryStrategy {
  name: string;
  canHandle: (error: EnhancedError) => boolean;
  execute: (error: EnhancedError) => Promise<any>;
  priority: number; // Higher number = higher priority
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  jitter: boolean;
}

// Default retry configurations
const RETRY_CONFIGS: Record<string, RetryConfig> = {
  network: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
  },
  api: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 1.5,
    jitter: true,
  },
  cache: {
    maxAttempts: 1,
    baseDelay: 100,
    maxDelay: 1000,
    backoffFactor: 1,
    jitter: false,
  },
};

// Error analytics for monitoring
interface ErrorAnalytics {
  errorCounts: Map<ErrorType, number>;
  recentErrors: EnhancedError[];
  recoverySuccess: Map<string, number>;
  recoveryFailures: Map<string, number>;
  lastErrorTime: Date | null;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private recoveryStrategies: RecoveryStrategy[] = [];
  private analytics: ErrorAnalytics;
  private readonly maxRecentErrors = 50;

  constructor() {
    this.analytics = {
      errorCounts: new Map(),
      recentErrors: [],
      recoverySuccess: new Map(),
      recoveryFailures: new Map(),
      lastErrorTime: null,
    };

    this.initializeDefaultStrategies();
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Cache fallback strategy
    this.registerRecoveryStrategy({
      name: 'cache-fallback',
      priority: 100,
      canHandle: (error) => error.fallbackAvailable && error.type === ErrorType.NETWORK_ERROR,
      execute: async (error) => {
        console.log('Using cached data due to network error:', error.message);
        return 'cache-fallback-executed';
      },
    });

    // Retry strategy
    this.registerRecoveryStrategy({
      name: 'retry-request',
      priority: 80,
      canHandle: (error) => error.retryable,
      execute: async (error) => {
        const config = this.getRetryConfig(error.type);
        return this.executeWithRetry(
          () => this.retryOriginalOperation(error),
          config,
          error.context.operation
        );
      },
    });

    // Graceful degradation strategy
    this.registerRecoveryStrategy({
      name: 'graceful-degradation',
      priority: 60,
      canHandle: (error) => error.severity !== ErrorSeverity.CRITICAL,
      execute: async (error) => {
        console.log('Graceful degradation for error:', error.message || 'undefined error');
        return this.provideMinimalFunctionality(error);
      },
    });

    // User notification strategy
    this.registerRecoveryStrategy({
      name: 'user-notification',
      priority: 40,
      canHandle: () => true, // Always can handle
      execute: async (error) => {
        this.notifyUser(error);
        return 'user-notified';
      },
    });
  }

  /**
   * Register a new recovery strategy
   */
  registerRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Handle error with comprehensive recovery
   */
  async handleError(
    error: Error | EnhancedError,
    context: Partial<ErrorContext> = {}
  ): Promise<{ success: boolean; result?: any; fallbackUsed: boolean }> {
    const enhancedError = this.enhanceError(error, context);
    
    // Record error for analytics
    this.recordError(enhancedError);

    // Find applicable recovery strategies
    const applicableStrategies = this.recoveryStrategies.filter(strategy =>
      strategy.canHandle(enhancedError)
    );

    let lastError = enhancedError;
    let fallbackUsed = false;

    // Try recovery strategies in priority order
    for (const strategy of applicableStrategies) {
      try {
        console.log(`Attempting recovery strategy: ${strategy.name}`);
        const result = await strategy.execute(enhancedError);
        
        this.recordRecoverySuccess(strategy.name);
        
        // Check if this was a fallback strategy
        if (strategy.name === 'cache-fallback' || strategy.name === 'graceful-degradation') {
          fallbackUsed = true;
        }
        
        return { success: true, result, fallbackUsed };
      } catch (recoveryError) {
        console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        this.recordRecoveryFailure(strategy.name);
        lastError = this.enhanceError(recoveryError as Error, {
          operation: `recovery-${strategy.name}`,
        });
      }
    }

    // All recovery strategies failed
    console.error('All recovery strategies failed for error:', enhancedError);
    return { success: false, fallbackUsed: false };
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          console.log(`Operation ${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxAttempts) {
          throw this.enhanceError(lastError, {
            operation: operationName,
          });
        }

        const delay = this.calculateBackoffDelay(attempt, config);
        console.log(`Operation ${operationName} failed (attempt ${attempt}), retrying in ${delay}ms`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Enhance basic error with additional context
   */
  private enhanceError(error: Error | EnhancedError, context: Partial<ErrorContext> = {}): EnhancedError {
    if ('type' in error) {
      return error; // Already enhanced
    }

    const errorType = this.classifyError(error);
    const severity = this.determineSeverity(errorType, error);
    
    return {
      type: errorType,
      severity,
      message: error.message,
      originalError: error,
      context: {
        operation: context.operation || 'unknown',
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        stackTrace: error.stack,
        correlationId: this.generateCorrelationId(),
        ...context,
      },
      retryable: this.isRetryable(errorType, error),
      fallbackAvailable: this.hasFallbackAvailable(errorType),
      userMessage: this.generateUserMessage(errorType, error),
    };
  }

  /**
   * Classify error into specific type
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    if (message.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    
    if (message.includes('api') || message.includes('server')) {
      return ErrorType.API_ERROR;
    }
    
    if (message.includes('cache') || message.includes('storage')) {
      return ErrorType.CACHE_ERROR;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(type: ErrorType, error: Error): ErrorSeverity {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return ErrorSeverity.MEDIUM;
      
      case ErrorType.API_ERROR:
        return ErrorSeverity.HIGH;
      
      case ErrorType.CACHE_ERROR:
        return ErrorSeverity.LOW;
      
      case ErrorType.VALIDATION_ERROR:
        return ErrorSeverity.MEDIUM;
      
      default:
        return ErrorSeverity.HIGH;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(type: ErrorType, error: Error): boolean {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return true;
      
      case ErrorType.API_ERROR:
        // Check HTTP status if available
        const statusMatch = error.message.match(/(\d{3})/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1]);
          return status >= 500 || status === 429; // Server errors or rate limiting
        }
        return false;
      
      case ErrorType.CACHE_ERROR:
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Check if fallback is available
   */
  private hasFallbackAvailable(type: ErrorType): boolean {
    return type === ErrorType.NETWORK_ERROR || type === ErrorType.API_ERROR;
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(type: ErrorType, error: Error): string {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return '네트워크 연결을 확인해주세요. 캐시된 데이터를 표시합니다.';
      
      case ErrorType.TIMEOUT_ERROR:
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      
      case ErrorType.API_ERROR:
        return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      
      case ErrorType.CACHE_ERROR:
        return '데이터 캐시 오류가 발생했습니다. 새로고침해주세요.';
      
      case ErrorType.VALIDATION_ERROR:
        return '입력 데이터에 오류가 있습니다. 확인해주세요.';
      
      default:
        return '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  /**
   * Calculate backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number, config: RetryConfig): number {
    let delay = Math.min(
      config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
      config.maxDelay
    );

    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // Add jitter
    }

    return Math.floor(delay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry configuration for error type
   */
  private getRetryConfig(type: ErrorType): RetryConfig {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return RETRY_CONFIGS.network;
      
      case ErrorType.API_ERROR:
        return RETRY_CONFIGS.api;
      
      case ErrorType.CACHE_ERROR:
        return RETRY_CONFIGS.cache;
      
      default:
        return RETRY_CONFIGS.network;
    }
  }

  /**
   * Retry original operation (placeholder)
   */
  private async retryOriginalOperation(error: EnhancedError): Promise<any> {
    // In a real implementation, this would retry the original operation
    // For now, we'll throw to simulate retry failure
    throw new Error(`Retry failed for operation: ${error.context.operation}`);
  }

  /**
   * Provide minimal functionality during errors
   */
  private async provideMinimalFunctionality(error: EnhancedError): Promise<any> {
    console.log('Providing minimal functionality due to error:', error.message || 'undefined error');
    
    // Return basic empty state
    return {
      fallback: true,
      message: 'Limited functionality available',
      timestamp: new Date(),
    };
  }

  /**
   * Notify user of error
   */
  private notifyUser(error: EnhancedError): void {
    // In a real implementation, this would show a toast notification or modal
    console.warn('User notification:', error.userMessage);
  }

  /**
   * Generate correlation ID for error tracking
   */
  private generateCorrelationId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record error for analytics
   */
  private recordError(error: EnhancedError): void {
    // Update error counts
    const currentCount = this.analytics.errorCounts.get(error.type) || 0;
    this.analytics.errorCounts.set(error.type, currentCount + 1);

    // Add to recent errors
    this.analytics.recentErrors.unshift(error);
    if (this.analytics.recentErrors.length > this.maxRecentErrors) {
      this.analytics.recentErrors.pop();
    }

    // Update last error time
    this.analytics.lastErrorTime = error.context.timestamp;
  }

  /**
   * Record recovery success
   */
  private recordRecoverySuccess(strategyName: string): void {
    const currentCount = this.analytics.recoverySuccess.get(strategyName) || 0;
    this.analytics.recoverySuccess.set(strategyName, currentCount + 1);
  }

  /**
   * Record recovery failure
   */
  private recordRecoveryFailure(strategyName: string): void {
    const currentCount = this.analytics.recoveryFailures.get(strategyName) || 0;
    this.analytics.recoveryFailures.set(strategyName, currentCount + 1);
  }

  /**
   * Get error analytics
   */
  getAnalytics(): ErrorAnalytics {
    return {
      ...this.analytics,
      errorCounts: new Map(this.analytics.errorCounts),
      recentErrors: [...this.analytics.recentErrors],
      recoverySuccess: new Map(this.analytics.recoverySuccess),
      recoveryFailures: new Map(this.analytics.recoveryFailures),
    };
  }

  /**
   * Clear error analytics
   */
  clearAnalytics(): void {
    this.analytics = {
      errorCounts: new Map(),
      recentErrors: [],
      recoverySuccess: new Map(),
      recoveryFailures: new Map(),
      lastErrorTime: null,
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance();

// Simple error handling utility for consistent user messages
export const errorHandling = {
  handleError: (error: any, operation: string): string => {
    console.error(`Error in ${operation}:`, error);
    
    // Return user-friendly message based on error type
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return '네트워크 연결을 확인해주세요. 캐시된 데이터를 표시합니다.';
    }
    
    if (error?.message?.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    
    if (error?.message?.includes('unauthorized') || error?.message?.includes('403')) {
      return '권한이 없습니다. 로그인을 확인해주세요.';
    }
    
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      return '요청한 데이터를 찾을 수 없습니다.';
    }
    
    // Default message
    return `${operation} 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`;
  }
};