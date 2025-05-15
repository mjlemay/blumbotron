import { AvatarIcon, BookmarkIcon, PersonIcon } from "@radix-ui/react-icons";

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

const colors: Record<string, string> = {
    red: "bg-red-500/50",
    blue: "bg-blue-500/50",
    green: "bg-green-500/50",
    yellow: "bg-yellow-500/50",
    purple: "bg-purple-500/50",
    pink: "bg-pink-500/50",
    gray: "bg-gray-500/50",
}

function Chip(props: ComponentProps): JSX.Element {
    const { color = "gray", id, text, handleClick = () =>{}, icon } = props;

    const getIcon = (icon: string | undefined) => {
        switch (icon) {
            case "player":
                return <PersonIcon className="text-slate-100" />;
            case "team":
                return <AvatarIcon className="text-slate-100" />;
            case "roster":
                return <BookmarkIcon className="text-slate-100" />;
            default:
                return <></>;
        }
    }

    return (
        <div
            onClick={() => handleClick(id || null)}
            key={`${id}_${text}`}
            className={`flex flex-row grow-0 text-sm gap-0.5 ${colors[color] || "bg-slate-500/50"} p-1 pr-2 pl-2 items-center rounded-full shadow-sm`}
        >
            {getIcon(icon)} {text}
        </div>
    );
  }
  
  export default Chip;