import { useState, useEffect } from "react";
import DialogContainer from "./dialogContainer";
import Input from "./input";
import { z } from 'zod';
import { useRosterStore } from "../stores/rostersStore";
import { useExperienceStore } from "../stores/experienceStore";
import { RosterDataItem } from "../lib/types";
import { getSelected } from "../lib/selectedStates";
import { TrashIcon, PlusCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import * as Menubar from "@radix-ui/react-menubar";
import { defaultRoster } from "../lib/defaults";

type FormRosterProps = {
    action?: string;
    onSuccess?: () => void;
}

function FormRoster(props: FormRosterProps) {
    const { action = "new", onSuccess } = props;
    const { createRoster, editRoster, deleteRoster, fetchRoster, loading, error } = useRosterStore();
    const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
    const roster = getSelected("rosters") as RosterDataItem;
    const [form, setForm] = useState(roster || defaultRoster);
    const [ errors, setErrors ] = useState({});

    const handleFormChange = (Event:React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget = Event?.target;
        const clonedForm = JSON.parse(JSON.stringify(form));
        const formKey = eventTarget?.name;
        const formValue = eventTarget?.value;
        clonedForm[`${formKey}`] = formValue;
        setForm(clonedForm);
    }

    const handleSubmitClose = (view:string = "rosters", modal:string = "none", rosterData?:RosterDataItem) => {
      const displayRosterData:RosterDataItem = rosterData ? rosterData : { name: '' };
      setExpView(view);
      setExpModal(modal);
      setExpSelected(rosterData ? { roster: displayRosterData } : {});
      onSuccess?.();
    }

    const formTitle = {
      "new": "Create Roster",
      "edit": "Edit Roster",
      "delete": "Delete Roster"
    }

    const getError = (field: string) => {
        return errors[field as keyof typeof errors] || '';
    }

    const deleteSelectedRoster = async (formData:RosterDataItem) => {
      const rosterName = roster?.name || 'DELETE ME ANYWAY';
      const formSchema = z.object({
        name: z.literal(rosterName),
      });
      try {
        formSchema.parse(formData);
        if (roster) {
          await deleteRoster(roster);
          // If we get here and there's no error in the store, deletion was successful
          if (!error) {
            handleSubmitClose();
            return true;
          }
          throw new Error(error || 'Failed to delete roster');
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
          setErrors({ name: err instanceof Error ? err.message : 'Failed to delete roster' });
        }
        return false;
      }
    }

  
    const createNewRoster = async (formData:RosterDataItem, edit:boolean = false) => {
      let formSchema = z.object({
        name: z.string().min(3, 'Please supply a roster name.'),
        description: z.string(),
      });
      if (edit) {
        formSchema = z.object({
          name: z.string().min(3, 'Please supply a roster name.'),
          description: z.string(),
          allow: z.string().array(),
          deny: z.string().array(),
        });
      }
      try {
        formSchema.parse(formData);
        if (edit) {
          if (roster) {
            await editRoster(formData);
            // If we get here and there's no error in the store, edit was successful
            if (!error) {
              handleSubmitClose("roster", "none", formData);
              return true;
            }
            throw new Error(error || 'Failed to edit roster');
          }
        } else {
          const createdRoster = await createRoster(formData);
          // If we get here and there's no error in the store, creation was successful
          if (!error) {
            console.log('SET TO THIS ROSTER', createdRoster);
            handleSubmitClose("roster", "none", createdRoster);
            return true;
          }
          throw new Error(error || 'Failed to create roster');
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
          setErrors({ name: err instanceof Error ? err.message : 'Failed to process roster' });
        }
        return false;
      }
    }

    // Reset form when action changes to delete
    useEffect(() => {
      roster?.id && fetchRoster(roster?.id as unknown as number);
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
                label='Type the name of the roster to confirm deletion'
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
                name='allow'
                value={form.allow || ''} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                name='deny'
                value={form.deny || ''} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                name='opt_in'
                value={form.opt_in || ''} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                name='opt_out'
                value={form.opt_out || ''} 
                hidden
                changeHandler={()=>{}}
            />
            <Input 
                label='Roster Name'
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
          onClick={() => {deleteSelectedRoster(form)}}
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
        onClick={() => {createNewRoster(form, true)}}
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
        onClick={() => {createNewRoster(form)}}
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
        key={`${action}_${roster?.id || 0}`}
        content={formContent(action)}
        >
            {loading && (<div>Loading...</div>)}
            {error && (<div>Error: {error}</div>)}
            {!loading && ! error && submitBar(action)}
      </DialogContainer>
    );
  }
  
  export default FormRoster;