import { SelectedItem } from '../lib/types';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import { useMemo, useEffect, useState } from 'react';
import { Separator } from '@radix-ui/react-separator';
import { invoke } from '@tauri-apps/api/core';

type ComponentProps = {
  item: SelectedItem;
};

function PlayerListItem(props: ComponentProps): JSX.Element {
  const {
    item: { id, name, data, snowflake = 'default', handleClick },
  } = props;
  const itemData = data as { newLetter?: string; bio?: string; avatarImage?: string } || {};
  const { newLetter, bio, avatarImage } = itemData;
  
  const [uploadedAvatarSrc, setUploadedAvatarSrc] = useState<string>('');

  const handleItemClick = (id: number | string | null) => {
    if (handleClick) {
      handleClick(id);
    }
  };

  // Load uploaded avatar image if it exists
  useEffect(() => {
    const loadUploadedAvatar = async () => {
      if (avatarImage) {
        try {
          // If it's already a data URL, use it directly
          if (avatarImage.startsWith('data:')) {
            setUploadedAvatarSrc(avatarImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: avatarImage }) as string;
          setUploadedAvatarSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load player avatar:', avatarImage, error);
          setUploadedAvatarSrc('');
        }
      } else {
        setUploadedAvatarSrc('');
      }
    };
    
    loadUploadedAvatar();
  }, [avatarImage]);

  const avatar = useMemo(() => {
    // If we have an uploaded avatar, use that instead of the generated one
    if (uploadedAvatarSrc) {
      return uploadedAvatarSrc;
    }
    
    // Fall back to generated avatar
    const options: any = {
      size: '80',
      seed: snowflake,
    };

    return createAvatar(shapes, { ...options }).toDataUri();
  }, [snowflake, uploadedAvatarSrc]);

  return (
    <>
      {newLetter && (
        <>
          <div className="p-3 pb-0 text-xl font-bold">{newLetter as string}</div>
          <Separator className="h-[1px] w-full mb-0 h-4 bg-slate-300/50" orientation="horizontal" />
        </>
      )}
      <div
        className="flex flex-col items-start justify-start bg-slate-700 hover:cursor-pointer hover:bg-blue-600/20 rounded-lg shadow-lg m-2"
        key={`${id}_${name}`}
        onClick={() => handleItemClick(id || null)}
      >
        <div className="flex flex-row items-center w-full justify-start">
          <div className="p-2 m-2">
            <img src={avatar} alt="avatar" className="rounded-xl min-w-20 min-h-20 max-w-20 max-h-20 object-cover block" />
          </div>
          <div className="w-full items-start justify-start">
            <div className="flex flex-row items-center gap-2">
              {name && <h3 className="text-3xl font-bold">{name}</h3>}
            </div>
            {bio && <p>{bio as string}</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayerListItem;
