import { useEffect, useState, useMemo } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useScoreStore } from '../stores/scoresStore';
import { useGameStore } from '../stores/gamesStore';
import { usePlayerStore } from '../stores/playersStore';
import { useRosterStore } from '../stores/rostersStore';
import { ScoreDataItem } from '../lib/types';
import PlayerSearchInput from './playerSearchInput';

type FilterSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label: string;
  options: { label: string; value: string }[];
};

function FilterSelect({ value, onValueChange, placeholder, label, options }: FilterSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className="
          inline-flex items-center justify-center
          bg-slate-800 leading-none shadow-sm
          p-1 px-3 gap-1
          rounded-full outline-none
          hover:bg-blue-600/20
          data-[placeholder]:text-slate-300
          text-lg cursor-pointer min-h-[2.5rem]
          min-w-[160px] justify-start
        "
        aria-label={label}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="ml-auto pl-2">
          <ChevronDownIcon className="w-4 h-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md bg-slate-700/75 shadow-lg z-50">
          <Select.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-slate-900/87">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-[5px] bg-slate-700/75">
            <Select.Group>
              <Select.Label className="px-[25px] text-xl leading-[25px]">
                {label}
              </Select.Label>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="
                    relative flex select-none items-center
                    rounded-lg bg-slate-600/75 mb-1
                    text-sm leading-none cursor-pointer
                    hover:bg-blue-600/20
                    data-[disabled]:pointer-events-none
                  "
                >
                  <Select.ItemText>
                    <div className="flex flex-row items-center gap-2 text-xl p-1 pl-8 rounded-full">
                      <span>{option.label}</span>
                    </div>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                    •
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-slate-900/87">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function ViewActivity(): JSX.Element {
  const { recentScores, fetchRecentScores } = useScoreStore();
  const { games, fetchGames } = useGameStore();
  const { players, fetchPlayers } = usePlayerStore();
  const { rosters, fetchRosters } = useRosterStore();

  const [gameFilter, setGameFilter] = useState<string>('all');
  const [rosterFilter, setRosterFilter] = useState<string>('all');
  const [playerFilter, setPlayerFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentScores();
    fetchGames();
    fetchPlayers();
    fetchRosters();
  }, []);

  const getGameName = (gameSnowflake: string): string => {
    const game = games.find((g) => g.snowflake === gameSnowflake);
    return game?.name || 'Unknown Game';
  };

  const getGameRosterSnowflake = (gameSnowflake: string): string | null => {
    const game = games.find((g) => g.snowflake === gameSnowflake);
    return game?.roster || null;
  };

  const getRosterName = (gameSnowflake: string): string | null => {
    const rosterSnowflake = getGameRosterSnowflake(gameSnowflake);
    if (!rosterSnowflake) return null;
    const roster = rosters.find((r) => r.snowflake === rosterSnowflake);
    return roster?.name || null;
  };

  const getPlayerName = (playerSnowflake: string): string => {
    const player = players.find((p) => p.snowflake === playerSnowflake);
    return player?.name || 'Unknown Player';
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDatum = (score: ScoreDataItem): string => {
    const { unit_type, datum } = score;
    switch (unit_type) {
      case 'flag':
        return Number(datum) === 1 ? 'Completed' : 'Not completed';
      case 'time':
        return `${datum}s`;
      default:
        return String(datum);
    }
  };

  // Build options for game filter
  const gameOptions = useMemo(() => {
    const gameSnowflakes = new Set(recentScores.map((s) => s.game));
    const gamesWithScores = games.filter((g) => g.snowflake && gameSnowflakes.has(g.snowflake));
    return [
      { label: 'All Games', value: 'all' },
      ...gamesWithScores.map((g) => ({ label: g.name, value: g.snowflake || '' })),
    ];
  }, [recentScores, games]);

  // Build options for roster filter
  const rosterOptions = useMemo(() => {
    const gameSnowflakes = new Set(recentScores.map((s) => s.game));
    const gamesWithScores = games.filter((g) => g.snowflake && gameSnowflakes.has(g.snowflake));
    const rosterSnowflakes = new Set(
      gamesWithScores.map((g) => g.roster).filter((r): r is string => !!r)
    );
    const rostersWithScores = rosters.filter((r) => r.snowflake && rosterSnowflakes.has(r.snowflake));
    return [
      { label: 'All Rosters', value: 'all' },
      ...rostersWithScores.map((r) => ({ label: r.name, value: r.snowflake || '' })),
    ];
  }, [recentScores, games, rosters]);

  // When game filter changes, reset roster filter if it no longer applies
  useEffect(() => {
    if (gameFilter !== 'all') {
      const game = games.find((g) => g.snowflake === gameFilter);
      if (rosterFilter !== 'all' && game?.roster !== rosterFilter) {
        setRosterFilter('all');
      }
    }
  }, [gameFilter]);

  // When roster filter changes, reset game filter if it no longer applies
  useEffect(() => {
    if (rosterFilter !== 'all' && gameFilter !== 'all') {
      const game = games.find((g) => g.snowflake === gameFilter);
      if (game?.roster !== rosterFilter) {
        setGameFilter('all');
      }
    }
  }, [rosterFilter]);

  const hasActiveFilters = gameFilter !== 'all' || rosterFilter !== 'all' || playerFilter !== null;

  const filteredScores = useMemo(() => {
    return recentScores.filter((score) => {
      if (gameFilter !== 'all' && score.game !== gameFilter) return false;
      if (rosterFilter !== 'all') {
        const gameRoster = getGameRosterSnowflake(score.game);
        if (gameRoster !== rosterFilter) return false;
      }
      if (playerFilter && score.player !== playerFilter) return false;
      return true;
    });
  }, [recentScores, gameFilter, rosterFilter, playerFilter, games]);

  const clearAllFilters = () => {
    setGameFilter('all');
    setRosterFilter('all');
    setPlayerFilter(null);
  };

  return (
    <div className="m-2 w-full max-w-4xl">
      <div className="overflow-y-auto h-[calc(100vh-120px)] rounded-lg">
        <div className="sticky top-0 bg-slate-800 z-10 p-4 pb-3">
          <h2 className="text-xl font-bold mb-3">Recent Activity</h2>
          <div className="flex flex-row gap-3 items-center flex-wrap">
            <FilterSelect
              value={gameFilter}
              onValueChange={setGameFilter}
              placeholder="All Games"
              label="Game"
              options={gameOptions}
            />
            {rosterOptions.length > 1 && (
              <FilterSelect
                value={rosterFilter}
                onValueChange={setRosterFilter}
                placeholder="All Rosters"
                label="Roster"
                options={rosterOptions}
              />
            )}
            <PlayerSearchInput
              onSelect={(snowflake) => setPlayerFilter(snowflake)}
              selectedPlayer={playerFilter}
            />
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        {filteredScores.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {recentScores.length === 0
              ? 'No score activity yet. Start recording scores in a game to see activity here.'
              : 'No activity matches the current filters.'}
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-4 pb-4">
            {filteredScores.map((score) => {
              const rosterName = getRosterName(score.game);
              return (
                <div
                  key={score.id}
                  className="flex flex-row items-center gap-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-md px-4 py-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-200 truncate">
                        {getPlayerName(score.player)}
                      </span>
                      <span className="text-slate-500">scored</span>
                      <span className="font-mono font-bold text-sky-400">
                        {formatDatum(score)}
                      </span>
                      <span className="text-slate-500">in</span>
                      <span className="font-medium text-slate-300 truncate">
                        {getGameName(score.game)}
                      </span>
                    </div>
                    {rosterName && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Roster: {rosterName}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-slate-500 whitespace-nowrap">
                    {formatTimestamp(score.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewActivity;
