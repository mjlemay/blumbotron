interface InputProps {
  actionButton?: React.ReactNode;
  changeHandler?: Function;
  focusHandler?: Function;
  blurHandler?: Function;
  label?: string;
  name: string;
  hidden?: boolean;
  placeholder?: string;
  preview?: React.ReactNode;
  value?: string | number | readonly string[];
  errMsg?: string;
  injectable?: boolean;
  align?: 'left' | 'right';
  type?: 'text' | 'number';
  inline?: boolean;
}

export default function Input(props: InputProps): JSX.Element {
  // Add keyframes for radar bounce animation if not already in global styles
  if (typeof document !== 'undefined' && !document.getElementById('radar-sweep-keyframes')) {
    const style = document.createElement('style');
    style.id = 'radar-sweep-keyframes';
    style.textContent = `
      @keyframes radar-bounce {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(400%); }
        100% { transform: translateX(-100%); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const {
    actionButton,
    align,
    changeHandler = () => {},
    blurHandler = () => {},
    errMsg,
    focusHandler = () => {},
    hidden = false,
    label,
    name,
    placeholder,
    preview,
    inline = false,
    injectable = false,
    type = 'text',
    value = '',
  } = props;

  return (
    <div className={`${inline ? '' : 'my-2'} ${hidden && 'hidden'}`}>
      {label && <label className="block text-slate-200 font-semibold text-lg mb-1 mt-1">{label}</label>}
      <div className="flex flex-row items-center justify-between">
      {preview && <div className="mr-2">{preview}</div>}
      <div className="relative w-full overflow-hidden rounded-lg">
        {injectable && (
          <div 
            className="absolute inset-0 z-0 bg-gradient-to-b from-green-900 to-green-900/75 rounded-lg animate-ping pointer-events-none"
          />
        )}
        <input
          className={`peer outline-none ${injectable ? 'bg-green-900/25 border border-1 border-green-900' : ' bg-gradient-to-b from-slate-900 to-slate-900/75 relative'}
            ${align === 'right' ? 'text-right' : 'text-left'}
            ${inline ? 'h-[42px]' : ''}
            relative border-none rounded-lg block w-full text-xl outline outline-0 
            focus:outline-0 transition-y px-3 ${inline ? 'py-2' : 'py-2.5'} ring-1 ring-neutral-700 focus:ring-2 
            focus:ring-slate-600
            `}
          style={injectable ? { zIndex: 1, position: 'relative' } : undefined}
          value={value}
          name={name}
          placeholder={placeholder}
          type={hidden ? 'hidden' : type}
          onChange={(Event) => changeHandler(Event)}
          onFocus={(Event) => focusHandler(Event)}
          onBlur={(Event) => blurHandler(Event)}
        />
      </div>
        {actionButton && <div className="ml-2">{actionButton}</div>}
      </div>
      <div className={errMsg ? 'block text-red-400 m1' : 'hidden'}>{errMsg}</div>
    </div>
  );
}
