import { useExperienceStore } from '../stores/experienceStore';
import DisplayTable from './displayTable';

function ViewDisplay() {
  const { experience } = useExperienceStore();
  const game = experience.selected?.game?.snowflake || undefined;

  return (
    <div className="w-full h-full bg-black">
      <DisplayTable game={game} fetchIntervalSeconds={5} isFullScreen={true} />
    </div>
  );
}

export default ViewDisplay; 