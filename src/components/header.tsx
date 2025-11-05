import UiButton from './uiButton';
import { useShallow } from 'zustand/react/shallow';
import { useExperienceStore } from '../stores/experienceStore';
import { usePlayerStore } from '../stores/playersStore';
import { Separator } from '@radix-ui/react-separator';
import * as Menubar from '@radix-ui/react-menubar';
import { SelectedItem, PlayerDataItem } from '../lib/types';
import { findAnySelected, returnToParent, findCollectionType } from '../lib/selectedStates';
import { HamburgerMenuIcon, Pencil1Icon, TrashIcon, ImageIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const selectedItemModals = {
  game: {
    edit: 'editGame',
    delete: 'deleteGame',
  },
  player: {
    edit: 'editPlayer',
    delete: 'deletePlayer',
  },
  roster: {
    edit: 'editRoster',
    delete: 'deleteRoster',
  },
};

function Header(): JSX.Element {
  const { setExpModal, selected, setExpView, setExpSelected } = useExperienceStore(
    useShallow((state) => ({
      setExpView: state.setExpView,
      setExpSelected: state.setExpSelected,
      setExpModal: state.setExpModal,
      selected: state.experience.selected,
    }))
  );

  const { editPlayer } = usePlayerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const selectedItem: SelectedItem | null = findAnySelected(selected) || null;
  const name = selectedItem?.name || 'BLUMBOTRON • High Scores Made Easy!';

  const selectedType = findCollectionType(selectedItem);
  const isPlayerSelected = selectedType === 'player';

  // Handle file upload for player photos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('Header: No file selected');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      console.error('Header: Invalid file type:', file.type);
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    const selectedPlayer = selectedItem as PlayerDataItem;
    if (!selectedPlayer) return;

    setUploading(true);
    
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `player_${selectedPlayer.snowflake || 'unknown'}_${timestamp}.${fileExtension}`;
    
      // Convert file to base64 for transfer to Rust
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
      
      // Use Tauri invoke to save file on the Rust side
      await invoke('save_background_image', {
        fileName: fileName,
        imageData: base64
      });

      console.log('Header: File saved successfully:', fileName);

      // Update player data with the new avatar location
      const updatedPlayer: PlayerDataItem = {
        ...selectedPlayer,
        data: {
          ...selectedPlayer.data,
          avatarImage: fileName
        }
      };

      await editPlayer(updatedPlayer);
      console.log('Header: Player updated successfully');
      
      // Update the selected player in the experience store with the new data
      setExpSelected({ player: updatedPlayer });
      
    } catch (error) {
      console.error('Header: Error uploading file:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleBack = () => {
    returnToParent(selectedItem, setExpView, setExpModal, setExpSelected);
  };

  return (
    <div className="min-h-[80px] min-w-full items-center flex flex-row bg-slate-900 gap-4 px-4">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="flex-initial min-w-[80px] flex flex-row gap-4 items-center"></div>
      <div className=" flex-grow text-3xl font-bold">{name}</div>
      {selectedItem && (
        <div className="flex-initial flex flex-row gap-4 items-center">
          <Menubar.Root className="flex rounded-md p-2">
            <Menubar.Menu>
              <Menubar.Trigger
                className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
                onClick={() => {}}
              >
                <HamburgerMenuIcon width="20" height="20" /> <span>Options</span>
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content className="bg-slate-700/50 rounded-md p-1 mt-1 min-w-[150px] rounded-md shadow-lg z-[9999]">
                  <Menubar.Item
                    className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                    onClick={() =>
                      setExpModal(
                        selectedItemModals[selectedType as keyof typeof selectedItemModals].edit
                      )
                    }
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <Pencil1Icon width="20" height="20" /> Edit
                    </div>
                  </Menubar.Item>
                  <Menubar.Item
                    className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                    onClick={() =>
                      setExpModal(
                        selectedItemModals[selectedType as keyof typeof selectedItemModals].delete
                      )
                    }
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <TrashIcon width="20" height="20" /> Delete
                    </div>
                  </Menubar.Item>
                  {isPlayerSelected && (
                    <Menubar.Item
                      className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                      onClick={triggerFileUpload}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <ImageIcon width="20" height="20" /> 
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </div>
                    </Menubar.Item>
                  )}
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Root>
          <Separator className="w-[1px] h-10 bg-slate-500" orientation="vertical" decorative />
          <UiButton uiIcon="back" clickHandler={() => handleBack()} />
        </div>
      )}
    </div>
  );
}

export default Header;
