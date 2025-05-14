import UiButton from "./uiButton";

interface HeaderProps {
    children?: React.ReactNode;
    title?: string;
    handleClick?: Function;
  }

function Header(props: HeaderProps): JSX.Element {
    const { children, title = '', handleClick } = props;

    return (
    <div className="min-h-[80px] min-w-full items-center flex flex-row bg-slate-900 gap-4 px-4">
        <div className=" flex-grow text-2xl font-bold">{title || "BLUMBOTRON • High Scores Made Easy!" }</div>
        {children}
        <div className="flex-initial">
            {handleClick && (
                <UiButton uiIcon="back" clickHandler={() => {}} />
            )}
        </div>
      </div>
    );
  }
  
  export default Header;