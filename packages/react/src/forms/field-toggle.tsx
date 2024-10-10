import { Description, Field, Label, Switch } from '@headlessui/react';
import {
  FieldPath,
  FieldValues,
  PathValue,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { FieldBaseProps } from './field-base';

type FieldToggleProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
};

export const FieldToggle = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  ...props
}: FieldToggleProps<TFieldValues, TName>) => {
  const { field } = useController({
    ...controlProps,
    defaultValue:
      controlProps.defaultValue ?? (false as PathValue<TFieldValues, TName>),
  });

  return (
    <Field className='flex items-start justify-between space-x-2 mt-2'>
      <span className='flex flex-grow flex-col'>
        <Label
          as='span'
          passive
          className='text-sm font-medium leading-6 text-gray-900'>
          {props.label}
        </Label>
        {props.helperText && (
          <Description as='span' className='text-sm text-gray-500'>
            {props.helperText}
          </Description>
        )}
      </span>
      <Switch
        checked={field.value}
        onChange={field.onChange}
        className='group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 data-[checked]:bg-primary-600'>
        <span
          aria-hidden='true'
          className='pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5'
        />
      </Switch>
    </Field>
  );
};
