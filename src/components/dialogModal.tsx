import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import FormGame from "./formGame";
import FormRoster from "./formRoster"
import { useExperienceStore } from "../stores/experienceStore";
type DialogModalProps = {
    children?: React.ReactNode;
    triggerText?: string;
    selectedModal?: string;
    isOpen?: boolean;
};

function DialogModal({  triggerText, selectedModal, isOpen = false }: DialogModalProps): JSX.Element {
    const { setExpModal } = useExperienceStore();
    const [open, setOpen] = useState(false);

    const dialogContent = (selectedModal:string) => {
        const content = {
            "newGame": <FormGame />,
            "editGame": <FormGame gameId={0} />,
            "deleteGame": <FormGame gameId={0} action="delete" />,
            "newRoster": <FormRoster />,
            "editRoster": <FormRoster rosterId={0} />,
            "deleteRoster": <FormRoster rosterId={0} action="delete" />,
        }
        return content[selectedModal as keyof typeof content] || null;
    }
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setExpModal("none");
        }
    }

    useEffect(() => {
        if (isOpen !== open) {
            setOpen(isOpen);
        }
    }, [isOpen]);

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            {triggerText && (
                <Dialog.Trigger>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        {triggerText}
                    </button>
                </Dialog.Trigger>
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed rounded-lg bg-slate-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {dialogContent(selectedModal || '')}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default DialogModal;