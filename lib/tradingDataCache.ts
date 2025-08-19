/**
 * Advanced Trading Data Cache Service
 * High-performance browser memory caching with intelligent updates
 */

import type { AdvancedTradeData } from '@/hooks/useAdvancedTradingData';

// Cache configuration
const CACHE_CONFIG = {
  // Cache duration in milliseconds
  FULL_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  INCREMENTAL_UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Memory management
  MAX_CACHE_SIZE: 10000, // Maximum number of trades to cache
  CLEANUP_THRESHOLD: 0.8, // Clean up when cache reaches 80% of max size
  
  // Performance settings
  BATCH_SIZE: 1000, // Batch size for processing large datasets
  INDEX_REBUILD_THRESHOLD: 100, // Rebuild indexes when cache grows by this amount
};

// Cache statistics interface
export interface CacheStatistics {
  totalTrades: number;
  completedTrades: number;
  activeTrades: number;
  cacheHitRate: number;
  lastFullUpdate: Date;
  lastIncrementalUpdate: Date;
  memoryUsage: number; // Estimated memory usage in KB
  isValid: boolean;
  age: number; // Cache age in milliseconds
}

// Cache data structure with metadata
interface CacheEntry {
  data: AdvancedTradeData;
  lastAccessed: Date;
  accessCount: number;
}

// Indexed cache for fast lookups
interface IndexedCache {
  // Core data storage
  entries: Map<number, CacheEntry>;
  
  // Performance indexes
  symbolIndex: Map<string, Set<number>>;
  dateIndex: Map<string, Set<number>>;
  typeIndex: Map<'completed' | 'active', Set<number>>;
  
  // Cache metadata
  metadata: {
    lastFullUpdate: Date;
    lastIncrementalUpdate: Date;
    totalHits: number;
    totalMisses: number;
    isValid: boolean;
    version: number;
  };
}

export class TradingDataCacheService {
  private static instance: TradingDataCacheService;
  private cache: IndexedCache;
  private readonly storageKey = 'trading-data-cache-v2';

  constructor() {
    this.cache = this.initializeCache();
    // Only load from localStorage in browser environment
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  static getInstance(): TradingDataCacheService {
    if (!TradingDataCacheService.instance) {
      TradingDataCacheService.instance = new TradingDataCacheService();
    }
    return TradingDataCacheService.instance;
  }

  /**
   * Initialize empty cache structure
   */
  private initializeCache(): IndexedCache {
    const now = new Date();
    return {
      entries: new Map(),
      symbolIndex: new Map(),
      dateIndex: new Map(),
      typeIndex: new Map([
        ['completed', new Set()],
        ['active', new Set()],
      ]),
      metadata: {
        lastFullUpdate: now,
        lastIncrementalUpdate: now,
        totalHits: 0,
        totalMisses: 0,
        isValid: false,
        version: 1,
      },
    };
  }

  /**
   * Check if cache is valid and not expired
   */
  isValid(): boolean {
    if (!this.cache.metadata.isValid) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - this.cache.metadata.lastFullUpdate.getTime();
    return timeDiff < CACHE_CONFIG.FULL_CACHE_DURATION;
  }

  /**
   * Check if incremental update is needed
   */
  needsIncrementalUpdate(): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.cache.metadata.lastIncrementalUpdate.getTime();
    return timeDiff >= CACHE_CONFIG.INCREMENTAL_UPDATE_INTERVAL;
  }

  /**
   * Set full cache data with batch processing for performance
   */
  async setFullCache(completedTrades: AdvancedTradeData[], activeTrades: AdvancedTradeData[]): Promise<void> {
    // Clear existing cache
    this.clearCache();
    
    // Debug logging for cache
    console.log('=== DEBUG: Cache setFullCache ===');
    console.log('Completed trades to cache:', completedTrades.length);
    console.log('Active trades to cache:', activeTrades.length);
    
    // Check for duplicates
    const completedIds = new Set();
    const activeIds = new Set();
    let duplicateCompleted = 0;
    let duplicateActive = 0;
    
    completedTrades.forEach(trade => {
      if (completedIds.has(trade.id)) {
        duplicateCompleted++;
        console.warn(`Duplicate completed trade ID: ${trade.id}`);
      }
      completedIds.add(trade.id);
    });
    
    activeTrades.forEach(trade => {
      if (activeIds.has(trade.id)) {
        duplicateActive++;
        console.warn(`Duplicate active trade ID: ${trade.id}`);
      }
      activeIds.add(trade.id);
    });
    
    console.log('Duplicate completed trades:', duplicateCompleted);
    console.log('Duplicate active trades:', duplicateActive);
    
    const allTrades = [...completedTrades, ...activeTrades];
    const now = new Date();

    // Process trades in batches to avoid blocking the main thread
    for (let i = 0; i < allTrades.length; i += CACHE_CONFIG.BATCH_SIZE) {
      const batch = allTrades.slice(i, i + CACHE_CONFIG.BATCH_SIZE);
      
      // Process batch
      await this.processBatch(batch, now);
      
      // Yield control to prevent blocking
      if (i % (CACHE_CONFIG.BATCH_SIZE * 2) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Update metadata
    this.cache.metadata.lastFullUpdate = now;
    this.cache.metadata.lastIncrementalUpdate = now;
    this.cache.metadata.isValid = true;
    this.cache.metadata.version++;

    // Save to localStorage
    this.saveToLocalStorage();
  }

  /**
   * Process a batch of trades and update indexes
   */
  private async processBatch(trades: AdvancedTradeData[], timestamp: Date): Promise<void> {
    for (const trade of trades) {
      const entry: CacheEntry = {
        data: trade,
        lastAccessed: timestamp,
        accessCount: 0,
      };

      // Store in main cache
      this.cache.entries.set(trade.id, entry);

      // Update indexes
      this.updateIndexes(trade);
    }
  }

  /**
   * Update all indexes for a trade
   */
  private updateIndexes(trade: AdvancedTradeData): void {
    const { id, symbol, trade_date, type } = trade;

    // Symbol index
    if (!this.cache.symbolIndex.has(symbol)) {
      this.cache.symbolIndex.set(symbol, new Set());
    }
    this.cache.symbolIndex.get(symbol)!.add(id);

    // Date index (group by day)
    const dateKey = trade_date.split('T')[0];
    if (!this.cache.dateIndex.has(dateKey)) {
      this.cache.dateIndex.set(dateKey, new Set());
    }
    this.cache.dateIndex.get(dateKey)!.add(id);

    // Type index
    this.cache.typeIndex.get(type)!.add(id);
  }

  /**
   * Remove indexes for a trade
   */
  private removeIndexes(trade: AdvancedTradeData): void {
    const { id, symbol, trade_date, type } = trade;

    // Symbol index
    const symbolSet = this.cache.symbolIndex.get(symbol);
    if (symbolSet) {
      symbolSet.delete(id);
      if (symbolSet.size === 0) {
        this.cache.symbolIndex.delete(symbol);
      }
    }

    // Date index
    const dateKey = trade_date.split('T')[0];
    const dateSet = this.cache.dateIndex.get(dateKey);
    if (dateSet) {
      dateSet.delete(id);
      if (dateSet.size === 0) {
        this.cache.dateIndex.delete(dateKey);
      }
    }

    // Type index
    this.cache.typeIndex.get(type)!.delete(id);
  }

  /**
   * Update cache with incremental data
   */
  async updateIncrementalCache(newCompletedTrades: AdvancedTradeData[], newActiveTrades: AdvancedTradeData[]): Promise<void> {
    const allNewTrades = [...newCompletedTrades, ...newActiveTrades];
    const now = new Date();

    // Add new trades to cache
    for (const trade of allNewTrades) {
      // Check if trade already exists
      if (!this.cache.entries.has(trade.id)) {
        const entry: CacheEntry = {
          data: trade,
          lastAccessed: now,
          accessCount: 0,
        };

        this.cache.entries.set(trade.id, entry);
        this.updateIndexes(trade);
      }
    }

    // Update metadata
    this.cache.metadata.lastIncrementalUpdate = now;
    this.cache.metadata.version++;

    // Check if cache needs cleanup
    if (this.cache.entries.size > CACHE_CONFIG.MAX_CACHE_SIZE * CACHE_CONFIG.CLEANUP_THRESHOLD) {
      await this.performCleanup();
    }

    // Save to localStorage
    this.saveToLocalStorage();
  }

  /**
   * Get all cached data
   */
  getAllData(): { completed: AdvancedTradeData[]; active: AdvancedTradeData[] } {
    this.cache.metadata.totalHits++;

    const completed: AdvancedTradeData[] = [];
    const active: AdvancedTradeData[] = [];

    for (const entry of this.cache.entries.values()) {
      entry.lastAccessed = new Date();
      entry.accessCount++;

      if (entry.data.type === 'completed') {
        completed.push(entry.data);
      } else {
        active.push(entry.data);
      }
    }

    return { completed, active };
  }

  /**
   * Get trades by symbol (optimized with index)
   */
  getTradesBySymbol(symbol: string): AdvancedTradeData[] {
    const tradeIds = this.cache.symbolIndex.get(symbol);
    if (!tradeIds) {
      this.cache.metadata.totalMisses++;
      return [];
    }

    this.cache.metadata.totalHits++;
    const trades: AdvancedTradeData[] = [];

    for (const id of tradeIds) {
      const entry = this.cache.entries.get(id);
      if (entry) {
        entry.lastAccessed = new Date();
        entry.accessCount++;
        trades.push(entry.data);
      }
    }

    return trades;
  }

  /**
   * Get trades by date range (optimized with index)
   */
  getTradesByDateRange(startDate: string, endDate: string): AdvancedTradeData[] {
    const trades: AdvancedTradeData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Iterate through date index
    for (const [dateKey, tradeIds] of this.cache.dateIndex.entries()) {
      const date = new Date(dateKey);
      if (date >= start && date <= end) {
        for (const id of tradeIds) {
          const entry = this.cache.entries.get(id);
          if (entry) {
            entry.lastAccessed = new Date();
            entry.accessCount++;
            trades.push(entry.data);
          }
        }
      }
    }

    this.cache.metadata.totalHits++;
    return trades;
  }

  /**
   * Get trades by type (completed or active)
   */
  getTradesByType(type: 'completed' | 'active'): AdvancedTradeData[] {
    const tradeIds = this.cache.typeIndex.get(type);
    if (!tradeIds) {
      this.cache.metadata.totalMisses++;
      return [];
    }

    this.cache.metadata.totalHits++;
    const trades: AdvancedTradeData[] = [];

    for (const id of tradeIds) {
      const entry = this.cache.entries.get(id);
      if (entry) {
        entry.lastAccessed = new Date();
        entry.accessCount++;
        trades.push(entry.data);
      }
    }

    return trades;
  }

  /**
   * Get cache statistics
   */
  getStatistics(): CacheStatistics {
    const now = new Date();
    const { completed, active } = this.getAllData();
    
    const totalRequests = this.cache.metadata.totalHits + this.cache.metadata.totalMisses;
    const cacheHitRate = totalRequests > 0 ? (this.cache.metadata.totalHits / totalRequests) * 100 : 0;
    
    // Estimate memory usage (rough calculation)
    const estimatedMemoryKB = (this.cache.entries.size * 500) / 1024; // ~500 bytes per trade entry

    return {
      totalTrades: this.cache.entries.size,
      completedTrades: completed.length,
      activeTrades: active.length,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      lastFullUpdate: this.cache.metadata.lastFullUpdate,
      lastIncrementalUpdate: this.cache.metadata.lastIncrementalUpdate,
      memoryUsage: Math.round(estimatedMemoryKB * 100) / 100,
      isValid: this.isValid(),
      age: now.getTime() - this.cache.metadata.lastFullUpdate.getTime(),
    };
  }

  /**
   * Perform cache cleanup to maintain performance
   */
  private async performCleanup(): Promise<void> {
    const entries = Array.from(this.cache.entries.entries());
    
    // Sort by access frequency and recency (LRU + LFU)
    entries.sort(([, a], [, b]) => {
      const aScore = a.accessCount * 0.7 + (Date.now() - a.lastAccessed.getTime()) * 0.3;
      const bScore = b.accessCount * 0.7 + (Date.now() - b.lastAccessed.getTime()) * 0.3;
      return aScore - bScore;
    });

    // Remove least valuable entries
    const removeCount = Math.floor(entries.length * 0.2); // Remove 20% of cache
    const toRemove = entries.slice(0, removeCount);

    for (const [id, entry] of toRemove) {
      this.cache.entries.delete(id);
      this.removeIndexes(entry.data);
    }
  }

  /**
   * Save cache to localStorage for persistence
   */
  private saveToLocalStorage(): void {
    // Only save in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const { completed, active } = this.getAllData();
      const cacheData = {
        completed,
        active,
        metadata: this.cache.metadata,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    // Only load in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      
      // Check if cache is too old
      const age = Date.now() - cacheData.timestamp;
      if (age > CACHE_CONFIG.FULL_CACHE_DURATION) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(this.storageKey);
        }
        return;
      }

      // Restore cache
      this.setFullCache(cacheData.completed, cacheData.active);
      this.cache.metadata = {
        ...cacheData.metadata,
        lastFullUpdate: new Date(cacheData.metadata.lastFullUpdate),
        lastIncrementalUpdate: new Date(cacheData.metadata.lastIncrementalUpdate),
      };
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  /**
   * Clear all cache data
   */
  clearCache(): void {
    this.cache = this.initializeCache();
    // Only clear localStorage in browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Invalidate cache (mark as invalid but keep data for fallback)
   */
  invalidateCache(): void {
    this.cache.metadata.isValid = false;
  }

  /**
   * Get unique symbols from cache
   */
  getUniqueSymbols(): string[] {
    return Array.from(this.cache.symbolIndex.keys()).sort();
  }

  /**
   * Get date range of cached data
   */
  getDataDateRange(): { startDate: string; endDate: string } | null {
    const dates = Array.from(this.cache.dateIndex.keys()).sort();
    if (dates.length === 0) return null;

    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
    };
  }
}