import { useState } from "react";
import Input from "./input";
import { CircleBackslashIcon } from "@radix-ui/react-icons";
import IconRfid from "./iconRfid";
import IconQr from "./iconQr";
import { useRFIDNumber } from '../lib/useRFIDNumber';

type ComponentProps = {
  searchValue?: string;
  updateSearchValue?: (value: string) => void;
};

function SearchBar(props: ComponentProps): JSX.Element {
  const { searchValue = '', updateSearchValue } = props;
  const [injected, setInjected] = useState<string>('');
  const rifdNumber = useRFIDNumber(injected !== '');

  const handleRfidClick = (field: string) => {
    if (injected === field) {
      setInjected('');
      return;
    } else {
      setInjected(field);
    }
  }

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
                  className="flex items-center justify-center px-2 py-2 min-w-10 bg-sky-700 hover:bg-sky-600 rounded text-white h-[42px] cursor-pointer"
                >
                  {injected !== '' ? <CircleBackslashIcon /> : <IconRfid />}
                </button>
                <button
                  onClick={() => {}}
                  className="px-3 py-2 bg-sky-700 hover:bg-sky-600 rounded text-white h-[42px] cursor-pointer"
                >
                  <IconQr />
                </button>
              </div>
  );
}

export default SearchBar;
