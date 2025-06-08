import { 
    CrossCircledIcon,
    QuestionMarkCircledIcon,
    PlusCircledIcon,
    MinusCircledIcon,
    HamburgerMenuIcon,
    TableIcon,
    PersonIcon,
    MixIcon,
    BookmarkIcon,
    RocketIcon,
    GearIcon,
    HobbyKnifeIcon,
} from "@radix-ui/react-icons";

interface UiButtonProps {
    clickHandler?: Function;
    uiIcon?: string;
  }

function UiButton(props: UiButtonProps): JSX.Element {
    const { clickHandler, uiIcon = "" } = props;

    const handleClick = () => {
      if (clickHandler) {
        clickHandler();
      }
    };

    const setIcon = (iconName:string) => {
        let icon = <QuestionMarkCircledIcon />;
        switch (iconName) {
            case "back":
            case "quit":
                icon = <CrossCircledIcon width="40" height="40" />
                break;
            case "add":
                icon = <PlusCircledIcon width="40" height="40" />;
                break;
            case "remove":
                icon = <MinusCircledIcon width="40" height="40" />;
                break;
            case "menu":
                icon = <HamburgerMenuIcon width="40" height="40" />;
                break;
            case "table":
                icon = <TableIcon width="40" height="40" />;
                break;
            case "game":
                icon = <MixIcon width="40" height="40" />;
                break;
            case "person":
                icon = <PersonIcon width="40" height="40" />;
                break;
            case "roster":
                icon = <BookmarkIcon width="40" height="40" />;
                break;
            case "launch":
                icon = <RocketIcon width="30" height="30" />;
                break;
            case "config":
                icon = <GearIcon width="30" height="30" />;
                break;
            case "layout":
                icon = <HobbyKnifeIcon width="30" height="30" />;
                break;
            default:
                icon = <QuestionMarkCircledIcon width="40" height="40" />;
                break;
        }
        return icon;
    }


    return (
      <button onClick={() => handleClick()}
        className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-full p-2 bg-slate-900 hover:bg-blue-500/20 active:bg-slate-700 focus:outline-none transition duration-200 ease-in-out cursor-pointer"
      >
         {setIcon(uiIcon)}
      </button>
    );
  }
  
  export default UiButton;