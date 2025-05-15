import { AvatarIcon, BookmarkIcon, PersonIcon, StarIcon } from "@radix-ui/react-icons";
 
type ChipItem = {
    id?: string | number;
    text: string;
    icon?: string;
    color?: string;
    handleClick?: (id: string | number | null) => void;
}

type ComponentProps = ChipItem & {
    collection?: ChipItem[];
    collectionName?: string;
}


function Chip(props: ComponentProps): JSX.Element {
    const { color, id, text, handleClick = () =>{}, icon } = props;

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
            default:
                return <></>;
        }
    }

    return (
        <div
            onClick={() => handleClick(id || null)}
            key={`${id}_${text}`}
            className={`flex flex-row grow-0 text-sm gap-0.5 ${color || "bg-slate-500/50"} p-1 pr-2 pl-2 items-center rounded-full shadow-sm`}
        >
            {getIcon(icon)} {text}
        </div>
    );
  }
  
  export default Chip;