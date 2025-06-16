import * as ScrollArea from '@radix-ui/react-scroll-area';
import FormGameStyles from './formGameStyles';
import { DataItem } from '../lib/types';
import { useGameStore } from '../stores/gamesStore';
import { useEffect } from 'react';

type StyleProps = {
  gameData: DataItem | null;
};

function SubViewStyles(props: StyleProps): JSX.Element {
  const { gameData } = props;
  const { name } = gameData || {};
  const { fetchGames } = useGameStore();

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-thin pb-2 flex flex-row items-center gap-2">
        {name} Layout & Styles
      </h2>
      <FormGameStyles />
    </div>
  );
}

export default SubViewStyles;
