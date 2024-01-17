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
      <input
        type='number'
        id={props.name}
        {...field}
        className={classNames(
          'block w-full rounded-md border-0 py-1.5 dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset  placeholder:text-gray-400 dark:placeholder:text-initial focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
          error
            ? 'ring-red-500 focus:ring-red-500'
            : 'ring-gray-300 dark:ring-white/10 focus:ring-primary-600 dark:focus:ring-primary-500'
        )}
        placeholder={props.placeholder}
      />
    </FieldBase>
  );
};
