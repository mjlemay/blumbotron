import { Scanner } from '@yudiel/react-qr-scanner';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

interface QrCodeReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (value: string) => void;
}

export default function QrCodeReaderModal(props: QrCodeReaderModalProps): JSX.Element {
  const { isOpen, onClose, onSuccess } = props;

  const handleDecode = (result: string) => {
    console.log('[QR] Decoded:', result);
    if (result && result.length > 0) {
      onSuccess(result);
      onClose();
    }
  };

  const handleError = (error: unknown) => {
    console.log('[QR] Error:', error instanceof Error ? error.message : error);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="
            fixed
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            bg-slate-800
            rounded-lg
            p-4
            z-50
            w-[90vw]
            max-w-md
            shadow-xl
          "
        >
          <Dialog.Title className="text-lg font-semibold text-slate-200 mb-4">
            Scan QR Code
          </Dialog.Title>

          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black">
            {isOpen && (
              <Scanner
                onScan={(result) => result?.[0]?.rawValue && handleDecode(result[0].rawValue)}
                onError={handleError}
                styles={{ container: { width: '100%', height: '100%' }, video: { width: '100%', height: '100%', objectFit: 'cover' } }}
              />
            )}
          </div>

          <p className="text-sm text-slate-400 mt-3 text-center">
            Position the QR code within the camera view
          </p>

          <Dialog.Close asChild>
            <button
              className="
                absolute
                top-3
                right-3
                p-1
                rounded-full
                text-slate-400
                hover:text-white
                hover:bg-slate-700
                transition-colors
              "
              aria-label="Close"
            >
              <Cross2Icon width="20" height="20" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
