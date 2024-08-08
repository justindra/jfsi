import {
  FieldPath,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { FieldBase, FieldBaseProps } from '../forms';
import { classNames } from '../utils';
import { forwardRef, InputHTMLAttributes } from 'react';

type InputNumberProps = {
  prefix?: string;
  suffix?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ error, className = '', disabled, prefix, suffix, ...props }, ref) => (
    <div
      className={classNames(
        'flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset bg-white dark:bg-white/5 items-center',
        error
          ? 'ring-red-500 focus:ring-red-500'
          : 'ring-gray-300 dark:ring-white/10 focus-within:ring-primary-600 dark:focus-within:ring-primary-500',
        disabled ? '!bg-gray-50 !ring-gray-200' : '',
        className
      )}>
      {prefix && (
        <span className='select-none pl-3 text-gray-500 sm:text-sm'>
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type='number'
        {...props}
        className={classNames(
          'flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 min-w-0',
          prefix ? 'pl-1' : 'pl-3',
          suffix ? 'pr-1' : 'pr-3',
          'disabled:cursor-not-allowed disabled:text-gray-500'
        )}
        disabled={disabled}
      />
      {suffix && (
        <span className='select-none pr-3 text-gray-500 sm:text-sm'>
          {suffix}
        </span>
      )}
    </div>
  )
);

type FieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
} & Pick<InputNumberProps, 'prefix' | 'suffix' | 'min' | 'max' | 'step'>;

export const FieldNumber = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  disabled,
  min,
  max,
  step,
  prefix,
  suffix,
  ...props
}: FieldNumberProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({
    ...controlProps,
    defaultValue: (Number(controlProps.defaultValue) || 0) as PathValue<
      TFieldValues,
      TName
    >,
  });
  const error = fieldState.error?.message || props.error;
  return (
    <FieldBase {...props} error={error}>
      <InputNumber
        id={props.name}
        min={min}
        max={max}
        step={step}
        prefix={prefix}
        suffix={suffix}
        {...field}
        placeholder={props.placeholder}
        disabled={disabled}
      />
    </FieldBase>
  );
};
