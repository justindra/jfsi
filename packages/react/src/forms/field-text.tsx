import {
  FieldPath,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { classNames } from '../utils';
import { FieldBase, FieldBaseProps } from './field-base';
import { forwardRef, InputHTMLAttributes } from 'react';

type InputTextProps = {
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ error, className = '', ...props }, ref) => (
    <input
      ref={ref as any}
      type='text'
      className={classNames(
        'block w-full rounded-md border-0 py-1.5 dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-initial focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
        error
          ? 'ring-red-500 focus:ring-red-500'
          : 'ring-gray-300 dark:ring-white/10 focus:ring-primary-600 dark:focus:ring-primary-500',
        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200',
        className
      )}
      {...props}
    />
  )
);

type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
};

export const FieldText = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  ...props
}: FieldTextProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({
    ...controlProps,
    defaultValue:
      controlProps.defaultValue || ('' as PathValue<TFieldValues, TName>),
  });
  const error = fieldState.error?.message || props.error;
  return (
    <FieldBase {...props} error={error}>
      <InputText
        id={props.name}
        {...field}
        placeholder={props.placeholder}
        error={error}
      />
    </FieldBase>
  );
};
