import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SystemStatusService implements OnModuleInit {
    private readonly logger = new Logger(SystemStatusService.name);

    // Immutable Release Identity
    public readonly RELEASE_VERSION = process.env.npm_package_version || '1.0.0';
    public readonly RELEASE_COMMIT = process.env.GIT_COMMIT_HASH || 'unknown';
    public readonly RELEASE_TIMESTAMP = new Date(); // Boot time as proxy if build time unknown

    private _isDegraded = false;
    private _startupIntegrityCheckPassed = false;

    constructor() { }

    onModuleInit() {
        this.logger.log(`System Status Service Initialized (Version: ${this.RELEASE_VERSION}).`);
    }

    setStartupIntegrityResult(passed: boolean) {
        this._startupIntegrityCheckPassed = passed;
        if (!passed) {
            this._isDegraded = true;
            this.logger.error('CRITICAL: Startup Integrity Check FAILED. System set to DEGRADED mode.');
        } else {
            this.logger.log('Startup Integrity Check PASSED. System GREEN.');
        }
    }

    get isDegraded() {
        return this._isDegraded;
    }

    get versionInfo() {
        return {
            version: this.RELEASE_VERSION,
            commit: this.RELEASE_COMMIT,
            timestamp: this.RELEASE_TIMESTAMP,
            isDegraded: this._isDegraded,
            integrityCheckPassed: this._startupIntegrityCheckPassed
        };
    }

    markDegraded(reason: string) {
        this.logger.warn(`System switched to DEGRADED mode: ${reason}`);
        this._isDegraded = true;
    }
}
