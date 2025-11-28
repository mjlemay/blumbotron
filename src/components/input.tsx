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
  align?: 'left' | 'right';
  type?: 'text' | 'number';
}

export default function Input(props: InputProps): JSX.Element {
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
    type = 'text',
    value = '',
  } = props;

  return (
    <div className={`my-2 ${hidden && 'hidden'}`}>
      <label className="block text-slate-200 font-semibold text-lg mb-1 mt-1">{label}</label>
      <div className="flex flex-row items-center justify-between">
      {preview && <div className="mr-2">{preview}</div>}
      <input
        className={`peer outline-none bg-gradient-to-b from-slate-900 to-slate-900/75 
          ${align === 'right' ? 'text-right' : 'text-left'}
          border-none rounded-lg block w-full p-2.5 text-xl outline outline-0 
          focus:outline-0 transition-all px-3 py-2.5 ring-1 ring-neutral-700 focus:ring-2 
          focus:ring-slate-600
          `}
        value={value}
        name={name}
        placeholder={placeholder}
        type={hidden ? 'hidden' : type}
        onChange={(Event) => changeHandler(Event)}
        onFocus={(Event) => focusHandler(Event)}
        onBlur={(Event) => blurHandler(Event)}
      />
        {actionButton && <div className="ml-2">{actionButton}</div>}
      </div>
      <div className={errMsg ? 'block text-red-400 m1' : 'hidden'}>{errMsg}</div>
    </div>
  );
}
