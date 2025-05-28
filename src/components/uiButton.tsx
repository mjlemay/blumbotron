import { 
    CrossCircledIcon,
    QuestionMarkCircledIcon,
    PlusCircledIcon,
    MinusCircledIcon,
    HamburgerMenuIcon,
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
            default:
                icon = <QuestionMarkCircledIcon width="40" height="40" />;
                break;
        }
        return icon;
    }


    return (
      <button onClick={() => handleClick()}
        className="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 focus:outline-none transition duration-200 ease-in-out cursor-pointer"
      >
         {setIcon(uiIcon)}
      </button>
    );
  }
  
  export default UiButton;