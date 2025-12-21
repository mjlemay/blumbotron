import { useState, useEffect, useRef } from "react";

const DEBOUNCE_MS = 100; // Time to wait after last keystroke before processing
const ID_LENGTH = 8;
const HEX_REGEX = /^[a-fA-F0-9]+$/;

export function useRFIDNumber(enabled: boolean) {
    const [rfidCode, setRfidCode] = useState('');
    const bufferRef = useRef('');
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;

            // Ignore modifier keys and special keys
            if (key.length !== 1) return;

            // Add character to buffer
            bufferRef.current += key;

            // Clear existing timeout
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }

            // Set new timeout to process buffer after input stops
            timeoutRef.current = window.setTimeout(() => {
                const buffer = bufferRef.current;
                bufferRef.current = '';

                // Validate: must be exactly ID_LENGTH hex characters
                if (buffer.length === ID_LENGTH && HEX_REGEX.test(buffer)) {
                    setRfidCode(buffer);
                }
            }, DEBOUNCE_MS);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled]);

    return rfidCode;
}
