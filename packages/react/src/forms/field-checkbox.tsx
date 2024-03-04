import { InputHTMLAttributes, useState } from 'react';
import {
  FieldPath,
  FieldValues,
  PathValue,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { FieldBase, FieldBaseProps } from './field-base';

export type InputCheckboxProps = {
  options: {
    value: string | number;
    label: string;
    description?: string;
  }[];
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
};

export const InputCheckbox: React.FC<InputCheckboxProps> = ({
  options,
  inputProps,
}) => {
  const name = inputProps?.name || 'name';
  return (
    <fieldset>
      <div className='space-y-2'>
        {options.map((option) => (
          <div
            key={option.value.toString()}
            className='relative flex items-start'>
            <div className='flex h-6 items-center'>
              <input
                id={`${name}-${option.value}`}
                aria-describedby={`${name}-${option.value}-description`}
                className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600'
                {...inputProps}
                type='checkbox'
                value={option.value}
                checked={(inputProps?.value as (string | number)[])?.includes(
                  option.value
                )}
              />
            </div>
            <div className='ml-3 text-sm leading-6'>
              <label
                htmlFor={`${name}-${option.value}`}
                className='font-medium text-gray-900'>
                {option.label}
              </label>
              {option.description && (
                <p
                  id={`${name}-${option.value}-description`}
                  className='text-gray-500'>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

type FieldCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FieldBaseProps & {
  controlProps: UseControllerProps<TFieldValues, TName>;
  options: InputCheckboxProps['options'];
};

export const FieldCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  controlProps,
  options,
  ...props
}: FieldCheckboxProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({
    ...controlProps,
    defaultValue: (controlProps.defaultValue || []) as PathValue<
      TFieldValues,
      TName
    >,
  });
  const [value, setValue] = useState<TFieldValues[]>(field.value || []);

  const handleOnChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let newValues = [...value];
    const newVal = evt.target.value as unknown as TFieldValues;
    if (evt.target.checked) {
      if (!newValues.includes(newVal)) {
        newValues.push(evt.target.value as unknown as TFieldValues);
      }
    } else {
      newValues = newValues.filter(
        (v) => v !== (evt.target.value as unknown as TFieldValues)
      );
    }

    field.onChange(newValues);
    setValue(newValues);
  };

  const error = fieldState.error?.message || props.error;
  return (
    <FieldBase {...props} error={error}>
      <InputCheckbox
        options={options}
        inputProps={{ ...field, onChange: handleOnChange }}
      />
    </FieldBase>
  );
};
