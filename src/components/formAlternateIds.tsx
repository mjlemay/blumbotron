import { useState, useEffect } from 'react';
import DialogContainer from './dialogContainer';
import Input from './input';
import { usePlayerStore } from '../stores/playersStore';
import { useExperienceStore } from '../stores/experienceStore';
import { PlayerDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { CircleBackslashIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultPlayer } from '../lib/defaults';
import IconRfid from './iconRfid';
import IconQr from './iconQr';
import { useRFIDNumber, useScannerContext } from '../lib/useRFIDNumber';

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
  const [newIdValue, setNewIdValue] = useState({value: '', key: ''});
  const [injected, setInjected] = useState<string>('');
  const { rfidCode, resetCode } = useRFIDNumber(injected !== '', injected);
  const { openQrScanner, isQrScannerOpen } = useScannerContext();

  const handleRfidClick = (field: string) => {
    // Don't allow RFID activation if QR scanner is open
    if (isQrScannerOpen) return;

    if (injected === field) {
      setInjected('');
      // Clear field on cancel
      if (field === 'alternateId_value_new') {
        setNewIdValue(prev => ({ ...prev, value: '' }));
      }
      return;
    } else {
      setInjected(field);
    }
  }

  const handleQrClick = (field: string) => {
    // Don't allow QR if RFID is active
    if (injected !== '') return;

    // Set injectable first so the scanner knows where to inject
    setInjected(field);
    openQrScanner(true); // Skip check since we just set injectable
  }

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const clonedForm = JSON.parse(JSON.stringify(form));
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    
    // Handle alternateIds object update
    if (formKey?.includes('alternateId_')) {
      const parts = formKey.split('_');
      const field = parts[1]; // 'key' or 'value'
      const oldKey = parts[2]; // the original key for this field
      
      if (!clonedForm.data) {
        clonedForm.data = {};
      }
      if (!clonedForm.data.alternateIds) {
        clonedForm.data.alternateIds = {};
      }
      
      if (formKey.includes('_new')) {
        // Just update the temporary state, don't add to form yet
        if (field === 'key') {
          setNewIdValue(prev => ({ ...prev, key: formValue }));
        } else if (field === 'value') {
          setNewIdValue(prev => ({ ...prev, value: formValue }));
        }
        return;
      } else {
        // Update existing record in object
        if (field === 'key') {
          // Rename the key - delete old, add new with same value
          const oldValue = clonedForm.data.alternateIds[oldKey];
          delete clonedForm.data.alternateIds[oldKey];
          clonedForm.data.alternateIds[formValue] = oldValue;
        } else if (field === 'value') {
          // Update the value for existing key
          clonedForm.data.alternateIds[oldKey] = formValue;
        }
      }
    } else {
      clonedForm[`${formKey}`] = formValue;
    }
    setForm(clonedForm);
  };

  const handleNewIdBlur = () => {
    if (newIdValue.key.trim() && newIdValue.value.trim()) {
      const clonedForm = JSON.parse(JSON.stringify(form));
      if (!clonedForm.data) {
        clonedForm.data = {};
      }
      if (!clonedForm.data.alternateIds) {
        clonedForm.data.alternateIds = {};
      }
      clonedForm.data.alternateIds[newIdValue.key] = newIdValue.value;
      setForm(clonedForm);
      setNewIdValue({ key: '', value: '' });
    }
  };

  const handleDeleteId = (key: string) => {
    const clonedForm = JSON.parse(JSON.stringify(form));
    if (clonedForm.data?.alternateIds) {
      delete clonedForm.data.alternateIds[key];
      setForm(clonedForm);
    }
  };

 const setAlternateIds = async () => {
  // Add the new ID if it exists
  let alternateIds = (form.data?.alternateIds as Record<string, string>) || {};
  if (newIdValue.key.trim() && newIdValue.value.trim()) {
    alternateIds = {...alternateIds, [newIdValue.key]: newIdValue.value};
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

  useEffect(() => {
    if (rfidCode !== '' && injected !== '') {
      if(injected === 'alternateId_value_new') {
        setNewIdValue(prev => ({ ...prev, value: rfidCode }));
      } else {
        const clonedForm = JSON.parse(JSON.stringify(form));
        clonedForm[`${injected}`] = rfidCode;
        setForm(clonedForm);
      }
      setInjected('');
      resetCode();
    }
  },[injected, rfidCode, resetCode]);

  return (
    <DialogContainer
      title="Configure Alternate Ids"
      key={`edit_${player?.id || 0}`}
      content={
            <div className="w-full min-w-150 pr-4 pl-4">
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
            {form?.data?.alternateIds && typeof form.data.alternateIds === 'object' && Object.keys(form.data.alternateIds).length > 0 ? 
            Object.entries(form.data.alternateIds as Record<string, string>).map(([key, value]) => (
              <div key={`alternateId_${key}`} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    name={`alternateId_key_${key}`}
                    label="Key"
                    value={key}
                    changeHandler={handleFormChange}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    name={`alternateId_value_${key}`}
                    label="Value"
                    value={value}
                    changeHandler={handleFormChange}
                  />
                </div>
                <button
                  onClick={() => handleDeleteId(key)}
                  className="px-3 py-2 mb-2 bg-sky-700 hover:bg-sky-600 rounded text-white h-[42px] cursor-pointer"
                >
                  <TrashIcon width="20" height="20" />
                </button>
              </div>
            )) : null}
              <div className="flex gap-2 items-end">
                <Input
                  name="alternateId_key_new"
                  label="Key"
                  value={newIdValue.key}
                  changeHandler={handleFormChange}
                  blurHandler={handleNewIdBlur}
                />
                <Input
                  name="alternateId_value_new"
                  label="Value"
                  injectable={injected === 'alternateId_value_new'}
                  value={newIdValue.value}
                  changeHandler={handleFormChange}
                  blurHandler={handleNewIdBlur}
                />
                <button
                  onClick={() => handleRfidClick("alternateId_value_new")}
                  disabled={isQrScannerOpen}
                  className={`flex items-center justify-center px-2 py-2 min-w-10 mb-2 rounded text-white h-[42px] cursor-pointer ${
                    isQrScannerOpen ? 'bg-slate-600 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-600'
                  }`}
                >
                  {injected !== '' ? <CircleBackslashIcon /> : <IconRfid />}
                </button>
                <button
                  onClick={() => handleQrClick("alternateId_value_new")}
                  disabled={injected !== ''}
                  className={`px-3 py-2 mb-2 rounded text-white h-[42px] cursor-pointer ${
                    injected !== '' ? 'bg-slate-600 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-600'
                  }`}
                >
                  <IconQr />
                </button>
              </div>
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
