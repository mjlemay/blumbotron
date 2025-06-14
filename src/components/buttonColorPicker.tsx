import * as Menubar from '@radix-ui/react-menubar';
import { Pencil2Icon } from '@radix-ui/react-icons';
import ColorPicker, { Color } from '@rc-component/color-picker';
import '@rc-component/color-picker/assets/index.css';

type ButtonColorPickerProps = {
  color: string;
  setColor: (color: string) => void;
};

function ButtonColorPicker(props: ButtonColorPickerProps): JSX.Element {
  const { color,  setColor } = props;

  const handleColorChange = (color: Color) => {
    const colorString = color.toHexString();
    setColor(colorString);
  };

  return (
    <div className="bg-black rounded-md">
      <Menubar.Root className="flex">
        <Menubar.Menu>
          <Menubar.Trigger
            className="flex select-none items-center justify-between cursor-pointer rounded p-3 text-lg gap-1.5 font-medium bg-sky-700"
            onClick={() => {}}
          >
          <Pencil2Icon width="20" height="20" />
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className="bg-slate-700/50 rounded-md p-1 mt-1 min-w-[150px] rounded-md shadow-lg">
             <Menubar.Item>
              <ColorPicker
                value={color}
                onChange={handleColorChange}
              />
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </div>
  );
}

export default ButtonColorPicker;
