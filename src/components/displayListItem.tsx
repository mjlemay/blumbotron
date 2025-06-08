import { SelectedItem } from "../lib/types";
import { ClockIcon, MixIcon, TableIcon, BookmarkIcon, StarIcon  } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-separator";
import Chip from "./chip";
import { bgColors } from "../lib/consts";
import { getPlayerBySnowflake } from "../lib/selectedStates";
import { useRosterStore } from "../stores/rostersStore";

type ComponentProps = {
    item: SelectedItem;
}

function DisplayListItem(props: ComponentProps): JSX.Element {
    const { 
        item: { id, name, data, description, created_at, updated_at, handleClick },
    } = props;
    const { rosters } = useRosterStore();
    const itemData:Record<string,string> = data ? JSON.parse(data) : {};
    const category = itemData ? itemData.category : undefined;
    const roster = 'roster' in props.item ? props.item.roster : undefined;

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

    const getIcon = (category: string | undefined) => {
        switch (category) {
            case "table":
                return <TableIcon className="text-slate-100" width="40" height="40" />;
            case "turn-order":
                return <ClockIcon className="text-slate-100" width="40" height="40" />;
            case "tourney-bracket":
                return <MixIcon className="text-slate-100" width="40" height="40" />;
            case "roster":
                return <BookmarkIcon className="text-slate-100" width="40" height="40" />;
            case "everyone":
                return <StarIcon className="text-slate-100" width="40" height="40" />;
            default:
                return <MixIcon className="text-slate-100" width="40" height="40" />;
        }
    }


    return (
        <div className="flex flex-col items-start justify-start bg-slate-700 hover:cursor-pointer hover:bg-blue-600/20 rounded-lg shadow-lg p-4 m-2" key={`${id}_${name}`} onClick={() => handleItemClick(id || null)}>
            <div className="flex flex-row items-center w-full justify-start">
                <div className={`rounded-xl ${category && category == 'roster' ? getRosterColor(name) : "bg-slate-800"} p-2 m-2`}>
                    {getIcon(category)}
                </div>
                <div className="w-full items-start justify-start">
                    <div className="flex flex-row items-center gap-2">  
                        {name && (<h3 className="text-2xl font-bold">{name}</h3>)}
                        {(!category || category !== 'roster') && (
                            <Chip 
                                text={roster ? getPlayerBySnowflake(roster as string, rosters)?.name || roster as string : "All Players"}
                                color={getRosterColor(roster ? roster as string || roster : "Everyone")}
                                icon={roster ? "roster" : "everyone"}
                                handleClick={() => {}}
                            />
                        )}
                    </div>
                    {description && (<p>{description}</p>)}
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