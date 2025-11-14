import DialogContainer from "./dialogContainer";

type FormPlayerProps = {
  action?: string;
  onSuccess?: () => void;
};


function FormPhoto(props: FormPlayerProps): JSX.Element {
  const { action = null, onSuccess = null } = props;

  console.log(action, onSuccess);
  return (
    <DialogContainer title="Capture Photo" onSuccess={onSuccess}>
      <div className="p-4">
        <p>Photo capture functionality goes here.</p>
      </div>
    </DialogContainer>
  );
}

export default FormPhoto;
