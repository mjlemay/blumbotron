import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import QrCodeReaderModal from "../components/qrCodeReaderModal";

const DEBOUNCE_MS = 150;
const RAPID_THRESHOLD_MS = 50;
const ID_LENGTH = 10;
const HEX_REGEX = /^[a-fA-F0-9]+$/;
const TOAST_DURATION = 3000;

type ScanMethod = 'none' | 'rfid' | 'qr';

type ScannerContextType = {
    lastScannedCode: string;
    toastMessage: string | null;
    activeMethod: ScanMethod;
    openQrScanner: (skipCheck?: boolean) => void;
    closeQrScanner: () => void;
    isQrScannerOpen: boolean;
};

const ScannerContext = createContext<ScannerContextType>({
    lastScannedCode: '',
    toastMessage: null,
    activeMethod: 'none',
    openQrScanner: () => {},
    closeQrScanner: () => {},
    isQrScannerOpen: false,
});

export function useScannerContext() {
    return useContext(ScannerContext);
}

// Legacy export for backward compatibility
export function useRFIDContext() {
    return useScannerContext();
}

type RFIDProviderProps = {
    children: ReactNode;
};

export function RFIDProvider({ children }: RFIDProviderProps) {
    const [lastScannedCode, setLastScannedCode] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
    const [activeMethod, setActiveMethod] = useState<ScanMethod>('none');
    const bufferRef = useRef('');
    const timeoutRef = useRef<number | null>(null);
    const lastKeystrokeRef = useRef<number>(0);
    const isRapidInputRef = useRef(false);
    const toastTimeoutRef = useRef<number | null>(null);

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setToastMessage(null);
        }, TOAST_DURATION);
    }, []);

    const openQrScanner = useCallback((skipCheck: boolean = false) => {
        // Check if there's an injectable input (skip if called from component that just set it)
        if (!skipCheck) {
            const injectableInput = document.querySelector('input[data-injectable="true"]');
            if (!injectableInput) {
                showToast("Scanning is disabled until method is selected");
                return;
            }
        }
        setActiveMethod('qr');
        setIsQrScannerOpen(true);
    }, [showToast]);

    const closeQrScanner = useCallback(() => {
        setIsQrScannerOpen(false);
        setActiveMethod('none');
    }, []);

    const handleQrSuccess = useCallback((value: string) => {
        console.log('[QR] Success:', value);
        const injectableInput = document.querySelector('input[data-injectable="true"]') as HTMLInputElement;

        if (injectableInput) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            )?.set;

            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(injectableInput, value);
                injectableInput.dispatchEvent(new Event('input', { bubbles: true }));
                injectableInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            setLastScannedCode(value);
        }
        setActiveMethod('none');
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't process RFID if QR scanner is open
            if (isQrScannerOpen) return;

            const { key } = event;

            // Only capture single characters
            if (key.length !== 1) return;

            // Only capture hex characters for RFID
            if (!HEX_REGEX.test(key)) {
                // Non-hex character resets rapid detection
                bufferRef.current = '';
                isRapidInputRef.current = false;
                return;
            }

            const now = Date.now();
            const timeSinceLastKey = now - lastKeystrokeRef.current;
            lastKeystrokeRef.current = now;

            // Detect rapid input pattern (RFID scanner)
            if (timeSinceLastKey < RAPID_THRESHOLD_MS && bufferRef.current.length > 0) {
                isRapidInputRef.current = true;
                setActiveMethod('rfid');
            }

            // Add to buffer
            bufferRef.current += key;

            // If rapid input detected, block from reaching other inputs
            if (isRapidInputRef.current) {
                event.preventDefault();
                event.stopPropagation();
            }

            // Clear existing timeout
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }

            // Debounce - process after input stops
            timeoutRef.current = window.setTimeout(() => {
                const value = bufferRef.current;
                bufferRef.current = '';
                const wasRapid = isRapidInputRef.current;
                isRapidInputRef.current = false;

                console.log('[RFID] Debounce fired:', { value, wasRapid, length: value.length, isHex: HEX_REGEX.test(value) });

                // Only process if it looks like RFID (rapid + correct length + hex)
                if (wasRapid && value.length === ID_LENGTH && HEX_REGEX.test(value)) {
                    // Check for injectable input
                    const injectableInput = document.querySelector('input[data-injectable="true"]') as HTMLInputElement;
                    console.log('[RFID] Injectable input found:', injectableInput);

                    if (injectableInput) {
                        // Set value and trigger change event
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype,
                            'value'
                        )?.set;

                        if (nativeInputValueSetter) {
                            nativeInputValueSetter.call(injectableInput, value);
                            injectableInput.dispatchEvent(new Event('input', { bubbles: true }));
                            injectableInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        setLastScannedCode(value);
                    } else {
                        // No injectable input - show toast and clear any focused input
                        console.log('[RFID] No injectable input, showing toast');
                        const activeElement = document.activeElement as HTMLInputElement;
                        if (activeElement?.tagName === 'INPUT' && activeElement.type !== 'hidden') {
                            activeElement.value = '';
                            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                            activeElement.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        showToast("Scanning is disabled until method is selected");
                    }
                } else if (value.length > 0) {
                    console.log('[RFID] Not processing - wasRapid:', wasRapid, 'length:', value.length, 'expected:', ID_LENGTH);
                }

                setActiveMethod('none');
            }, DEBOUNCE_MS);
        };

        // Use capture phase to intercept before inputs
        window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        };
    }, [showToast, isQrScannerOpen]);

    return (
        <ScannerContext.Provider value={{
            lastScannedCode,
            toastMessage,
            activeMethod,
            openQrScanner,
            closeQrScanner,
            isQrScannerOpen,
        }}>
            {children}
            {toastMessage && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        border: '1px solid #334155',
                        fontSize: '14px',
                    }}
                >
                    {toastMessage}
                </div>
            )}
            <QrCodeReaderModal
                isOpen={isQrScannerOpen}
                onClose={closeQrScanner}
                onSuccess={handleQrSuccess}
            />
        </ScannerContext.Provider>
    );
}

// Legacy hook for backward compatibility - now just returns context values
export function useRFIDNumber(enabled: boolean, _inputName?: string) {
    const { lastScannedCode } = useScannerContext();
    const [rfidCode, setRfidCode] = useState('');
    const processedRef = useRef<string>('');

    // When a new code is scanned and this hook is enabled, capture it
    useEffect(() => {
        if (enabled && lastScannedCode && lastScannedCode !== processedRef.current) {
            processedRef.current = lastScannedCode;
            setRfidCode(lastScannedCode);
        }
    }, [enabled, lastScannedCode]);

    const resetCode = useCallback(() => {
        setRfidCode('');
    }, []);

    return { rfidCode, resetCode };
}
