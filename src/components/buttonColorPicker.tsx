import { useState, useEffect } from 'react';
import * as Menubar from '@radix-ui/react-menubar';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { SwatchesPicker, ColorResult } from 'react-color';

type ButtonColorPickerProps = {
  color: string;
  setColor: (color: string) => void;
};

// Standard color swatches - 7 colors per row (dark to light)
const colorSwatches = [
  // Grayscale
  ['#000000', '#2d2d2d', '#5a5a5a', '#878787', '#b4b4b4', '#e1e1e1', '#ffffff'],
  // Reds
  ['#4d0000', '#800000', '#b30000', '#e60000', '#ff3333', '#ff8080', '#ffcccc'],
  // Oranges
  ['#4d2600', '#804000', '#b35900', '#e67300', '#ff9933', '#ffbf80', '#ffe5cc'],
  // Yellows
  ['#4d4d00', '#808000', '#b3b300', '#e6e600', '#ffff33', '#ffff80', '#ffffcc'],
  // Greens
  ['#004d00', '#008000', '#00b300', '#00e600', '#33ff33', '#80ff80', '#ccffcc'],
  // Teals
  ['#004d4d', '#008080', '#00b3b3', '#00e6e6', '#33ffff', '#80ffff', '#ccffff'],
  // Blues
  ['#00004d', '#000080', '#0000b3', '#0000e6', '#3333ff', '#8080ff', '#ccccff'],
  // Purples
  ['#26004d', '#4d0080', '#7300b3', '#9900e6', '#b833ff', '#d580ff', '#f0ccff'],
  // Magentas
  ['#4d004d', '#800080', '#b300b3', '#e600e6', '#ff33ff', '#ff80ff', '#ffccff'],
  // Pinks
  ['#4d0026', '#800040', '#b30059', '#e60073', '#ff3399', '#ff80bf', '#ffcce5'],
  // Earth Tones
  ['#3d2314', '#5c4033', '#8b5a2b', '#a0522d', '#c19a6b', '#d2b48c', '#f5deb3'],
  // Acid/Neon
  ['#39ff14', '#00ffff', '#ff00ff', '#ff073a', '#ffff00', '#ff6600', '#bf00ff'],
];

// Helper to parse hex color and extract RGB + alpha
const parseColor = (color: string): { r: number; g: number; b: number; a: number } => {
  let hex = color.replace('#', '');
  let a = 1;

  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    a = parseInt(hex.slice(6, 8), 16) / 255;
    hex = hex.slice(0, 6);
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a,
    };
  }

  // Handle rgba format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
};

// Convert RGB + alpha to hex8 or rgba string
const toColorString = (r: number, g: number, b: number, a: number): string => {
  if (a === 1) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

function ButtonColorPicker(props: ButtonColorPickerProps): JSX.Element {
  const { color, setColor } = props;
  const [opacity, setOpacity] = useState(1);
  const [baseColor, setBaseColor] = useState({ r: 0, g: 0, b: 0 });

  // Parse initial color on mount or when color prop changes
  useEffect(() => {
    const parsed = parseColor(color);
    setBaseColor({ r: parsed.r, g: parsed.g, b: parsed.b });
    setOpacity(parsed.a);
  }, [color]);

  const handleColorChange = (colorResult: ColorResult) => {
    const { r, g, b } = colorResult.rgb;
    setBaseColor({ r, g, b });
    setColor(toColorString(r, g, b, opacity));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    setColor(toColorString(baseColor.r, baseColor.g, baseColor.b, newOpacity));
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
            <Menubar.Content
              className="bg-slate-800 rounded-md p-3 mt-1 shadow-lg z-[9999] max-h-[80vh] overflow-auto"
              side="bottom"
              align="end"
              sideOffset={5}
              collisionPadding={10}
            >
              <Menubar.Item onSelect={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-3">
                  <SwatchesPicker
                    color={color}
                    onChange={handleColorChange}
                    colors={colorSwatches}
                    width={280}
                    height={220}
                    styles={{
                      default: {
                        picker: {
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          border: '1px solid #475569',
                        },
                        overflow: {
                          backgroundColor: '#1e293b',
                        }
                      }
                    }}
                  />

                  {/* Opacity Slider */}
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    <div className="flex justify-between items-center text-white text-sm">
                      <span>Opacity</span>
                      <span>{Math.round(opacity * 100)}%</span>
                    </div>
                    <div
                      className="relative h-6 rounded"
                      style={{
                        background: `linear-gradient(to right,
                          rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0) 0%,
                          rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1) 100%),
                          repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 12px 12px`
                      }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={opacity}
                        onChange={handleOpacityChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div
                        className="absolute top-0 bottom-0 w-4 h-6 bg-white border-2 border-gray-400 rounded shadow-md pointer-events-none"
                        style={{ left: `calc(${opacity * 100}% - 8px)` }}
                      />
                    </div>

                    {/* Color Preview */}
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-10 h-10 rounded border border-gray-500"
                        style={{
                          background: `linear-gradient(${toColorString(baseColor.r, baseColor.g, baseColor.b, opacity)}, ${toColorString(baseColor.r, baseColor.g, baseColor.b, opacity)}),
                            repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 12px 12px`
                        }}
                      />
                      <span className="text-white text-xs font-mono">
                        {toColorString(baseColor.r, baseColor.g, baseColor.b, opacity)}
                      </span>
                    </div>
                  </div>
                </div>
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </div>
  );
}

export default ButtonColorPicker;
