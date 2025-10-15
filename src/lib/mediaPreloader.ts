// Media preloader and cache service
import { invoke } from '@tauri-apps/api/core';

interface MediaCacheItem {
  dataUrl: string;
  timestamp: number;
  size: number;
}

class MediaPreloader {
  private cache = new Map<string, MediaCacheItem>();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB limit
  private currentCacheSize = 0;

  // Preload media files in background
  async preloadMedia(fileNames: string[], type: 'image' | 'video' = 'image'): Promise<void> {
    const preloadPromises = fileNames.map(fileName => this.loadMedia(fileName, type));
    await Promise.allSettled(preloadPromises);
  }

  // Get media with cache-first strategy
  async getMedia(fileName: string, type: 'image' | 'video' = 'image'): Promise<string> {
    // Check cache first
    const cached = this.cache.get(fileName);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_EXPIRY) {
      console.log('MediaPreloader: Cache hit for', fileName);
      return cached.dataUrl;
    }

    // Load from filesystem
    return this.loadMedia(fileName, type);
  }

  private async loadMedia(fileName: string, type: 'image' | 'video'): Promise<string> {
    try {
      const command = type === 'image' ? 'get_background_image_data' : 'get_background_video_data';
      const dataUrl = await invoke(command, { fileName }) as string;
      
      // Calculate size (approximate)
      const size = dataUrl.length * 0.75; // Base64 is ~33% larger than binary
      
      // Check if we need to clear cache
      if (this.currentCacheSize + size > this.MAX_CACHE_SIZE) {
        this.clearOldEntries();
      }

      // Cache the result
      this.cache.set(fileName, {
        dataUrl,
        timestamp: Date.now(),
        size
      });
      
      this.currentCacheSize += size;
      console.log('MediaPreloader: Cached', fileName, 'Size:', Math.round(size / 1024), 'KB');
      
      return dataUrl;
    } catch (error) {
      console.error('MediaPreloader: Failed to load', fileName, error);
      return '';
    }
  }

  private clearOldEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by timestamp (oldest first)
    
    // Remove oldest entries until we're under 75% of max size
    const targetSize = this.MAX_CACHE_SIZE * 0.75;
    while (this.currentCacheSize > targetSize && entries.length > 0) {
      const [fileName, item] = entries.shift()!;
      this.cache.delete(fileName);
      this.currentCacheSize -= item.size;
      console.log('MediaPreloader: Evicted', fileName, 'from cache');
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    console.log('MediaPreloader: Cache cleared');
  }

  // Get cache stats
  getCacheStats(): { entries: number; sizeKB: number; hitRate: number } {
    return {
      entries: this.cache.size,
      sizeKB: Math.round(this.currentCacheSize / 1024),
      hitRate: 0 // Would need hit/miss tracking for this
    };
  }
}

// Global singleton instance
export const mediaPreloader = new MediaPreloader();

// React hook for using the preloader
export const useMediaPreloader = () => {
  return {
    preloadMedia: mediaPreloader.preloadMedia.bind(mediaPreloader),
    getMedia: mediaPreloader.getMedia.bind(mediaPreloader),
    clearCache: mediaPreloader.clearCache.bind(mediaPreloader),
    getCacheStats: mediaPreloader.getCacheStats.bind(mediaPreloader),
  };
};