import { useState, useEffect } from 'react';
import DialogContainer from './dialogContainer';
import Input from './input';
import { usePlayerStore } from '../stores/playersStore';
import { useExperienceStore } from '../stores/experienceStore';
import { PlayerDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultPlayer } from '../lib/defaults';

type FormAlternateIdsProps = {
  onSuccess?: () => void;
};

function FormAlternateIds(props: FormAlternateIdsProps) {
  const { onSuccess } = props;
  const { editPlayer, loading } = usePlayerStore();
  const { setExpModal, setExpSelected } = useExperienceStore();
  const player = getSelected('players') as PlayerDataItem;
  const [form, setForm] = useState(player || defaultPlayer);
  const [error, setError] = useState<string | null>(null);
  const [newIdValue, setNewIdValue] = useState('');

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const clonedForm = JSON.parse(JSON.stringify(form));
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    
    // Handle alternateIds array update
    if (formKey?.includes('alternateId_')) {
      const index = parseInt(formKey.split('_')[1], 10);
      if (!clonedForm.data) {
        clonedForm.data = {};
      }
      if (!clonedForm.data.alternateIds) {
        clonedForm.data.alternateIds = [];
      }
      
      if (formKey === 'alternateId_new') {
        // Just update the temporary state, don't add to form yet
        setNewIdValue(formValue);
        return;
      } else {
        clonedForm.data.alternateIds[index] = formValue;
      }
    } else {
      clonedForm[`${formKey}`] = formValue;
    }
    setForm(clonedForm);
  };

  const handleNewIdBlur = () => {
    if (newIdValue.trim()) {
      const clonedForm = JSON.parse(JSON.stringify(form));
      if (!clonedForm.data) {
        clonedForm.data = {};
      }
      if (!clonedForm.data.alternateIds) {
        clonedForm.data.alternateIds = [];
      }
      clonedForm.data.alternateIds.push(newIdValue);
      setForm(clonedForm);
      setNewIdValue('');
    }
  };

  const handleDeleteId = (index: number) => {
    const clonedForm = JSON.parse(JSON.stringify(form));
    if (clonedForm.data?.alternateIds) {
      clonedForm.data.alternateIds.splice(index, 1);
      setForm(clonedForm);
    }
  };

 const setAlternateIds = async () => {
  // Add the new ID if it exists
  let alternateIds = (form.data?.alternateIds as string[]) || [];
  if (newIdValue.trim()) {
    alternateIds = [...alternateIds, newIdValue];
  }
  
    try {
      if (player) {
        const updatedPlayer = {
          ...player,
          data: {...player.data, alternateIds}
        };
        await editPlayer(updatedPlayer);
        setExpSelected({ player: updatedPlayer });
        closeModal();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Failed adding alternate IDs:', err);
      setError('Failed adding alternate IDs');
    }
  };

    const closeModal = () => {
    setExpModal('none');
  };

  return (
    <DialogContainer
      title="Configure Alternate Ids"
      key={`edit_${player?.id || 0}`}
      content={
            <div className="w-full pr-4 pl-4">
            <Input name="id" value={form.id || -1} hidden changeHandler={() => {}} />
            <Input
              name="snowflake"
              value={form.snowflake || 'BAD_ID'}
              hidden
              changeHandler={() => {}}
            />
            <Input
              name="name"
              hidden
              value={form.name || ''}
              changeHandler={() => {}}
            />
            {form?.data?.alternateIds && Array.isArray(form?.data?.alternateIds) && form?.data?.alternateIds.length > 0 ? 
            (form?.data?.alternateIds as string[]).map((idValue: string, index: number) => (
              <Input
                key={`alternateId_${index}`}
                name={`alternateId_${index}`}
                label="Alternate ID"
                value={idValue}
                changeHandler={handleFormChange}
                actionButton={
                  <button
                    onClick={() => handleDeleteId(index)}
                    className="px-3 py-2 bg-sky-700 hover:bg-sky-600 rounded text-white"
                  >
                    <TrashIcon width="20" height="20" />
                  </button>
                }
              />
            )) : null}
              <Input
                name="alternateId_new"
                label="Add New Alternate ID"
                value={newIdValue}
                changeHandler={handleFormChange}
                blurHandler={handleNewIdBlur}
              />
          </div>
      }
    >
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && (
      <Menubar.Root className="flex rounded-md p-2">
        <Menubar.Menu>          <Menubar.Trigger
            className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
            onClick={() => {
              setAlternateIds();
            }}
          >
            <Pencil1Icon width="20" height="20" /> <span>Edit</span>
          </Menubar.Trigger></Menubar.Menu>
      </Menubar.Root>
      )}
    </DialogContainer>
  );
}

export default FormAlternateIds;
