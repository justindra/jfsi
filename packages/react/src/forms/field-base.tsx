export type FieldBaseProps = React.PropsWithChildren<{
  label?: string;
  name?: string;
  helperText?: string;
  error?: string;
  warning?: string;
  placeholder?: string;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  disabled?: boolean;
}>;

export const FieldBase: React.FC<FieldBaseProps> = ({
  label,
  name,
  helperText,
  error,
  warning,
  children,
  className,
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className='block text-sm font-medium leading-6 text-gray-900 dark:text-white'>
          {label}
        </label>
      )}
      <div className={label ? 'mt-2' : ''}>{children}</div>
      {error ? (
        <p className='mt-3 text-sm leading-6 text-red-600 dark:text-red-400'>
          {error}
        </p>
      ) : warning ? (
        <p className='mt-3 text-sm leading-6 text-yellow-600 dark:text-yellow-400'>
          {warning}
        </p>
      ) : helperText ? (
        <p className='mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400'>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
