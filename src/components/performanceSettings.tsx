import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useMediaPreloader } from '../lib/mediaPreloader';
import { gameData } from '../services/gameService';
import { playerData } from '../services/playerService';
import { rosterData } from '../services/rosterService';

const PerformanceSettings: React.FC = () => {
  const [cacheStats, setCacheStats] = useState({ entries: 0, sizeKB: 0, hitRate: 0 });
  const [isClearing, setIsClearing] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<{games: number, players: number, rosters: number} | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const { getCacheStats, clearCache } = useMediaPreloader();

  const refreshStats = () => {
    setCacheStats(getCacheStats());
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [getCacheStats]);

  const handleClearFrontendCache = async () => {
    setIsClearing(true);
    try {
      clearCache();
      refreshStats();
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearBackendCache = async () => {
    setIsClearing(true);
    try {
      await invoke('clear_media_cache');
      refreshStats();
    } catch (error) {
      console.error('Failed to clear backend cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllCaches = async () => {
    setIsClearing(true);
    try {
      await Promise.all([
        clearCache(),
        invoke('clear_media_cache'),
        gameData.clearGamesCache()
      ]);
      refreshStats();
    } catch (error) {
      console.error('Failed to clear caches:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const runDatabaseBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      // Clear all caches first for fair comparison
      gameData.clearGamesCache();
      
      // Benchmark games
      const gamesStart = performance.now();
      await gameData.getGames(100);
      const gamesTime = performance.now() - gamesStart;

      // Benchmark players
      const playersStart = performance.now();
      await playerData.getPlayers(100);
      const playersTime = performance.now() - playersStart;

      // Benchmark rosters
      const rostersStart = performance.now();
      await rosterData.getRosters(100);
      const rostersTime = performance.now() - rostersStart;

      setBenchmarkResults({
        games: Math.round(gamesTime),
        players: Math.round(playersTime),
        rosters: Math.round(rostersTime)
      });
      
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance & Cache Management</h3>
      
      {/* Cache Statistics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cache Statistics (Frontend)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm text-blue-600 font-medium">Cached Items</div>
            <div className="text-2xl font-bold text-blue-900">{cacheStats.entries}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-sm text-green-600 font-medium">Cache Size</div>
            <div className="text-2xl font-bold text-green-900">{cacheStats.sizeKB} KB</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm text-purple-600 font-medium">Memory Used</div>
            <div className="text-2xl font-bold text-purple-900">
              {cacheStats.sizeKB > 1024 ? `${(cacheStats.sizeKB / 1024).toFixed(1)} MB` : `${cacheStats.sizeKB} KB`}
            </div>
          </div>
        </div>
      </div>

      {/* Cache Management Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Cache Management</h4>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearFrontendCache}
            disabled={isClearing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Clearing...' : 'Clear Frontend Cache'}
          </button>
          
          <button
            onClick={handleClearBackendCache}
            disabled={isClearing}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Clearing...' : 'Clear Backend Cache'}
          </button>
          
          <button
            onClick={handleClearAllCaches}
            disabled={isClearing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Clearing...' : 'Clear All Caches'}
          </button>
        </div>
      </div>

      {/* Database Performance Benchmark */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Database Performance Benchmark</h4>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={runDatabaseBenchmark}
            disabled={isBenchmarking}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBenchmarking ? 'Benchmarking...' : 'Run Benchmark'}
          </button>
          <span className="text-sm text-gray-600">Test loading speed of games, players, and rosters</span>
        </div>
        
        {benchmarkResults && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-600 font-medium">Games Load Time</div>
              <div className="text-2xl font-bold text-blue-900">{benchmarkResults.games}ms</div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-sm text-green-600 font-medium">Players Load Time</div>
              <div className="text-2xl font-bold text-green-900">{benchmarkResults.players}ms</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="text-sm text-purple-600 font-medium">Rosters Load Time</div>
              <div className="text-2xl font-bold text-purple-900">{benchmarkResults.rosters}ms</div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Games load slower due to complex JSON data - now cached for 5 seconds</li>
          <li>• Media files are cached automatically for faster loading</li>
          <li>• Large video files may take longer to load initially but will be cached</li>
          <li>• Clear caches if you notice high memory usage</li>
          <li>• Run benchmarks to identify performance bottlenecks</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceSettings;