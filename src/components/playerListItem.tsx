import { SelectedItem } from "../lib/types";
import { createAvatar, schema } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import { useMemo } from "react";
import { Separator } from "@radix-ui/react-separator";

type ComponentProps = {
    item: SelectedItem;
}

function PlayerListItem(props: ComponentProps): JSX.Element {
    const { 
        item: { id, name, data, snowflake = 'default', handleClick },
    } = props;
    const itemData:Record<string,string> = data ? JSON.parse(data) : {};
    const newLetter = itemData ? itemData.newLetter : undefined;
    const bio = itemData ? itemData.bio : undefined;

    const handleItemClick = (id: number | string | null) => {
        if (handleClick) {
            handleClick(id);
        }
    }

    const avatar = useMemo(() => {
        const options: any = {
            size: '80',
            seed: snowflake,
        };
    
        return createAvatar(shapes, {...options}).toDataUri();
      }, [snowflake]);

    return (
        <>
            {newLetter && (<>
                <div className="p-3 pb-0 text-xl font-bold">{newLetter}</div>
                <Separator className="h-[1px] w-full mb-0 h-4 bg-slate-300/50" orientation="horizontal" />
            </>)}
            <div className="flex flex-col items-start justify-start bg-slate-700 hover:cursor-pointer hover:bg-blue-600/20 rounded-lg shadow-lg m-2" key={`${id}_${name}`} onClick={() => handleItemClick(id || null)}>
                <div className="flex flex-row items-center w-full justify-start">
                    <div className={"p-2 m-2"}>
                        <img src={avatar} alt="avatar" className="rounded-xl" />
                    </div>
                    <div className="w-full items-start justify-start">
                        <div className="flex flex-row items-center gap-2">  
                            {name && (<h3 className="text-3xl font-bold">{name}</h3>)}
                        </div>
                        {bio && (<p>{bio}</p>)}
                    </div>
                </div>
            </div>
        </>
    );
  }
  
  export default PlayerListItem;