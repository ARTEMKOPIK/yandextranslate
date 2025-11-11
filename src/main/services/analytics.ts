import Store from 'electron-store';
import { logger } from './logger.js';

export interface UsageMetrics {
  translations: number;
  favorites: number;
  pastes: number;
  copies: number;
  overlayShows: number;
  errors: number;
  lastReset: number;
}

export interface AnalyticsStats extends UsageMetrics {
  since: string;
  daysTracked: number;
}

interface StoreSchema {
  metrics: UsageMetrics;
}

const DEFAULT_METRICS: UsageMetrics = {
  translations: 0,
  favorites: 0,
  pastes: 0,
  copies: 0,
  overlayShows: 0,
  errors: 0,
  lastReset: Date.now(),
};

export class AnalyticsService {
  private static instance: AnalyticsService;
  private store: Store<StoreSchema>;

  private constructor() {
    this.store = new Store<StoreSchema>({
      name: 'app-analytics',
      defaults: {
        metrics: DEFAULT_METRICS,
      },
    });

    logger.info('Analytics service initialized', 'Analytics');
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getMetrics(): UsageMetrics {
    return this.store.get('metrics', DEFAULT_METRICS);
  }

  private updateMetrics(updates: Partial<UsageMetrics>): void {
    const current = this.getMetrics();
    const updated = { ...current, ...updates };
    this.store.set('metrics', updated);
  }

  trackTranslation(): void {
    const metrics = this.getMetrics();
    this.updateMetrics({ translations: metrics.translations + 1 });
    logger.info('Translation tracked', 'Analytics', { total: metrics.translations + 1 });
  }

  trackFavoriteToggle(isFavorite: boolean): void {
    const metrics = this.getMetrics();
    const newCount = isFavorite ? metrics.favorites + 1 : Math.max(0, metrics.favorites - 1);
    this.updateMetrics({ favorites: newCount });
    logger.info(`Favorite ${isFavorite ? 'added' : 'removed'}`, 'Analytics', { total: newCount });
  }

  trackPaste(): void {
    const metrics = this.getMetrics();
    this.updateMetrics({ pastes: metrics.pastes + 1 });
    logger.info('Paste tracked', 'Analytics', { total: metrics.pastes + 1 });
  }

  trackCopy(): void {
    const metrics = this.getMetrics();
    this.updateMetrics({ copies: metrics.copies + 1 });
    logger.info('Copy tracked', 'Analytics', { total: metrics.copies + 1 });
  }

  trackOverlayShow(): void {
    const metrics = this.getMetrics();
    this.updateMetrics({ overlayShows: metrics.overlayShows + 1 });
    logger.debug('Overlay show tracked', 'Analytics', { total: metrics.overlayShows + 1 });
  }

  trackError(): void {
    const metrics = this.getMetrics();
    this.updateMetrics({ errors: metrics.errors + 1 });
    logger.warn('Error tracked', 'Analytics', { total: metrics.errors + 1 });
  }

  getStats(): AnalyticsStats {
    const metrics = this.getMetrics();
    const daysSinceReset = Math.floor((Date.now() - metrics.lastReset) / (1000 * 60 * 60 * 24));

    return {
      ...metrics,
      since: new Date(metrics.lastReset).toISOString(),
      daysTracked: daysSinceReset,
    };
  }

  reset(): UsageMetrics {
    const resetMetrics: UsageMetrics = {
      ...DEFAULT_METRICS,
      lastReset: Date.now(),
    };
    this.store.set('metrics', resetMetrics);
    logger.info('Analytics metrics reset', 'Analytics');
    return resetMetrics;
  }

  exportStats(): string {
    const stats = this.getStats();
    return JSON.stringify(stats, null, 2);
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
