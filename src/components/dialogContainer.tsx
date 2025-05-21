type DialogContainerProps ={
    children?: React.ReactNode;
    title?: string;
    content?: React.ReactNode;
}

function DialogContainer(props: DialogContainerProps): JSX.Element {
    const { content = null, title, children } = props;

    return (
        <div className="flex flex-col items-center bg-slate-900/40 rounded-lg shadow-lg">
            <div className={`min-w-[46vw] bg-slate-600 shrink
                ${children ? 'rounded-tr-lg rounded-tl-lg' : 'rounded-lg'} 
                shadow-md p-4 flex flex-col`}>
                {title && (<h2 className="text-3xl font-thin pl-2 pb-2">{title}</h2>)}
                {content && (
                    <div className="flex flex-col items-center justify-center">
                        {content}
                    </div>
                )}
            </div>
            {children && (
                <div className="flex flex-row h-[80px] shrink-0 h-min-[80px] w-full items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
  }
  
  export default DialogContainer;


  