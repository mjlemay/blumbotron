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
  FrameIcon,
  ImageIcon,
  HobbyKnifeIcon,
} from '@radix-ui/react-icons';

interface UiButtonProps {
  clickHandler?: Function;
  uiIcon?: string;
  isSelected?: boolean;
  size?: string;
}

function UiButton(props: UiButtonProps): JSX.Element {
  const { clickHandler, uiIcon = '', size = '40', isSelected = false } = props;

  const handleClick = () => {
    if (clickHandler) {
      clickHandler();
    }
  };

  const setIcon = (iconName: string) => {
    let icon = <QuestionMarkCircledIcon />;
    switch (iconName) {
      case 'back':
      case 'quit':
        icon = <CrossCircledIcon width={size} height={size} />;
        break;
      case 'add':
        icon = <PlusCircledIcon width={size} height={size} />;
        break;
      case 'remove':
        icon = <MinusCircledIcon width={size} height={size} />;
        break;
      case 'menu':
        icon = <HamburgerMenuIcon width={size} height={size} />;
        break;
      case 'table':
        icon = <TableIcon width={size} height={size} />;
        break;
      case 'game':
        icon = <MixIcon width={size} height={size} />;
        break;
      case 'person':
        icon = <PersonIcon width={size} height={size} />;
        break;
      case 'roster':
        icon = <BookmarkIcon width={size} height={size} />;
        break;
      case 'launch':
        icon = <RocketIcon width={size} height={size} />;
        break;
      case 'config':
        icon = <GearIcon width={size} height={size} />;
        break;
      case 'image':
        icon = <ImageIcon width={size} height={size} />;
        break;
      case 'styles':
        icon = <FrameIcon width={size} height={size} />;
        break;
      case 'layout':
        icon = <HobbyKnifeIcon width={size} height={size} />;
        break;
      default:
        icon = <QuestionMarkCircledIcon width={size} height={size} />;
        break;
    }
    return icon;
  };

  return (
    <button
      onClick={() => handleClick()}
      className={`
            flex
            items-center
            justify-center
            min-w-[40px]
            min-h-[40px]
            rounded-full
            p-2
            bg-slate-900
            ${isSelected ? 'ring-2 ring-slate-400/40' : ' ring-2 ring-slate-400/10 hover:bg-blue-500/20'}
            active:bg-slate-700
            focus:outline-none
            transition
            duration-200
            ease-in-out 
            cursor-pointer
        `}
    >
      {setIcon(uiIcon)}
    </button>
  );
}

export default UiButton;
