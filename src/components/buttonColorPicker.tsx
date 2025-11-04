import * as Menubar from '@radix-ui/react-menubar';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { SketchPicker, ColorResult } from 'react-color';

type ButtonColorPickerProps = {
  color: string;
  setColor: (color: string) => void;
};

function ButtonColorPicker(props: ButtonColorPickerProps): JSX.Element {
  const { color,  setColor } = props;

  const handleColorChange = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
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
            <Menubar.Content className="bg-slate-700/50 rounded-md p-3 mt-1 min-w-[250px] rounded-md shadow-lg z-[9999]">
             <Menubar.Item>
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                disableAlpha={false}
                presetColors={[
                  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
                  '#ffff00', '#ff00ff', '#00ffff', '#808080', '#ffa500'
                ]}
                styles={{
                  default: {
                    picker: {
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      fontFamily: 'inherit'
                    }
                  }
                }}
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
