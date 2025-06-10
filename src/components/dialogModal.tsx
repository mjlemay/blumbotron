import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Cross2Icon } from '@radix-ui/react-icons';
import FormGame from './formGame';
import FormRoster from './formRoster';
import FormPlayer from './formPlayer';
import DisplayTable from './displayTable';
import { refreshData } from '../lib/fetchCalls';
import { useExperienceStore } from '../stores/experienceStore';
import { useGameStore } from '../stores/gamesStore';
import { usePlayerStore } from '../stores/playersStore';
import { useRosterStore } from '../stores/rostersStore';
import { useShallow } from 'zustand/react/shallow';

type DialogModalProps = {
  children?: React.ReactNode;
  triggerText?: string;
  selectedModal?: string;
  isOpen?: boolean;
  game?: string;
};

function DialogModal({
  triggerText,
  selectedModal,
  isOpen = false,
  game,
}: DialogModalProps): JSX.Element {
  const { setExpModal, experience: { selected } } = useExperienceStore();
  const gameSelected = selected && selected.game;
  const { fetchGames } = useGameStore(useShallow((state) => ({ fetchGames: state.fetchGames })));
  const { fetchPlayers } = usePlayerStore(
    useShallow((state) => ({ fetchPlayers: state.fetchPlayers }))
  );
  const { fetchRosters } = useRosterStore(
    useShallow((state) => ({ fetchRosters: state.fetchRosters }))
  );
  const [open, setOpen] = useState(false);

  const dialogContent = (selectedModal: string) => {
    const content = {
      newGame: <FormGame />,
      editGame: (
        <FormGame
          action="edit"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      deleteGame: (
        <FormGame
          action="delete"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      newPlayer: (
        <FormPlayer onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)} />
      ),
      editPlayer: (
        <FormPlayer
          action="edit"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      deletePlayer: (
        <FormPlayer
          action="delete"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      newRoster: (
        <FormRoster onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)} />
      ),
      editRoster: (
        <FormRoster
          action="edit"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      deleteRoster: (
        <FormRoster
          action="delete"
          onSuccess={() => refreshData(fetchGames, fetchPlayers, fetchRosters)}
        />
      ),
      displayTable: <DisplayTable game={gameSelected?.snowflake} fetchIntervalSeconds={60} />,
    };
    return content[selectedModal as keyof typeof content] || null;
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setExpModal('none');
      refreshData(fetchGames, fetchPlayers, fetchRosters);
    }
  };

  useEffect(() => {
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {triggerText && (
        <Dialog.Trigger>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {triggerText}
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          title=""
          className="fixed rounded-lg 
                bg-slate-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                max-w-[90vw] max-h-[90vh] overflow-auto"
        >
          <div className="absolute top-2 right-2">
            <Dialog.Close asChild>
              <button
                className="
                  flex select-none items-center justify-center
                  cursor-pointer rounded-full p-1
                  text-slate-400 hover:text-white
                  hover:bg-slate-600/50
                  transition-colors duration-200
                "
                aria-label="Close"
              >
                <Cross2Icon width="20" height="20" />
              </button>
            </Dialog.Close>
          </div>
          <VisuallyHidden.Root>
            <Dialog.DialogTitle></Dialog.DialogTitle>
          </VisuallyHidden.Root>
          {dialogContent(selectedModal || '')}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DialogModal;
