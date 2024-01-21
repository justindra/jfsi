import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import {
  FieldPath,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { Fragment } from 'react';
import { FieldBase, FieldBaseProps } from '../forms';
import { HeroIcon } from '../icons';
import { classNames } from '../utils';

type FieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
  options: {
    label: string;
    value: string | number | boolean;
    icon?: HeroIcon;
  }[];
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
    <Listbox value={value} onChange={handleOnChange}>
      {({ open }) => (
        <FieldBase {...props} error={error}>
          <div className='relative'>
            <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm sm:leading-6'>
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
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'>
              <Listbox.Options className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                {options.map((opt) => (
                  <Listbox.Option
                    key={String(opt.value)}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-primary-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={opt}>
                    {({ selected, active }) => (
                      <>
                        <div className='flex items-center'>
                          {opt.icon && (
                            <opt.icon
                              className={classNames(
                                'flex-shrink-0 h-5 w-5',
                                active ? '' : 'text-gray-400'
                              )}
                            />
                          )}
                          <span
                            className={classNames(
                              selected ? 'font-semibold' : 'font-normal',
                              'ml-3 block truncate'
                            )}>
                            {opt.label}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-primary-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}>
                            <CheckIcon className='h-5 w-5' aria-hidden='true' />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </FieldBase>
      )}
    </Listbox>
  );
};
