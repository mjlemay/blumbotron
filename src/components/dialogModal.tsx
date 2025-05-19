import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useExperienceStore } from "../stores/experienceStore";
type DialogModalProps = {
    children?: React.ReactNode;
    triggerText?: string;
    selectedModal?: string;
    onSubmit?: () => Promise<void>;
    isOpen?: boolean;
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

function DialogModal({ children, triggerText, selectedModal, isOpen = false, onSubmit }: DialogModalProps): JSX.Element {
    const { setExpModal } = useExperienceStore();
    const [open, setOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setExpModal("none");
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (onSubmit) {
            await onSubmit();
        }
        await wait();
        handleOpenChange(false);
    };

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
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg">
                    <h2>{selectedModal}</h2>
                    <form onSubmit={handleSubmit}>
                        {children}
                        <div className="mt-4 flex justify-end">
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default DialogModal;