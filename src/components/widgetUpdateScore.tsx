import { useState, useEffect } from "react";
import Input from "./input";
import SelectChip from "./selectChip";
import { toTitleCase } from "../lib/formatting";
import { DataItem,
        GameDataItem,
        RosterDataItem,
        ScoreDataItem
} from "../lib/types";
import { usePlayerStore } from "../stores/playersStore";
import { useRosterStore } from "../stores/rostersStore";
import { useScoreStore } from "../stores/scoresStore";
import { z } from 'zod';


type ComponentProps = {
    children?: React.ReactNode;
    gameData: GameDataItem | null;
}

type FormData = {
    units: string;
    leaderboard_update: number;
    player: string | undefined;
    game: string | undefined;
}

function UpdateScore(props: ComponentProps): JSX.Element {
    const { gameData } = props;
    const { data } = gameData ? gameData : {};
    const { snowflake, roster } = gameData ? gameData : {};
    const units:string = data ? JSON.parse(data).units[0] : 'Score';
    const { players, fetchPlayers } = usePlayerStore();
    const { rosters } = useRosterStore();
    const { createScore, error } = useScoreStore();
    const [ formErrors, setFormErrors ] = useState({});
    const [form, setForm] = useState({
        units,
        leaderboard_update: 0,
        player: '',
        game: snowflake,
    });

    const allowList = roster ? rosters.find((rosterItem: RosterDataItem) => 
        rosterItem.snowflake === roster)?.allow : null;
    const usedPlayers = allowList ? players?.filter((player: DataItem) => allowList?.includes(player?.snowflake || '')) : players;


    const resetForm = () => {
        setForm({
            units,
            leaderboard_update: 0,
            player: '',
            game: snowflake,
        });
    }
    const createNewScore = async (formData:FormData) => {        
        const formSchema = z.object({
            units: z.string().min(1),
            leaderboard_update: z.number().min(1),
            player: z.string().min(18),
            game: z.string().min(18),
        });

        try {
          formSchema.parse(formData);
          const createdScore = await createScore(formData as unknown as ScoreDataItem);
            // If we get here and there's no error in the store, creation was successful
            if (!error && createdScore) {
              resetForm();
              return true;
            }
            throw new Error(error || 'Failed to create score');
        } catch (err) {
          console.error('Error in createNewScore:', err);
          if (err instanceof z.ZodError) {
            let newErrs:Record<string, string> = {};
            err.errors.map(errItem => {
              const { path, message } = errItem;
              const key = path[0];
              newErrs[`${key}`] = message;
            })
            setFormErrors(newErrs);
          } else {
            // Handle other errors (like creation/editing failure)
            setFormErrors({ name: err instanceof Error ? err.message : 'Failed to process player' });
          }
          return false;
        }
      }

    const handleFormChange = (Event:React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget = Event?.target;
        const clonedForm = JSON.parse(JSON.stringify(form));
        const formKey = eventTarget?.name;
        const formValue = eventTarget?.value;
        clonedForm[`${formKey}`] = formValue;
        setForm(clonedForm);
    }

    useEffect(() => {
        fetchPlayers();
    }, []);

    return (
        <div className=" bg-slate-700 rounded-lg p-2 shadow-sm">
            <div className="flex flex-col items-start justify-start p-2">
                <Input
                    name="leaderboard_update"
                    label={`Update Player ${toTitleCase(units)}`}
                    value={form.leaderboard_update}
                    align="right"
                    changeHandler={handleFormChange}
                />
                <SelectChip 
                    selections={players ? usedPlayers.map((item: DataItem) => ({ label: item.name, value: item.snowflake, data: {snowflake: item.snowflake} })) : []} 
                    defaultValue={form.player} 
                    handleSelect={() => createNewScore(form)}
                />
                {formErrors && <p className="text-red-500">{JSON.stringify(formErrors)}</p>}
            </div>
        </div>
    );
  }
  
  export default UpdateScore;