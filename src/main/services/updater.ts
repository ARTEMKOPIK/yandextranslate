import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { BrowserWindow } from 'electron';
import { logger } from './logger.js';
import Store from 'electron-store';

interface UpdateConfig {
  autoDownload: boolean;
  allowPrerelease: boolean;
  allowDowngrade: boolean;
}

interface SkippedVersion {
  version: string;
  skippedAt: number;
}

interface UpdaterStore {
  skippedVersions: SkippedVersion[];
  autoDownload: boolean;
  allowPrerelease: boolean;
}

export class UpdaterService {
  private static instance: UpdaterService | null = null;
  private store: Store<UpdaterStore>;
  private checkingForUpdate = false;
  private updateDownloading = false;
  private updateDownloaded = false;
  private windows: BrowserWindow[] = [];

  private constructor() {
    this.store = new Store<UpdaterStore>({
      name: 'app-updater',
      defaults: {
        skippedVersions: [],
        autoDownload: true,
        allowPrerelease: false,
      },
    });

    this.configureAutoUpdater();
    this.setupEventHandlers();
  }

  public static getInstance(): UpdaterService {
    if (!UpdaterService.instance) {
      UpdaterService.instance = new UpdaterService();
    }
    return UpdaterService.instance;
  }

  private configureAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = this.store.get('autoDownload', true);
    autoUpdater.allowPrerelease = this.store.get('allowPrerelease', false);
    autoUpdater.allowDowngrade = false;

    // Set logging
    autoUpdater.logger = {
      info: (message: string) => logger.info(message, 'AutoUpdater'),
      warn: (message: string) => logger.warn(message, 'AutoUpdater'),
      error: (message: string) => logger.error(message, 'AutoUpdater'),
      debug: (message: string) => logger.debug(message, 'AutoUpdater'),
    };

    logger.info('Auto-updater configured', 'AutoUpdater', {
      autoDownload: autoUpdater.autoDownload,
      allowPrerelease: autoUpdater.allowPrerelease,
    });
  }

  private setupEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
      this.checkingForUpdate = true;
      logger.info('Checking for updates', 'AutoUpdater');
      this.notifyWindows('update-checking');
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.checkingForUpdate = false;
      logger.info('Update available', 'AutoUpdater', {
        version: info.version,
        releaseDate: info.releaseDate,
      });

      // Check if this version was skipped
      if (this.isVersionSkipped(info.version)) {
        logger.info('Update skipped by user', 'AutoUpdater', { version: info.version });
        this.notifyWindows('update-skipped', { version: info.version });
        return;
      }

      this.notifyWindows('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
        stagingPercentage: info.stagingPercentage,
      });
    });

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.checkingForUpdate = false;
      logger.info('No update available', 'AutoUpdater', { version: info.version });
      this.notifyWindows('update-not-available', { version: info.version });
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.updateDownloading = true;
      logger.debug('Download progress', 'AutoUpdater', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
      });

      this.notifyWindows('update-download-progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.updateDownloading = false;
      this.updateDownloaded = true;
      logger.info('Update downloaded', 'AutoUpdater', { version: info.version });
      this.notifyWindows('update-downloaded', { version: info.version });
    });

    autoUpdater.on('error', (error: Error) => {
      this.checkingForUpdate = false;
      this.updateDownloading = false;
      logger.error('Update error', 'AutoUpdater', { error: error.message, stack: error.stack });
      this.notifyWindows('update-error', { message: error.message });
    });
  }

  public registerWindow(window: BrowserWindow): void {
    if (!this.windows.includes(window)) {
      this.windows.push(window);
      logger.debug('Window registered for update notifications', 'AutoUpdater');
    }

    // Remove window from list when closed
    window.on('closed', () => {
      this.windows = this.windows.filter((w) => w !== window);
    });
  }

  private notifyWindows(event: string, data?: unknown): void {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(`updater:${event}`, data);
      }
    });
  }

  public async checkForUpdates(silent = false): Promise<{
    success: boolean;
    updateAvailable?: boolean;
    version?: string;
    error?: string;
  }> {
    if (this.checkingForUpdate) {
      return { success: false, error: 'Already checking for updates' };
    }

    try {
      logger.info('Starting update check', 'AutoUpdater', { silent });
      const result = await autoUpdater.checkForUpdates();

      if (!result) {
        return { success: false, error: 'Update check returned no result' };
      }

      const updateAvailable = result.updateInfo.version !== autoUpdater.currentVersion.version;
      const isSkipped = this.isVersionSkipped(result.updateInfo.version);

      return {
        success: true,
        updateAvailable: updateAvailable && !isSkipped,
        version: result.updateInfo.version,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to check for updates', 'AutoUpdater', { error: message });
      if (!silent) {
        this.notifyWindows('update-error', { message });
      }
      return { success: false, error: message };
    }
  }

  public async downloadUpdate(): Promise<{ success: boolean; error?: string }> {
    if (this.updateDownloading) {
      return { success: false, error: 'Update already downloading' };
    }

    if (this.updateDownloaded) {
      return { success: true };
    }

    try {
      logger.info('Starting update download', 'AutoUpdater');
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to download update', 'AutoUpdater', { error: message });
      return { success: false, error: message };
    }
  }

  public quitAndInstall(): void {
    if (!this.updateDownloaded) {
      logger.warn('No update downloaded to install', 'AutoUpdater');
      return;
    }

    logger.info('Quitting and installing update', 'AutoUpdater');
    autoUpdater.quitAndInstall(false, true);
  }

  public skipVersion(version: string): void {
    const skippedVersions = this.store.get('skippedVersions', []);

    // Remove any existing skip for this version
    const filtered = skippedVersions.filter((v) => v.version !== version);

    // Add new skip
    filtered.push({
      version,
      skippedAt: Date.now(),
    });

    // Keep only last 10 skipped versions
    if (filtered.length > 10) {
      filtered.splice(0, filtered.length - 10);
    }

    this.store.set('skippedVersions', filtered);
    logger.info('Version skipped', 'AutoUpdater', { version });
  }

  public clearSkippedVersions(): void {
    this.store.set('skippedVersions', []);
    logger.info('Cleared all skipped versions', 'AutoUpdater');
  }

  private isVersionSkipped(version: string): boolean {
    const skippedVersions = this.store.get('skippedVersions', []);
    return skippedVersions.some((v) => v.version === version);
  }

  public getSkippedVersions(): SkippedVersion[] {
    return this.store.get('skippedVersions', []);
  }

  public updateConfig(config: Partial<UpdateConfig>): void {
    if (config.autoDownload !== undefined) {
      this.store.set('autoDownload', config.autoDownload);
      autoUpdater.autoDownload = config.autoDownload;
      logger.info('Auto-download updated', 'AutoUpdater', { autoDownload: config.autoDownload });
    }

    if (config.allowPrerelease !== undefined) {
      this.store.set('allowPrerelease', config.allowPrerelease);
      autoUpdater.allowPrerelease = config.allowPrerelease;
      logger.info('Allow prerelease updated', 'AutoUpdater', {
        allowPrerelease: config.allowPrerelease,
      });
    }

    if (config.allowDowngrade !== undefined) {
      autoUpdater.allowDowngrade = config.allowDowngrade;
      logger.info('Allow downgrade updated', 'AutoUpdater', {
        allowDowngrade: config.allowDowngrade,
      });
    }
  }

  public getConfig(): UpdateConfig {
    return {
      autoDownload: this.store.get('autoDownload', true),
      allowPrerelease: this.store.get('allowPrerelease', false),
      allowDowngrade: autoUpdater.allowDowngrade || false,
    };
  }

  public getStatus(): {
    checking: boolean;
    downloading: boolean;
    downloaded: boolean;
    currentVersion: string;
  } {
    return {
      checking: this.checkingForUpdate,
      downloading: this.updateDownloading,
      downloaded: this.updateDownloaded,
      currentVersion: autoUpdater.currentVersion.version,
    };
  }
}

export const updater = UpdaterService.getInstance();
