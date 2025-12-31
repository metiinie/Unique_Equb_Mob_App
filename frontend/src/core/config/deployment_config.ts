/**
 * DeploymentConfig: Frozen configuration at deploy time.
 * 
 * Purpose: Prevent accidental or malicious drift due to environmental differences.
 * 
 * Rules:
 * - Environment variables frozen at deploy time
 * - Repository mode frozen (mock vs backend)
 * - Feature flags frozen (no dynamic toggles)
 * - All abort and audit configurations baked in
 * 
 * This aligns with principle: "Strict MVP; no feature invention in production"
 * 
 * Implementation:
 * - Configuration read from environment variables at startup
 * - Immutable after initialization
 * - No runtime changes allowed
 */
export class DeploymentConfig {
  /** Repository mode: 'mock' or 'backend' */
  readonly repositoryMode: string;

  /** Whether to enable abort observability */
  readonly enableAbortObservability: boolean;

  /** Whether to enforce single-writer locks */
  readonly enforceSingleWriter: boolean;

  /** Whether to enforce clock source discipline */
  readonly enforceClockSource: boolean;

  /** Clock skew tolerance in seconds (default: 5) */
  readonly clockSkewToleranceSeconds: number;

  constructor({
    repositoryMode,
    enableAbortObservability = true,
    enforceSingleWriter = true,
    enforceClockSource = true,
    clockSkewToleranceSeconds = 5,
  }: {
    repositoryMode: string;
    enableAbortObservability?: boolean;
    enforceSingleWriter?: boolean;
    enforceClockSource?: boolean;
    clockSkewToleranceSeconds?: number;
  }) {
    this.repositoryMode = repositoryMode;
    this.enableAbortObservability = enableAbortObservability;
    this.enforceSingleWriter = enforceSingleWriter;
    this.enforceClockSource = enforceClockSource;
    this.clockSkewToleranceSeconds = clockSkewToleranceSeconds;
  }

  /**
   * Creates DeploymentConfig from environment variables.
   * 
   * Reads configuration at startup and freezes it.
   */
  static fromEnvironment(): DeploymentConfig {
    return new DeploymentConfig({
      repositoryMode: DeploymentConfig.getEnv('REPOSITORY_MODE', 'mock'),
      enableAbortObservability: DeploymentConfig.getEnvBool('ENABLE_ABORT_OBSERVABILITY', true),
      enforceSingleWriter: DeploymentConfig.getEnvBool('ENFORCE_SINGLE_WRITER', true),
      enforceClockSource: DeploymentConfig.getEnvBool('ENFORCE_CLOCK_SOURCE', true),
      clockSkewToleranceSeconds: DeploymentConfig.getEnvInt('CLOCK_SKEW_TOLERANCE_SECONDS', 5),
    });
  }

  /** Gets environment variable with default value. */
  private static getEnv(_key: string, defaultValue: string): string {
    // In production, this would read from actual environment variables
    // For MVP, return default
    return defaultValue;
  }

  /** Gets boolean environment variable with default value. */
  private static getEnvBool(_key: string, defaultValue: boolean): boolean {
    // In production, this would read from actual environment variables
    // For MVP, return default
    return defaultValue;
  }

  /** Gets integer environment variable with default value. */
  private static getEnvInt(_key: string, defaultValue: number): number {
    // In production, this would read from actual environment variables
    // For MVP, return default
    return defaultValue;
  }

  /**
   * Validates that configuration is valid for deployment.
   * 
   * Throws if configuration violates deployment discipline.
   */
  validate(): void {
    if (this.repositoryMode !== 'mock' && this.repositoryMode !== 'backend') {
      throw new Error(
        `Invalid REPOSITORY_MODE: ${this.repositoryMode}. Must be "mock" or "backend".`
      );
    }

    if (this.clockSkewToleranceSeconds < 0) {
      throw new Error(
        `Invalid CLOCK_SKEW_TOLERANCE_SECONDS: ${this.clockSkewToleranceSeconds}. Must be >= 0.`
      );
    }
  }
}
