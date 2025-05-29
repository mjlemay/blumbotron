import { useState } from "react";
import DialogContainer from "./dialogContainer";
import Input from "./input";
import { z } from 'zod';
import { useGameStore } from "../stores/gamesStore";
import { useExperienceStore } from "../stores/experienceStore";
import { GameDataItem } from "../lib/types";
import { getSelectedGame } from "../lib/selectedStates";
import { TrashIcon, PlusCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import * as Menubar from "@radix-ui/react-menubar";

type FormGameProps = {
    action?: string;
    onSuccess?: () => void;
}

function FormGame(props: FormGameProps) {
    const { action = "new", onSuccess } = props;
    const { createGame, editGame, deleteGame, loading, error } = useGameStore();
    const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
    const game = getSelectedGame();
    const [form, setForm] = useState({
        gameId: 0,
        name: '',
        description: ''
    });
    const [ errors, setErrors ] = useState({});

    const handleFormChange = (Event:React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget = Event?.target;
        const clonedForm = JSON.parse(JSON.stringify(form));
        const formKey = eventTarget?.name;
        const formValue = eventTarget?.value;
        clonedForm[`${formKey}`] = formValue;
        setForm(clonedForm);
    }

    const handleSubmitClose = (view:string = "home", modal:string = "none", gameData?:GameDataItem) => {
      const displayGameData:GameDataItem = gameData ? {...gameData, id: gameData.gameId} : { name: '' };
      console.log('displayGameData', displayGameData);
      setExpView(view);
      setExpModal(modal);
      setExpSelected(gameData ? { game: displayGameData } : {});
      onSuccess?.();
    }

    const formTitle = {
      "new": "Create Game",
      "edit": "Edit Game",
      "delete": "Delete Game"
    }

    const getError = (field: string) => {
        return errors[field as keyof typeof errors] || '';
    }

    const deleteSelectedGame = async (formData:GameDataItem) => {
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
          let newErrs:Record<string, string> = {};
          err.errors.map(errItem => {
            const { path, message } = errItem;
            const key = path[0];
            newErrs[`${key}`] = message;
          })
          setErrors(newErrs);
        } else {
          // Handle other errors (like deletion failure)
          setErrors({ name: err instanceof Error ? err.message : 'Failed to delete game' });
        }
        return false;
      }
    }

  
    const createNewGame = async (formData:GameDataItem, edit:boolean = false) => {
      let formSchema = z.object({
        name: z.string().min(3, 'Please supply a game name.'),
        description: z.string(),
      });
      if (edit) {
        formSchema = z.object({
          name: z.string().min(3, 'Please supply a game name.'),
          description: z.string(),
        });
      }
      try {
        formSchema.parse(formData);
        if (edit) {
          if (game) {
            await editGame(formData);
            // If we get here and there's no error in the store, edit was successful
            if (!error) {
              handleSubmitClose("game", "none", formData);
              return true;
            }
            throw new Error(error || 'Failed to edit game');
          }
        } else {
          const createdGame = await createGame(formData);
          // If we get here and there's no error in the store, creation was successful
          if (!error) {
            console.log('SET TO THIS GAME', createdGame);
            handleSubmitClose("game", "none", createdGame);
            return true;
          }
          throw new Error(error || 'Failed to create game');
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          let newErrs:Record<string, string> = {};
          err.errors.map(errItem => {
            const { path, message } = errItem;
            const key = path[0];
            newErrs[`${key}`] = message;
          })
          setErrors(newErrs);
        } else {
          // Handle other errors (like creation/editing failure)
          setErrors({ name: err instanceof Error ? err.message : 'Failed to process game' });
        }
        return false;
      }
    }

    const formContent = (action:string) => {
      let content = <></>;
      switch (action) {
        case "delete":
          content = (
            <div className="w-full pr-4 pl-4">
              <Input 
              label='Type the name of the game to confirm deletion'
              name='name' value={form.name || ''}
              changeHandler={handleFormChange}
              errMsg={getError('name')} 
          />
        </div>
        );
      break;
      case "new":
      case "edit":
      default:
        content = (
        <div className="w-full pr-4 pl-4">
            <Input 
                name='gameId'
                value={form.gameId || -1} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                label='Game Name'
                name='name' value={form.name || ''}
                changeHandler={handleFormChange}
                errMsg={getError('name')}
            />
            <Input
                label='Description'
                name='description' value={form.description || ''}
                changeHandler={handleFormChange}
                errMsg={getError('description')}
            />
        </div>
        );
        break;
    }
    return content;
  }

  const submitBar = (action:string) => {
    let bar = <></>;
    switch (action) {
      case "delete":
        bar = (
          <Menubar.Trigger 
          className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
          onClick={() => {deleteSelectedGame(form)}}
          >
              <TrashIcon 
                width="20"
                height="20"
              /> <span>Confirm</span>
          </Menubar.Trigger>
      );
    break;
    case "edit":
      bar = (
        <Menubar.Trigger 
        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
        onClick={() => {createNewGame(form, true)}}
        >
            <Pencil1Icon 
              width="20"
              height="20"
            /> <span>Edit</span>
        </Menubar.Trigger>
      );
    break;
    case "new":
    default:
      bar = 
        <Menubar.Trigger 
        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
        onClick={() => {createNewGame(form)}}
        >
            <PlusCircledIcon 
              width="20"
              height="20"
            /> <span>Lets' Go!</span>
        </Menubar.Trigger>
      ;
      break;
  }
  return (
    <Menubar.Root className="flex rounded-md p-2">
      <Menubar.Menu>
       {bar}
      </Menubar.Menu>
    </Menubar.Root>
  );
}

    return (
      <DialogContainer 
        title={formTitle[action as keyof typeof formTitle]}
        key={`${action}_${game?.id || 0}`}
        content={formContent(action)}
        >
            {loading && (<div>Loading...</div>)}
            {error && (<div>Error: {error}</div>)}
            {!loading && ! error && submitBar(action)}
      </DialogContainer>
    );
  }
  
  export default FormGame;