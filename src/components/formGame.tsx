import { useState } from "react";
import DialogContainer from "./dialogContainer";
import Input from "./input";
import { z } from 'zod';
import { useGameStore } from "../stores/gamesStore";
import { BasicGame } from "../lib/types";

type FormGameProps = {
    gameId?: number;
    action?: string;
}

function FormGame(props: FormGameProps) {
    const { gameId = 0, action = "new" } = props;
    const { createGame, loading, error } = useGameStore();
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

    const formTitle = {
        "new": "Create Game",
        "edit": "Edit Game",
        "delete": "Delete Game"
    }

    const getError = (field: string) => {
        return errors[field as keyof typeof errors] || '';
    }

    const validateForm = (formData:BasicGame) => {
        const formSchema = z.object({
          name: z.string().min(1, 'Please supply a game name.'),
          description: z.string(),
        });
        try {
          formSchema.parse(formData);
        } catch (err) {
          if (err instanceof z.ZodError) {
            let newErrs:Record<string, string> = {};
            err.errors.map(errItem => {
              const { path, message } = errItem;
              const key = path[0];
              newErrs[`${key}`] = message;
            })
            setErrors(newErrs);
          }
        }
      }

    const createNewGame = () => {
        validateForm(form);
        if (Object.keys(errors).length <= 0) {
            createGame(form);
        }
    }

    const formContent = (
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

    return (
      <DialogContainer 
        title={formTitle[action as keyof typeof formTitle]}
        key={`${action}_${gameId}`}
        content={formContent}
        >
            {loading && (<div>Loading...</div>)}
            {error && (<div>Error: {error}</div>)}
            {!loading && ! error && action === "new" && (<button onClick={createNewGame}>Create</button>)}
      </DialogContainer>
    );
  }
  
  export default FormGame;