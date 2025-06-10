type ComponentProps = {
  children?: React.ReactNode;
};

function Blank(props: ComponentProps): JSX.Element {
  const { children } = props;

  return <div className="bg-white rounded-md">{children}</div>;
}

export default Blank;
