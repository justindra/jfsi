import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { HTMLAttributes } from 'react';
import {
  FieldPath,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { HeroIcon } from '../icons';
import { classNames } from '../utils';
import { FieldBase, FieldBaseProps } from './field-base';

export type InputSelectOption = {
  label: string;
  value: string | number | boolean;
  icon?: HeroIcon;
};

export type InputSelectProps = {
  value: InputSelectOption | null;
  onChange: (value: InputSelectOption) => void;
  options: InputSelectOption[];
  inGroup?: boolean;
  className?: HTMLAttributes<'div'>['className'];
  error?: boolean;
  warning?: boolean;
};

export const InputSelect: React.FC<InputSelectProps> = ({
  value,
  onChange,
  options,
  inGroup = false,
  className = '',
  error,
  warning,
}) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={classNames('relative', className)}>
        <ListboxButton
          className={classNames(
            'relative w-full cursor-default bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm sm:leading-6',
            inGroup ? 'rounded-none rounded-l-md' : 'rounded-md shadow-sm',
            error
              ? 'ring-red-500 focus:ring-red-500'
              : warning
              ? 'ring-yellow-500 focus:ring-yellow-500'
              : 'ring-gray-300 focus:ring-primary-600 dark:focus:ring-primary-500'
          )}>
          <span className='flex items-center'>
            {value && value.icon && (
              <value.icon className='flex-shrink-0 h-5 w-5 text-gray-400' />
            )}
            <span className='ml-3 block truncate'>
              {value ? value.label : 'None selected'}
            </span>
          </span>
          <span className='pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </span>
        </ListboxButton>
        <ListboxOptions
          transition
          className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm'>
          {options.map((opt) => (
            <ListboxOption
              key={String(opt.value)}
              className='group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-primary-600 data-[focus]:text-white'
              value={opt}>
              <>
                <div className='flex items-center'>
                  {opt.icon && (
                    <opt.icon className='flex-shrink-0 h-5 w-5 group-data-[selected]:text-gray-400' />
                  )}
                  <span className='group-data-[selected]:font-semibold font-normal ml-3 block truncate'>
                    {opt.label}
                  </span>
                </div>

                <span className='absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden'>
                  <CheckIcon aria-hidden='true' className='h-5 w-5' />
                </span>
              </>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};

export type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
  options: InputSelectOption[];
};

export const FieldSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  options,
  ...props
}: FieldSelectProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({
    ...controlProps,
    defaultValue: (controlProps.defaultValue || '') as PathValue<
      TFieldValues,
      TName
    >,
  });

  const handleOnChange = (value: any) => {
    field.onChange(value.value);
  };

  const value = options.find((opt) => opt.value === field.value) || null;
  const error = fieldState.error?.message || props.error;

  return (
    <FieldBase {...props} error={error}>
      <InputSelect
        value={value}
        onChange={handleOnChange}
        options={options}
        error={!!error}
        warning={!!props.warning}
      />
    </FieldBase>
  );
};
