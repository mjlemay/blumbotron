import { useState, useEffect } from 'react';
import DialogContainer from './dialogContainer';
import SelectChip from './selectChip';
import Input from './input';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { GameDataItem, RosterDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { TrashIcon, PlusCircledIcon, Pencil1Icon } from '@radix-ui/react-icons';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';
import { useRosterStore } from '../stores/rostersStore';

type FormGameProps = {
  action?: string;
  onSuccess?: () => void;
};

function FormGame(props: FormGameProps) {
  const { action = 'new', onSuccess } = props;
  const { createGame, editGame, deleteGame, fetchGame, loading, error } = useGameStore();
  const { rosters, fetchRosters } = useRosterStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const [form, setForm] = useState(game || defaultGame);
  const [errors, setErrors] = useState({});

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const clonedForm = JSON.parse(JSON.stringify(form));
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    clonedForm[`${formKey}`] = formValue;
    setForm(clonedForm);
  };

  const handleSubmitClose = (
    view: string = 'home',
    modal: string = 'none',
    gameData?: GameDataItem
  ) => {
    const displayGameData: GameDataItem = gameData ? gameData : { name: '' };
    setExpView(view);
    setExpModal(modal);
    setExpSelected(gameData ? { game: displayGameData } : {});
    onSuccess?.();
  };

  const formTitle = {
    new: 'Create Game',
    edit: 'Edit Game',
    delete: 'Delete Game',
  };

  const getError = (field: string) => {
    return errors[field as keyof typeof errors] || '';
  };

  const deleteSelectedGame = async (formData: GameDataItem) => {
    const gameName = game?.name || 'DELETE ME ANYWAY';
    const formSchema = z.object({
      name: z.literal(gameName),
    });
    try {
      formSchema.parse(formData);
      if (game) {
        await deleteGame(game);
        // If we get here and there's no error in the store, deletion was successful
        if (!error) {
          handleSubmitClose();
          return true;
        }
        throw new Error(error || 'Failed to delete game');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        let newErrs: Record<string, string> = {};
        err.errors.map((errItem) => {
          const { path, message } = errItem;
          const key = path[0];
          newErrs[`${key}`] = message;
        });
        setErrors(newErrs);
      } else {
        // Handle other errors (like deletion failure)
        setErrors({ name: err instanceof Error ? err.message : 'Failed to delete game' });
      }
      return false;
    }
  };

  const createNewGame = async (formData: GameDataItem, edit: boolean = false) => {
    let formSchema = z.object({
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      roster: z.string().nullable().optional(),
      data: z.object({
        theme: z.string().optional(),
        colors: z.object({
          background: z.string().optional(),
          text: z.string().optional(),
          primary: z.string().optional(),
          secondary: z.string().optional(),
          tertiary: z.string().optional(),
          tableHeader: z.string().optional(),
          tableRow: z.string().optional(),
          tableAlt: z.string().optional(),
        }).optional(),
        fonts: z.object({
          header: z.string().optional(),
          player: z.string().optional(),
          score: z.string().optional(),
        }).optional(),
        media: z.object({
          backgroundImage: z.string().nullable().optional(),
          backgroundImageOpacity: z.number().nullable().optional(),
          logoImage: z.string().nullable().optional(),
          logoImageOpacity: z.number().nullable().optional(),
          logoImagePosition: z.string().nullable().optional(),
          logoImageScale: z.number().nullable().optional(),
          logoImageHorizontalOffset: z.number().nullable().optional(),
          logoImageVerticalOffset: z.number().nullable().optional(),
        }).optional(),
        placement: z.object({
          paddingFrame: z.object({
            top: z.string().optional(),
            bottom: z.string().optional(),
            left: z.string().optional(),
            right: z.string().optional(),
          }).optional(),
        }).optional(),
        mechanics: z.object({
          units: z.array(z.object({
            name: z.string(),
            type: z.string(),
          })).optional(),
        }).optional(),
        displays: z.array(z.object({
          title: z.string().optional(),
          rows: z.number().optional(),
          offset: z.number().optional(),
          direction: z.enum(['higher', 'lower']).optional(),
          sortUnit: z.string().optional(),
          backgroundImage: z.string().optional(),
          backgroundVideo: z.string().nullable().optional(),
          titleImage: z.string().nullable().optional(),
          category: z.enum(['table', 'slide']),
          filteredUnits: z.array(z.string()),
        })).optional(),
      }).optional(),
    });
    try {
      formSchema.parse(formData);
      if (edit) {
        if (game) {
          await editGame(formData);
          // If we get here and there's no error in the store, edit was successful
          if (!error) {
            handleSubmitClose('game', 'none', formData);
            return true;
          }
          throw new Error(error || 'Failed to edit game');
        }
      } else {
        const createdGame = await createGame(formData);
        // If we get here and there's no error in the store, creation was successful
        if (!error) {
          console.log('SET TO THIS GAME', createdGame);
          handleSubmitClose('game', 'none', createdGame);
          return true;
        }
        throw new Error(error || 'Failed to create game');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        let newErrs: Record<string, string> = {};
        err.errors.map((errItem) => {
          const { path, message } = errItem;
          const key = path[0];
          newErrs[`${key}`] = message;
        });
        setErrors(newErrs);
      } else {
        // Handle other errors (like creation/editing failure)
        setErrors({ name: err instanceof Error ? err.message : 'Failed to process game' });
      }
      return false;
    }
  };

  const handleRosterSelect = (value: string) => {
    if (value == 'everyone') {
      setForm({ ...form, roster: null });
    } else {
      setForm({ ...form, roster: value });
    }
  };

  // Reset form when action changes to delete
  useEffect(() => {
    game?.id && fetchGame(game?.id as unknown as number);
    if (action === 'delete') {
      setForm({ name: '' });
    }
  }, [action]);

  useEffect(() => {
    fetchRosters();
  }, []);

  const rosterSelections = rosters.map((roster: RosterDataItem) => ({
    label: roster.name,
    value: roster.snowflake,
    data: { snowflake: roster.snowflake },
  }));
  rosterSelections.unshift({
    label: 'All Players',
    value: 'everyone',
    data: { snowflake: 'everyone' },
  });

  const formContent = (action: string) => {
    let content = <></>;
    switch (action) {
      case 'delete':
        content = (
          <div className="w-full pr-4 pl-4">
            <Input name="id" value={form.id || -1} hidden changeHandler={() => {}} />
            <Input
              name="snowflake"
              value={form.snowflake || 'BAD_ID'}
              hidden
              changeHandler={() => {}}
            />
            <Input
              label="Type the name of the game to confirm deletion"
              name="name"
              value={form.name || ''}
              changeHandler={handleFormChange}
              errMsg={getError('name')}
            />
          </div>
        );
        break;
      case 'new':
      case 'edit':
      default:
        content = (
          <div className="w-full pr-4 pl-4">
            <Input name="id" value={form.id || -1} hidden changeHandler={() => {}} />
            <Input
              name="snowflake"
              value={form.snowflake || 'BAD_ID'}
              hidden
              changeHandler={() => {}}
            />
            <Input
              label="Game Name"
              name="name"
              value={form.name || ''}
              changeHandler={handleFormChange}
              errMsg={getError('name')}
            />
            <Input
              label="Description"
              name="description"
              value={form.description || ''}
              changeHandler={handleFormChange}
              errMsg={getError('description')}
            />
            <p className="text-lg font-bold pb-1">Roster</p>
            <SelectChip
              selectPlaceholder="Select a roster"
              selections={rosterSelections}
              defaultValue={form.roster || 'everyone'}
              handleSelect={(value) => handleRosterSelect(value)}
            />
          </div>
        );
        break;
    }
    return content;
  };

  const submitBar = (action: string) => {
    let bar = <></>;
    switch (action) {
      case 'delete':
        bar = (
          <Menubar.Trigger
            className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
            onClick={() => {
              deleteSelectedGame(form);
            }}
          >
            <TrashIcon width="20" height="20" /> <span>Confirm</span>
          </Menubar.Trigger>
        );
        break;
      case 'edit':
        bar = (
          <Menubar.Trigger
            className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
            onClick={() => {
              createNewGame(form, true);
            }}
          >
            <Pencil1Icon width="20" height="20" /> <span>Edit</span>
          </Menubar.Trigger>
        );
        break;
      case 'new':
      default:
        bar = (
          <Menubar.Trigger
            className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
            onClick={() => {
              createNewGame(form);
            }}
          >
            <PlusCircledIcon width="20" height="20" /> <span>Lets' Go!</span>
          </Menubar.Trigger>
        );
        break;
    }
    return (
      <Menubar.Root className="flex rounded-md p-2">
        <Menubar.Menu>{bar}</Menubar.Menu>
      </Menubar.Root>
    );
  };

  return (
    <DialogContainer
      title={formTitle[action as keyof typeof formTitle]}
      key={`${action}_${game?.id || 0}`}
      content={formContent(action)}
    >
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && submitBar(action)}
    </DialogContainer>
  );
}

export default FormGame;
