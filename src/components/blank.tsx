type ComponentProps = {
  children?: React.ReactNode;
};

function Blank(props: ComponentProps): JSX.Element {
  const { children } = props;

  return <div className="bg-black rounded-md">{children}</div>;
}

export default Blank;
