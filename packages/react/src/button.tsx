import type { HeroIcon } from './icons';
import { classNames } from './utils';

type ButtonVariant =
  | 'primary'
  | 'default'
  | 'none'
  | 'success'
  | 'danger'
  | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

function getColourClasses(
  variant: ButtonVariant
): NonNullable<React.HTMLAttributes<HTMLElement>['className']> {
  if (variant === 'none') return 'ring-gray-300';
  if (variant === 'primary') {
    return 'bg-primary-600 hover:bg-primary-500 text-white ring-primary-500';
  }
  if (variant === 'success') {
    return 'bg-green-600 hover:bg-green-500 text-white ring-green-500';
  }
  if (variant === 'warning') {
    return 'bg-yellow-600 hover:bg-yellow-500 text-white ring-yellow-500';
  }
  if (variant === 'danger') {
    return 'bg-red-600 hover:bg-red-500 text-white ring-red-500';
  }
  return 'bg-white hover:bg-gray-50 text-gray-900 ring-gray-300';
}

function getSizeClasses(
  size: ButtonSize
): NonNullable<React.HTMLAttributes<HTMLElement>['className']> {
  if (size === 'lg') return 'px-3.5 py-2.5';
  return 'py-2 px-3';
}

const LoadingSpinner: React.FC = () => (
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
);

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: HeroIcon;
  endIcon?: HeroIcon;
};

export type ButtonProps = React.PropsWithChildren<
  BaseButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  }
>;

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
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
        'inline-flex items-center rounded-md text-sm font-semibold shadow-sm ring-1 ring-inset ',
        getColourClasses(variant),
        getSizeClasses(size),
        disabled || loading ? 'opacity-50 pointer-events-none' : '',
        buttonProps.className || ''
      )}>
      {StartIconComponent && (
        <StartIconComponent
          className='-ml-0.5 mr-1.5 h-5 w-5'
          aria-hidden='true'
        />
      )}
      {loading && <LoadingSpinner />}
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
  BaseButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled,
  loading,
  startIcon: StartIconComponent,
  endIcon: EndIconComponent,
  ...props
}) => {
  return (
    <a
      {...props}
      className={classNames(
        'inline-flex items-center rounded-md text-sm font-semibold shadow-sm ring-1 ring-inset',
        getColourClasses(variant),
        getSizeClasses(size),
        disabled || loading ? 'opacity-50 pointer-events-none' : '',
        props.className || ''
      )}>
      {StartIconComponent && !loading && (
        <StartIconComponent
          className='-ml-0.5 mr-1.5 h-5 w-5'
          aria-hidden='true'
        />
      )}
      {loading && <LoadingSpinner />}
      {children}
      {EndIconComponent && (
        <EndIconComponent
          className='-mr-0.5 ml-1.5 h-5 w-5'
          aria-hidden='true'
        />
      )}
    </a>
  );
};
