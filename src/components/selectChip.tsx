import { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { PlusCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { forwardRef } from 'react';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';

type Selections = {
  data?: any;
  label: string;
  value?: string | number;
};

type ComponentProps = {
  defaultValue?: string;
  handleSelect?: (value: string) => void;
  moreClasses?: string;
  resetOnSelect?: boolean;
  selectIcon?: React.ReactNode;
  selections?: Selections[] | null;
  selectLabel?: string;
  selectPlaceholder?: string;
  selectPrefix?: string;
};

function SelectChip(props: ComponentProps): JSX.Element {
  const {
    defaultValue,
    handleSelect = () => {},
    moreClasses = '',
    resetOnSelect = false,
    selectIcon,
    selections,
    selectLabel,
    selectPlaceholder = 'Add',
    selectPrefix,
  } = props;
  const [selected, setSelected] = useState<string | undefined>(defaultValue || undefined);

  const SelectItem = forwardRef(
    (
      { children, value }: { children: React.ReactNode; value: string },
      forwardedRef: React.Ref<HTMLDivElement>
    ) => {
      return (
        <Select.Item
          className="
                        relative
                        flex
                        select-none
                        items-center
                        rounded-lg
                        bg-slate-600/75
                        mb-1
                        text-sm
                        leading-none
                        cursor-pointer
                        hover:bg-blue-600/20
                        data-[disabled]:pointer-events-none
                    "
          ref={forwardedRef}
          value={value}
        >
          <Select.ItemText>{children}</Select.ItemText>
          <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
            •
          </Select.ItemIndicator>
        </Select.Item>
      );
    }
  );

  const selectAndReset = (value: string) => {
    handleSelect(value);
    if (resetOnSelect) {
      setSelected('');
    } else {
      setSelected(value);
    }
  };

  const avatar = (seed: string) => {
    const options: any = {
      size: '20',
      seed,
    };

    return createAvatar(shapes, { ...options }).toDataUri();
  };

  useEffect(() => {
    if (selections || defaultValue) {
      setSelected(defaultValue);
    }
  }, [selections, defaultValue]);

  return (
    <Select.Root
      onValueChange={(value) => selectAndReset(value)}
      value={selected}
      defaultValue={defaultValue}
    >
      <Select.Trigger
        className={`
                inline-flex
                items-center
                justify-center
                bg-slate-800
                leading-none
                shadow-lg
                p-1
                gap-1
                items-center
                rounded-full
                shadow-sm
                outline-none 
                hover:bg-blue-600/20
                data-[placeholder]:text-slate-300
                text-lg
                cursor-pointer
                ${moreClasses}
            `}
        aria-label="items"
      >
        <Select.Value placeholder={<div className="p-1 pr-0">{selectPlaceholder}</div>} />
        <Select.Icon>
          {selectIcon ||
            (resetOnSelect ? (
              <PlusCircledIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            ))}
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md bg-slate-700/75 shadow-lg">
          <Select.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-slate-900/87">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-[5px] bg-slate-700/75">
            <Select.Group>
              {selectLabel && (
                <Select.Label className="px-[25px] text-xl leading-[25px]">
                  {selectLabel}
                </Select.Label>
              )}
              {selections &&
                selections.map((item) => {
                  return (
                    <SelectItem
                      key={`${selectPrefix || selectLabel || 'select'}-${item.label}`}
                      value={(item.value as string) || ''}
                    >
                      <div className="flex flex-row items-center gap-2 text-xl p-1 rounded-full">
                        {item.data?.snowflake && (
                          <img
                            src={avatar(item.data?.snowflake)}
                            className="rounded"
                            alt={item.label}
                          />
                        )}
                        <span>{item.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-slate-900/87">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default SelectChip;
