import ListContainer from "./listContainer";
import { useEffect } from "react";
import { usePlayerStore } from "../stores/playersStore";
import * as Menubar from "@radix-ui/react-menubar";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import DisplayListItem from "./displayListItem";
import { PlayerDataItem } from "../lib/types";
import { useExperienceStore } from "../stores/experienceStore";

function ViewPlayers(): JSX.Element  {
  const { players, loading, error, fetchPlayers } = usePlayerStore();
  const { setExpModal, setExpSelected, setExpView} = useExperienceStore();

  useEffect(() => {
    fetchPlayers();
  }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    const displayPlayers = (players: PlayerDataItem[]): PlayerDataItem[] => {
        return players.map((player) => ({
            ...player,
            id: player.playerId,
            handleClick: () => handlePlayerSelect(player.playerId as unknown as number)
        }));
    }

  const handlePlayerSelect = (playerId: number) => {
    const selectedPlayer: PlayerDataItem | undefined = displayPlayers(players).find((player) => playerId === player.playerId);
    if (selectedPlayer) {
      setExpSelected({
        player: selectedPlayer
      });
      setExpView("player");
    }
  }

  return (
    <div className="m-2">
        <ListContainer items={displayPlayers(players)}
            listItem={DisplayListItem}
            title="Players"
        >
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger 
                        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700"
                        onClick={() => setExpModal("newPlayer")}
                        >
                            <PlusCircledIcon 
                              width="20"
                              height="20"
                            /> <span>Create New Player</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
  );
}

export default ViewPlayers;