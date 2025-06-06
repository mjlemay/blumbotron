import { 
    AvatarIcon,
    BookmarkIcon,
    CrossCircledIcon,
    PersonIcon,
    PlusCircledIcon, 
    StarIcon,
} from "@radix-ui/react-icons";
 
type ChipItem = {
    id?: string | number;
    text: string;
    icon?: string;
    color?: string;
    actionIcon?: string;
    handleClick?: (id: string | number | null) => void;
}

type ComponentProps = ChipItem & {
    collection?: ChipItem[];
    collectionName?: string;
}


function Chip(props: ComponentProps): JSX.Element {
    const { color, id, text, handleClick = () =>{}, icon, actionIcon = null } = props;

    const getIcon = (icon: string | undefined) => {
        switch (icon) {
            case "player":
                return <PersonIcon className="text-slate-100" />;
            case "team":
                return <AvatarIcon className="text-slate-100" />;
            case "roster":
                return <BookmarkIcon className="text-slate-100" />;
            case "everyone":
                return <StarIcon className="text-slate-100" />;
            case "remove":
                return <CrossCircledIcon className="text-slate-100" />;
            case "add":
                return <PlusCircledIcon className="text-slate-100" />;
            default:
                return <></>;
        }
    }

    return (
        <div
            onClick={() => handleClick(id || null)}
            key={`${id}_${text}`}
            className={`
                flex
                flex-row
                grow-0
                text-lg
                gap-0.5
                ${color || "bg-slate-500/50"}
                p-1
                pr-2
                pl-2
                items-center
                justify-center
                rounded-full
                shadow-sm
                ${actionIcon && "hover:bg-blue-600/20 cursor-pointer"}
            `}
        >
            <span className="flex-1">{getIcon(icon)}</span>
            <span className="text-center whitespace-nowrap truncate max-w-[10vw]">{text}</span>
            { actionIcon && <span className="flex-1">{getIcon(actionIcon)}</span> }
        </div>
    );
  }
  
  export default Chip;