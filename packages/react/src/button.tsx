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
  startIcon?: React.FC<React.SVGProps<SVGSVGElement>>;
  endIcon?: React.FC<React.SVGProps<SVGSVGElement>>;
}>;

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  buttonProps = {},
  disabled,
  loading,
  startIcon: StartIconComponent,
  endIcon: EndIconComponent,
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
      {StartIconComponent && (
        <StartIconComponent
          className='-ml-0.5 mr-1.5 h-5 w-5'
          aria-hidden='true'
        />
      )}
      {loading && (
        <svg
          className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      )}
      {children}
      {EndIconComponent && (
        <EndIconComponent
          className='-mr-0.5 ml-1.5 h-5 w-5'
          aria-hidden='true'
        />
      )}
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
