import ListContainer from "./listContainer";
import { useEffect } from "react";
import { useGameStore } from "../stores/gamesStore";
import * as Menubar from "@radix-ui/react-menubar";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import DisplayListItem from "./displayListItem";
import { GameDataItem } from "../lib/types";
import { useExperienceStore } from "../stores/experienceStore";

function ViewHome(): JSX.Element  {
  const { games, loading, error, fetchGames } = useGameStore();
  const { setExpModal, setExpSelected, setExpView} = useExperienceStore();

  useEffect(() => {
    fetchGames();
  }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    const displayGames = (games: GameDataItem[]): GameDataItem[] => {
        return games.map((game) => ({
            ...game,
            id: game.gameId,
            handleClick: () => handleGameSelect(game.gameId as unknown as number)
        }));
    }

  const handleGameSelect = (gameId: number) => {
    const selectedGame: GameDataItem | undefined = displayGames(games).find((game) => gameId === game.gameId);
    if (selectedGame) {
      setExpSelected({
        game: selectedGame
      });
      setExpView("game");
    }
  }

  return (
    <div className="m-2">
        <ListContainer items={displayGames(games)} listItem={DisplayListItem} title="Tables & Displays">
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger 
                        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700"
                        onClick={() => setExpModal("newGame")}
                        >
                            <PlusCircledIcon 
                              width="20"
                              height="20"
                            /> <span>Create New Game</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
  );
}

export default ViewHome;