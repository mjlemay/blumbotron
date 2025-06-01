import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import FormGame from "./formGame";
import FormRoster from "./formRoster"
import FormPlayer from "./formPlayer"
import { refreshData } from "../lib/fetchCalls";
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
            "editGame": <FormGame action="edit" onSuccess={refreshData} />,
            "deleteGame": <FormGame action="delete" onSuccess={refreshData} />,
            "newPlayer": <FormPlayer onSuccess={refreshData} />,
            "editPlayer": <FormPlayer action="edit" onSuccess={refreshData} />,
            "deletePlayer": <FormPlayer  action="delete" onSuccess={refreshData} />,
            "newRoster": <FormRoster onSuccess={refreshData} />,
            "editRoster": <FormRoster action="edit" onSuccess={refreshData} />,
            "deleteRoster": <FormRoster  action="delete" onSuccess={refreshData} />,
        }
        return content[selectedModal as keyof typeof content] || null;
    }
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setExpModal("none");
            refreshData();
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
                <Dialog.Content title="" className="fixed rounded-lg 
                bg-slate-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <VisuallyHidden.Root>
                        <Dialog.DialogTitle></Dialog.DialogTitle>
                    </VisuallyHidden.Root>
                    {dialogContent(selectedModal || '')}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default DialogModal;