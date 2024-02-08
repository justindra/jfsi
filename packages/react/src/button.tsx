import React from 'react';
import type { HeroIcon } from './icons';
import { LoadingSpinner } from './loading';
import { classNames } from './utils';

type ButtonVariant =
  | 'primary'
  | 'default'
  | 'none'
  | 'success'
  | 'danger'
  | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

export function getColourClasses(
  variant: ButtonVariant,
  dark: boolean
): NonNullable<React.HTMLAttributes<HTMLElement>['className']> {
  let className: string = '';
  if (variant === 'none') {
    if (dark) {
      className = 'bg-transparent text-gray-50 hover:text-gray-300';
    }
    className = 'bg-transparent text-gray-900 ring-gray-300';
  } else if (variant === 'primary') {
    className =
      '!bg-primary-600 hover:!bg-primary-500 text-white ring-primary-500';
  } else if (variant === 'success') {
    className = '!bg-green-600 hover:!bg-green-500 text-white ring-green-500';
  } else if (variant === 'warning') {
    className =
      '!bg-yellow-600 hover:!bg-yellow-500 text-white ring-yellow-500';
  } else if (variant === 'danger') {
    className = '!bg-red-600 hover:!bg-red-500 text-white ring-red-500';
  } else {
    className = 'bg-white hover:bg-gray-50 text-gray-900 ring-gray-300';
  }

  return classNames(className, dark ? '' : 'ring-1 ring-inset shadow-sm');
}

export function getSizeClasses(
  size: ButtonSize
): NonNullable<React.HTMLAttributes<HTMLElement>['className']> {
  if (size === 'lg') return 'px-3.5 py-2.5 text-base';
  return 'py-2 px-3 text-sm';
}

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  dark?: boolean;
  startIcon?: HeroIcon;
  endIcon?: HeroIcon;
};

export type ButtonProps = React.PropsWithChildren<
  BaseButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    as?: React.ElementType | React.FC;
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
  dark = false,
  startIcon: StartIconComponent,
  endIcon: EndIconComponent,
  as: Component = 'button',
}) => {
  return (
    <Component
      type='button'
      {...buttonProps}
      onClick={onClick}
      className={classNames(
        'inline-flex items-center rounded-md font-semibold',
        getColourClasses(variant, dark),
        getSizeClasses(size),
        disabled || loading ? 'opacity-50 pointer-events-none' : '',
        buttonProps.className || ''
      )}>
      {!loading && StartIconComponent && (
        <StartIconComponent
          className={classNames('h-5 w-5', !!children ? '-ml-0.5 mr-1.5' : '')}
          aria-hidden='true'
        />
      )}
      {loading && <LoadingSpinner className='-ml-1 mr-3 h-5 w-5' />}
      {children}
      {EndIconComponent && (
        <EndIconComponent
          className={classNames('h-5 w-5', !!children ? '-mr-0.5 ml-1.5' : '')}
          aria-hidden='true'
        />
      )}
    </Component>
  );
};

type LinkButtonProps = React.PropsWithChildren<
  BaseButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export const LinkButton: React.FC<LinkButtonProps> = ({ ...props }) => {
  return <Button as='a' {...props} />;
};
