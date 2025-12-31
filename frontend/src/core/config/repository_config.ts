import { AuthRepository } from '../../domain/repositories/auth_repository';
import { EqubRepository } from '../../domain/repositories/equb_repository';
import { AuthBackendRepository } from '../../infrastructure/backend/auth_backend_repository';
import { EqubBackendRepository } from '../../infrastructure/backend/equb_backend_repository';
import { MockEqubRepository } from '../../infrastructure/mock/mock_equb_repository';
import { InMemoryBackendStorage } from '../../infrastructure/backend/storage/in_memory_backend_storage';

/**
 * Configuration to swap between Mock and Backend repositories.
 * 
 * This proves backend-agnostic claim: UI and use-cases remain unchanged.
 */
export enum RepositoryMode {
  mock = 'mock',
  backend = 'backend',
}

export class RepositoryConfig {
  private static mode: RepositoryMode = RepositoryMode.mock;

  /** Set repository mode (mock or backend). */
  static setMode(mode: RepositoryMode): void {
    RepositoryConfig.mode = mode;
  }

  /** Get EqubRepository based on current mode. */
  static getEqubRepository(): EqubRepository {
    switch (RepositoryConfig.mode) {
      case RepositoryMode.mock:
        return new MockEqubRepository();
      case RepositoryMode.backend:
        // For MVP, we use a single in-memory storage instance
        // In production, this would be replaced with actual DB/API client
        return new EqubBackendRepository(new InMemoryBackendStorage());
    }
  }

  /** Get AuthRepository based on current mode. */
  static getAuthRepository(): AuthRepository {
    switch (RepositoryConfig.mode) {
      case RepositoryMode.mock:
        // TODO: Create MockAuthRepository if needed
        return new AuthBackendRepository(); // For now, use backend (will throw)
      case RepositoryMode.backend:
        return new AuthBackendRepository();
    }
  }
}
