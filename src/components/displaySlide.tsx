import { useMemo } from 'react';
import { useGameStore } from '../stores/gamesStore';
import MarkdownIt from 'markdown-it';

type ComponentProps = {
  game?: string;
  displayIndex?: number;
};

const mdParser = new MarkdownIt();

function DisplaySlide(props: ComponentProps): JSX.Element {
  const { game, displayIndex = 0 } = props;
  const { games } = useGameStore();

  const gameData = useMemo(() => 
    games.find((gameItem) => gameItem.snowflake === game), 
    [games, game]
  );

  const markdownContent = gameData?.data?.displays?.[displayIndex]?.markdown || '';
  const htmlContent = mdParser.render(markdownContent);

  return (
    <div className="bg-black rounded-md w-full h-full">
      <div className="flex flex-col items-center justify-start w-full h-full p-4">
        <div 
          className="prose prose-invert max-w-none w-full"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}

export default DisplaySlide;
