import { useState, useEffect } from "react";
import Input from "./input";
import { CircleBackslashIcon } from "@radix-ui/react-icons";
import IconRfid from "./iconRfid";
import IconQr from "./iconQr";
import { useRFIDNumber, useScannerContext } from "../lib/useRFIDNumber";

type ComponentProps = {
  searchValue?: string;
  updateSearchValue?: (value: string) => void;
};

function SearchBar(props: ComponentProps): JSX.Element {
  const { searchValue = '', updateSearchValue } = props;
  const [injected, setInjected] = useState<string>('');
  const { rfidCode, resetCode } = useRFIDNumber(injected !== '', injected);
  const { openQrScanner, isQrScannerOpen } = useScannerContext();

  const handleRfidClick = (field: string) => {
    // Don't allow RFID activation if QR scanner is open
    if (isQrScannerOpen) return;

    if (injected === field) {
      setInjected('');
      if (updateSearchValue) {
        updateSearchValue('');
      }
      return;
    } else {
      setInjected(field);
    }
  }

  const handleQrClick = (field: string) => {
    // Don't allow QR if RFID is active
    if (injected !== '') return;

    // Set injectable first so the scanner knows where to inject
    setInjected(field);
    openQrScanner(true);
  }

  // Handle RFID code changes
  useEffect(() => {
    if (rfidCode && injected === 'searchValue_new') {
      if (updateSearchValue) {
        updateSearchValue(rfidCode);
      }
      setInjected('');
      resetCode();
    }
  }, [rfidCode, injected, updateSearchValue, resetCode]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = event?.target;
    const formValue = eventTarget?.value;
      if (updateSearchValue) {
        updateSearchValue(formValue);
      }
  };

  const handleNewIdBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const eventTarget = event?.target;
    if (updateSearchValue) {
      updateSearchValue(eventTarget.value);
    }
  };

  return (
  <div className="flex gap-2 items-center justify-center m-1">
                <Input
                  name="searchValue"
                  placeholder="Player Name or ID"
                  injectable={injected === 'searchValue_new'}
                  value={searchValue}
                  inline={true}
                  changeHandler={handleFormChange}
                  blurHandler={handleNewIdBlur}
                />
                <button
                  onClick={() => handleRfidClick("searchValue_new")}
                  disabled={isQrScannerOpen}
                  className={`flex items-center justify-center px-2 py-2 min-w-10 rounded text-white h-[42px] ${
                    isQrScannerOpen ? 'bg-slate-600 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-600 cursor-pointer'
                  }`}
                >
                  {injected !== '' ? <CircleBackslashIcon /> : <IconRfid />}
                </button>
                <button
                  onClick={() => handleQrClick("searchValue_new")}
                  disabled={injected !== ''}
                  className={`px-3 py-2 rounded text-white h-[42px] ${
                    injected !== '' ? 'bg-slate-600 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-600 cursor-pointer'
                  }`}
                >
                  <IconQr />
                </button>
              </div>
  );
}

export default SearchBar;
