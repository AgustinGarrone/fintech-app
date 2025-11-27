import { Request } from 'express';
import { ProblemError } from '../errors/ProblemError';

export const SUPPORTED_VERSIONS = ['v1'] as const;
export type ApiVersion = (typeof SUPPORTED_VERSIONS)[number];

export const DEFAULT_VERSION: ApiVersion = 'v1';
export const LATEST_VERSION: ApiVersion = 'v1';

interface VersionConfig {
  supportedVersions: readonly string[];
  defaultVersion: ApiVersion;
  latestVersion: ApiVersion;
  sunsetDays?: number;
}

/**
 * Class to handle api versioning
 */
export class VersionHandler {
  private readonly supportedVersions: readonly string[];
  private readonly defaultVersion: ApiVersion;
  private static instance: VersionHandler;

  constructor(config?: Partial<VersionConfig>) {
    this.supportedVersions = config?.supportedVersions || SUPPORTED_VERSIONS;
    this.defaultVersion = config?.defaultVersion || DEFAULT_VERSION;
  }

  public static getInstance(config?: Partial<VersionConfig>): VersionHandler {
    if (!VersionHandler.instance) {
      VersionHandler.instance = new VersionHandler(config);
    }
    return VersionHandler.instance;
  }

  /**
   * Extracts the version from the header
   */
  private extractFromHeader(req: Request): string | undefined {
    const acceptHeader = req.headers.accept;
    if (!acceptHeader) {
      return undefined;
    }

    const versionMatch = acceptHeader.match(/version=([^;,\s]+)/);
    return versionMatch ? versionMatch[1] : undefined;
  }

  /**
   * Normalizes the version (ensures format 'v1', 'v2', etc.)
   */
  private normalizeVersion(version: string): string {
    const normalized = version.toLowerCase();
    return normalized.startsWith('v') ? normalized : `v${normalized}`;
  }

  /**
   * Validates that the version is supported
   */
  private validateVersion(version: string): ApiVersion {
    const normalized = this.normalizeVersion(version);

    if (!this.supportedVersions.includes(normalized)) {
      throw ProblemError.badRequest(
        `Unsupported API version: ${version}. Supported versions: ${this.supportedVersions.join(
          ', ',
        )}`,
        {
          supportedVersions: this.supportedVersions,
          requestedVersion: version,
        },
      );
    }

    return normalized as ApiVersion;
  }

  private getVersion(req: Request): ApiVersion {
    let version = this.extractFromHeader(req);

    if (!version) {
      version = this.defaultVersion;
    }

    return this.validateVersion(version);
  }

  /**
   * Verifica si una versión está soportada
   */
  public isVersionSupported(version: string): boolean {
    try {
      const normalized = this.normalizeVersion(version);
      return this.supportedVersions.includes(normalized);
    } catch {
      return false;
    }
  }
}
