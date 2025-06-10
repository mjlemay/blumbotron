import { EnterFullScreenIcon, OpenInNewWindowIcon, AllSidesIcon } from '@radix-ui/react-icons';

type ComponentProps = {
  children?: React.ReactNode;
  height?: number;
};

function DisplayFrame(props: ComponentProps): JSX.Element {
  const { children, height = 300 } = props;

  return (
    <div
      style={{
        height: `${height}px`,
        width: `${height * 1.5}px`,
      }}
      className="
                bg-black
                rounded-md
                overflow-hidden
            "
    >
      <div
        className={`
            flex
            flex-col-reverse
            items-end
            justify-start
            min-h-full
            opacity-50
            hover:opacity-100
            transition-opacity
            duration-200
        `}
      >
        <div className="flex flex-row items-center justify-end gap-2 p-2">
          <button className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200">
            <EnterFullScreenIcon width="20" height="20" />
          </button>
          <button className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200">
            <OpenInNewWindowIcon width="20" height="20" />
          </button>
          <button className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200">
            <AllSidesIcon width="20" height="20" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisplayFrame;
