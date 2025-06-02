import { useState, useEffect } from "react";
import DialogContainer from "./dialogContainer";
import Input from "./input";
import { z } from 'zod';
import { usePlayerStore } from "../stores/playersStore";
import { useExperienceStore } from "../stores/experienceStore";
import { DataItem } from "../lib/types";
import { getSelected } from "../lib/selectedStates";
import { TrashIcon, PlusCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import * as Menubar from "@radix-ui/react-menubar";
import { defaultPlayer } from "../lib/defaults";

type FormPlayerProps = {
    action?: string;
    onSuccess?: () => void;
}

function FormPlayer(props: FormPlayerProps) {
    const { action = "new", onSuccess } = props;
    const { createPlayer, editPlayer, deletePlayer, fetchPlayer, loading, error } = usePlayerStore();
    const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
    const player = getSelected("players") as DataItem;
    const [form, setForm] = useState(player || defaultPlayer);
    const [ errors, setErrors ] = useState({});

    const handleFormChange = (Event:React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget = Event?.target;
        const clonedForm = JSON.parse(JSON.stringify(form));
        const formKey = eventTarget?.name;
        const formValue = eventTarget?.value;
        clonedForm[`${formKey}`] = formValue;
        setForm(clonedForm);
    }

    const handleSubmitClose = (view:string ="players", modal:string = "none", playerData?:DataItem) => {      
      setExpView(view);
      setExpModal(modal);
      setExpSelected(playerData ? { player: playerData } : {});
      onSuccess?.();
    }

    const formTitle = {
      "new": "Create Player",
      "edit": "Edit Player",
      "delete": "Delete Player"
    }

    const getError = (field: string) => {
        return errors[field as keyof typeof errors] || '';
    }

    const deleteSelectedPlayer = async (formData:DataItem) => {
      //TODO: determine how to reset form player object
      const playerName = player?.name || 'DELETE ME ANYWAY';
      const formSchema = z.object({
        name: z.literal(playerName),
      });
      try {
        formSchema.parse(formData);
        if (player) {
          await deletePlayer(player);
          // If we get here and there's no error in the store, deletion was successful
          if (!error) {
            handleSubmitClose();
            return true;
          }
          throw new Error(error || 'Failed to delete player');
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
          setErrors({ name: err instanceof Error ? err.message : 'Failed to delete player' });
        }
        return false;
      }
    }

    const createNewPlayer = async (formData:DataItem, edit:boolean = false) => {
      let formSchema = z.object({
        name: z.string().min(3, 'Please supply a player name.'),
      });
      if (edit) {
        formSchema = z.object({
          name: z.string().min(3, 'Please supply a player name.'),
        });
      }
      try {
        formSchema.parse(formData);
        if (edit) {
          if (player) {
            await editPlayer(formData);
            // If we get here and there's no error in the store, edit was successful
            if (!error) {
              handleSubmitClose("player", "none", formData);
              return true;
            }
            throw new Error(error || 'Failed to edit player');
          }
        } else {
          const createdPlayer = await createPlayer(formData);
          // If we get here and there's no error in the store, creation was successful
          if (!error && createdPlayer) {
            console.log('SET TO THIS PLAYER', createdPlayer);
            handleSubmitClose("player", "none", createdPlayer);
            return true;
          }
          throw new Error(error || 'Failed to create player');
        }
      } catch (err) {
        console.error('Error in createNewPlayer:', err);
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
          setErrors({ name: err instanceof Error ? err.message : 'Failed to process player' });
        }
        return false;
      }
    }

    // Reset form when action changes to delete
    useEffect(() => {
      player?.id && fetchPlayer(player?.id as unknown as number);
      if (action === "delete") {
        setForm({name: ''});
      }
    }, [action]);

    const formContent = (action:string) => {
      let content = <></>;
      switch (action) {
        case "delete":
          content = (
            <div className="w-full pr-4 pl-4">
              <Input 
                name='id'
                value={form.id || -1} 
                hidden
                changeHandler={()=>{}}
              />
              <Input 
                  name='snowflake'
                  value={form.snowflake || 'BAD_ID'} 
                  hidden
                  changeHandler={()=>{}}
              />
              <Input 
              label='Type the name of the player to confirm deletion'
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
                name='id'
                value={form.id || -1} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                name='snowflake'
                value={form.snowflake || 'BAD_ID'} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                label='Player Name'
                name='name' value={form.name || ''}
                changeHandler={handleFormChange}
                errMsg={getError('name')}
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
          onClick={() => {deleteSelectedPlayer(form)}}
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
        onClick={() => {createNewPlayer(form, true)}}
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
        onClick={() => {createNewPlayer(form)}}
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
        key={`${action}_${player?.id || 0}`}
        content={formContent(action)}
        >
            {loading && (<div>Loading...</div>)}
            {error && (<div>Error: {error}</div>)}
            {!loading && ! error && submitBar(action)}
      </DialogContainer>
    );
  }
  
  export default FormPlayer;