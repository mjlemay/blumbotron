import { useState, useEffect, useMemo } from 'react';
import Input from './input';
import { DataItem } from '../lib/types';
import { CircleBackslashIcon } from '@radix-ui/react-icons';
import { usePlayerStore } from '../stores/playersStore';
import IconRfid from './iconRfid';
import IconQr from './iconQr';
import { useRFIDNumber, useScannerContext } from '../lib/useRFIDNumber';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import { invoke } from '@tauri-apps/api/core';
import * as ScrollArea from '@radix-ui/react-scroll-area';

type PlayerSearchInputProps = {
  onSelect: (playerSnowflake: string | null) => void;
  selectedPlayer?: string | null;
  allowList?: string[] | null;
};

function PlayerSearchInput({ onSelect, selectedPlayer, allowList }: PlayerSearchInputProps): JSX.Element {
  const { players, fetchPlayers } = usePlayerStore();
  const [searchValue, setSearchValue] = useState<string>('');
  const [injected, setInjected] = useState<string>('');
  const { rfidCode, resetCode } = useRFIDNumber(injected !== '', injected);
  const { openQrScanner, isQrScannerOpen } = useScannerContext();
  const [avatarCache, setAvatarCache] = useState<Record<string, string>>({});

  const usedPlayers = allowList && allowList.length > 0
    ? players?.filter((player: DataItem) => allowList?.includes(player?.snowflake || ''))
    : players;

  const filteredPlayers = usedPlayers.filter(player => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    if (player.name.toLowerCase().includes(searchLower)) return true;
    if (player.id?.toString().includes(searchValue)) return true;
    if (player.snowflake?.toLowerCase().includes(searchLower)) return true;
    if (player.data && typeof player.data === 'object') {
      const alternateIds = player.data.alternateIds;
      if (alternateIds && typeof alternateIds === 'object') {
        const alternateIdsObj = alternateIds as Record<string, unknown>;
        for (const [key, value] of Object.entries(alternateIdsObj)) {
          if (key.toLowerCase().includes(searchLower) ||
              String(value).toLowerCase().includes(searchLower)) {
            return true;
          }
        }
      }
    }
    return false;
  });

  const selectedPlayerObj = useMemo(() => {
    return usedPlayers.find(p => p.snowflake === selectedPlayer);
  }, [selectedPlayer, usedPlayers]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (rfidCode && injected === 'activityPlayerSearch') {
      setSearchValue(rfidCode);
      setInjected('');
      resetCode();
    }
  }, [rfidCode, injected, resetCode]);

  // Auto-select when only one player matches
  useEffect(() => {
    if (searchValue && filteredPlayers.length === 1 && !selectedPlayer) {
      onSelect(filteredPlayers[0].snowflake || null);
      setSearchValue('');
    }
  }, [filteredPlayers, searchValue, selectedPlayer]);

  // Load avatars
  useEffect(() => {
    const loadAvatars = async () => {
      for (const player of filteredPlayers) {
        const snowflake = player.snowflake || 'default';
        if (avatarCache[snowflake]) continue;
        const avatarImage = player.data && typeof player.data === 'object'
          ? (player.data as any).avatarImage
          : undefined;
        if (avatarImage) {
          try {
            let dataUrl: string;
            if (avatarImage.startsWith('data:')) {
              dataUrl = avatarImage;
            } else {
              dataUrl = await invoke('get_background_image_data', { fileName: avatarImage }) as string;
            }
            setAvatarCache(prev => ({ ...prev, [snowflake]: dataUrl }));
          } catch {
            const generated = createAvatar(shapes, { size: 40, seed: snowflake }).toDataUri();
            setAvatarCache(prev => ({ ...prev, [snowflake]: generated }));
          }
        } else {
          const generated = createAvatar(shapes, { size: 40, seed: snowflake }).toDataUri();
          setAvatarCache(prev => ({ ...prev, [snowflake]: generated }));
        }
      }
    };
    loadAvatars();
  }, [filteredPlayers]);

  const handleRfidClick = () => {
    if (isQrScannerOpen) return;
    if (injected === 'activityPlayerSearch') {
      setInjected('');
      setSearchValue('');
    } else {
      setInjected('activityPlayerSearch');
    }
  };

  const handleQrClick = () => {
    if (injected !== '') return;
    setInjected('activityPlayerSearch');
    openQrScanner(true);
  };

  const clearSelection = () => {
    onSelect(null);
    setSearchValue('');
  };

  if (selectedPlayer && selectedPlayerObj) {
    return (
      <button
        onClick={clearSelection}
        className="px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-600 transition-colors flex flex-row items-center gap-2"
      >
        <img
          src={avatarCache[selectedPlayerObj.snowflake || 'default'] || createAvatar(shapes, { size: 32, seed: selectedPlayerObj.snowflake || 'default' }).toDataUri()}
          alt={`${selectedPlayerObj.name} avatar`}
          className="rounded w-7 h-7 object-cover flex-shrink-0"
        />
        <span className="font-medium text-white text-sm">{selectedPlayerObj.name}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <Input
          name="activityPlayerSearch"
          value={searchValue}
          placeholder="Search players..."
          inline={true}
          injectable={injected === 'activityPlayerSearch'}
          changeHandler={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
        />
        <button
          className={`flex select-none items-center justify-center rounded shadow-sm h-[42px] w-[42px] transition-colors duration-200
            ${isQrScannerOpen ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'}`}
          onClick={handleRfidClick}
          disabled={isQrScannerOpen}
        >
          {injected === 'activityPlayerSearch' ? <CircleBackslashIcon /> : <IconRfid />}
        </button>
        <button
          className={`flex select-none items-center justify-center rounded shadow-sm h-[42px] w-[42px] transition-colors duration-200
            ${injected !== '' ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'}`}
          onClick={handleQrClick}
          disabled={injected !== ''}
        >
          <IconQr />
        </button>
      </div>
      {searchValue && filteredPlayers.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20">
          <ScrollArea.Root type="always" className="w-full rounded bg-slate-800 shadow-lg border border-slate-600 overflow-hidden" style={{ maxHeight: '12rem' }}>
            <ScrollArea.Viewport className="w-full h-full rounded pr-3">
              <div className="flex flex-col gap-1 p-1">
                {filteredPlayers.map((player: DataItem) => {
                  const playerSnowflake = player.snowflake || 'default';
                  const avatar = avatarCache[playerSnowflake] || createAvatar(shapes, { size: 32, seed: playerSnowflake }).toDataUri();
                  return (
                    <button
                      key={player.snowflake}
                      onClick={() => {
                        onSelect(player.snowflake || null);
                        setSearchValue('');
                      }}
                      className="text-left px-3 py-2 rounded transition-colors flex flex-row items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      <img src={avatar} alt={`${player.name} avatar`} className="rounded w-7 h-7 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{player.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="flex touch-none select-none bg-slate-700/75 p-0.5 w-2.5" orientation="vertical">
              <ScrollArea.Thumb className="flex-1 bg-slate-500 rounded-[10px]" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      )}
      {searchValue && filteredPlayers.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-slate-800 rounded shadow-lg border border-slate-600 p-3 text-center text-slate-400 text-sm">
          No players found
        </div>
      )}
    </div>
  );
}

export default PlayerSearchInput;
