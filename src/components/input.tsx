
interface InputProps {
    changeHandler?: Function;
    label?: string;
    name: string;
    hidden?: boolean;
    value?: string | number | readonly string[];
    errMsg?: string;
    align?: 'left' | 'right';
    type?: 'text' | 'number';
}
  
  export default function Input(props:InputProps):JSX.Element {
    const { 
      align,
      changeHandler = ()=>{},
      errMsg,
      hidden = false,
      label,
      name,
      type = 'text',
      value = ''
    } = props;
  
    return (
      <div className='my-2'>
        <label className='block text-slate-200 font-semibold text-lg mb-1 mt-1'>{label}</label>
        <input 
          className={`peer outline-none bg-gradient-to-b from-slate-900 to-slate-900/75 
          ${align === 'right' ? 'text-right' : 'text-left'}
          border-none rounded-lg block w-full p-2.5 text-xl outline outline-0 
          focus:outline-0 transition-all px-3 py-2.5 ring-1 ring-neutral-700 focus:ring-2 
          focus:ring-slate-600
          `}
          value={value}
          name={name}
          type={hidden ? 'hidden' : type }
          onChange={(Event) => changeHandler(Event)}
        />
        <div className={errMsg ? 'block text-red-400 m1' : 'hidden'}>{errMsg}</div>
      </div>
    )
  }