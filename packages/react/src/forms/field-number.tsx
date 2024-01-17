import {
  FieldPath,
  FieldValues,
  PathValue,
  RegisterOptions,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { classNames } from '../utils';
import { FieldBase, FieldBaseProps } from './field-base';

type FieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
  suffix?: string;
};

export const FieldNumber = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  ...props
}: FieldNumberProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({
    ...controlProps,
    defaultValue: (Number(controlProps.defaultValue) || 0) as PathValue<
      TFieldValues,
      TName
    >,
    control: !!controlProps.control
      ? ({
          ...controlProps.control,
          register: (
            name: TName,
            options?: RegisterOptions<TFieldValues, TName>
          ) =>
            controlProps.control?.register(name, {
              ...options,
              valueAsNumber: true,
            } as any),
        } as any)
      : undefined,
  });
  const error = fieldState.error?.message || props.error;
  return (
    <FieldBase {...props} error={error}>
      <div className='flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 sm:max-w-md dark:bg-white/5'>
        <input
          type='number'
          id={props.name}
          {...field}
          className={classNames(
            'block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6',
            error
              ? 'ring-red-500 focus:ring-red-500'
              : 'ring-gray-300 dark:ring-white/10 focus:ring-primary-600 dark:focus:ring-primary-500',
            props.suffix ? 'pr-1' : 'pr-3'
          )}
          placeholder={props.placeholder}
        />
        {props.suffix && (
          <span className='flex select-none items-center pr-3 text-gray-500 sm:text-sm'>
            {props.suffix}
          </span>
        )}
      </div>
    </FieldBase>
  );
};
