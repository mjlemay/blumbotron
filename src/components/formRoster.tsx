import DialogContainer from "./dialogContainer";

type FormRosterProps = {
    rosterId?: number;
    action?: string;
    onSuccess?: () => void;
}

function FormRoster(props: FormRosterProps) {
    const { rosterId = 0, action = "new" } = props;
    const formTitle = {
        "new": "Create Roster",
        "edit": "Edit Roster",
        "delete": "Delete Roster"
    }

    return (
      <DialogContainer title="CreateRoster" key={`${action}_${rosterId}`}>
          <h2>{formTitle[action as keyof typeof formTitle]}</h2>
      </DialogContainer>
    );
  }
  
  export default FormRoster;