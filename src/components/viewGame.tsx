import { ListItem } from "../lib/types";

type ViewGameProps = {
    selected: Record<string, ListItem>;
}

function ViewGame(props:ViewGameProps) {
    const { selected } = props;
    const name = selected?.name || "No game selected";

    return (
      <>
          <h2>Game: {name as unknown as string}</h2>
      </>
    );
}

export default ViewGame;