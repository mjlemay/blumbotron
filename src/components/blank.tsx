type ComponentProps = {
  children?: React.ReactNode;
};

function Blank(props: ComponentProps): JSX.Element {
  const { children } = props;

  return (
    <div className="bg-black rounded-md">
      <div className="flex flex-col items-center justify-start">
        <div className="flex flex-row items-center justify-start">
          <div className="flex flex-col items-center justify-start">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blank;
