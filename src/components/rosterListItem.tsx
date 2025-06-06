import { RosterDataItem } from "../lib/types";
import { BookmarkIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-separator";
import { bgColors } from "../lib/consts";
import { getPlayerBySnowflake } from "../lib/selectedStates";
import { PersonIcon } from "@radix-ui/react-icons";
import { usePlayerStore } from "../stores/playersStore";
import { DataItem } from "../lib/types";

type ComponentProps = {
    item: RosterDataItem;
}

function DisplayListItem(props: ComponentProps): JSX.Element {
    const { 
        item: { id, name, description, allow, created_at, updated_at, handleClick },
    } = props;
    const { players } = usePlayerStore();

    const handleItemClick = (id: number | string | null) => {
        if (handleClick) {
            handleClick(id);
        }
    }

    const getRosterColor = (textSeed: string): string => {
        const total = Array.from(textSeed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colorIndex = (total % 10) + 1;
        const colors = ['red', 'blue', 'gray', 'yellow', 'purple', 'pink', 'green', 'orange', 'teal', 'indigo', 'slate'];
        const selectedColor = colors[colorIndex];
        return bgColors[selectedColor] || bgColors.slate;
    }

    const getLimitedPlayers = (players: string[], allPlayers: DataItem[]): string => {
        const playerLength = players.length;
        const PLAYER_LIMIT = 5;
        if (playerLength > PLAYER_LIMIT) {
            const firstPlayers = players.slice(0, PLAYER_LIMIT);
            const namedPlayers = firstPlayers.map((player: string) => getPlayerBySnowflake(player, allPlayers)?.name || player);
            return namedPlayers.join(', ') + ' and ' + (playerLength - PLAYER_LIMIT) + ' more...';
        }
        return players.map((player: string) => getPlayerBySnowflake(player, allPlayers)?.name || player).join(', ');
    }

    return (
        <div className="flex flex-col items-start justify-start bg-slate-700 hover:cursor-pointer hover:bg-blue-600/20 rounded-lg shadow-lg p-4 m-2" key={`${id}_${name}`} onClick={() => handleItemClick(id || null)}>
            <div className="flex flex-row items-center w-full justify-start">
                <div className={`rounded-full ${getRosterColor(name)} p-2 m-2`}>
                    <BookmarkIcon className="text-slate-100" width="40" height="40" />
                </div>
                <div className="w-full items-start justify-start">
                    <div className="flex flex-row items-center gap-2">  
                        {name && (<h3 className="text-2xl font-bold">{name}</h3>)}
                    </div>
                    {description && (<p>{description}</p>)}
                    <div className="overflow-hidden truncate text-slate-300 pb-2 pt-1 items-center text-xs flex flex-row gap-0.75">
                        <PersonIcon className="w-3 h-3" />
                        {getLimitedPlayers(allow || [], players || [])}
                    </div>
                </div>
            </div>
            <Separator className="h-[1px] w-full mb-1 h-4 bg-slate-600/50" orientation="horizontal" />
            <div className="w-full text-slate-400 flex flex row items-center gap-2 justify-end">
                {created_at && (<span><label className="text-slate-500">Created</label> {created_at}</span>)}
                {created_at && updated_at && (<Separator className="w-[1px] h-4 bg-slate-500" orientation="vertical" decorative />)}
                {updated_at && (<span><label className="text-slate-500">Updated</label> {updated_at}</span>)}
            </div>
        </div>
    );
  }
  
  export default DisplayListItem;