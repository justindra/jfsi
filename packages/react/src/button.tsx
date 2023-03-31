import { classNames } from './utils';

function getColourClasses(
  variant: 'primary' | 'default',
  disabled: boolean = false
): NonNullable<React.HTMLAttributes<HTMLElement>['className']> {
  if (disabled) {
    return 'bg-gray-400 hover:bg-gray-400 ring-gray-300 pointer-events-none';
  }
  if (variant === 'primary') {
    return 'bg-primary-600 hover:bg-primary-500 text-white ring-primary-500';
  }
  return 'bg-white hover:bg-gray-50 text-gray-900 ring-gray-300';
}

type ButtonProps = React.PropsWithChildren<{
  variant?: 'primary' | 'default';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
}>;

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  buttonProps = {},
  disabled,
  loading,
}) => {
  return (
    <button
      type='button'
      {...buttonProps}
      onClick={onClick}
      className={classNames(
        'inline-flex items-center rounded-md py-2 px-3 text-sm font-semibold shadow-sm ring-1 ring-inset ',
        getColourClasses(variant, disabled || loading),
        buttonProps.className || ''
      )}>
      {loading ? 'Loading...' : children}
    </button>
  );
};

type LinkButtonProps = React.PropsWithChildren<
  {
    variant?: 'primary' | 'default';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    loading?: boolean;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  disabled,
  loading,
  ...props
}) => {
  return (
    <a
      {...props}
      className={classNames(
        'inline-flex items-center rounded-md py-2 px-3 text-sm font-semibold shadow-sm ring-1 ring-inset ',
        getColourClasses(variant, disabled || loading),
        props.className || ''
      )}>
      {loading ? 'Loading...' : children}
    </a>
  );
};
