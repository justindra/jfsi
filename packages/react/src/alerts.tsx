import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { Button, ButtonProps } from './button';
import { HeroIcon } from './icons';
import { classNames } from './utils';

type AlertType = 'success' | 'warning' | 'error' | 'info' | 'default';

type ClassColour = NonNullable<
  React.HtmlHTMLAttributes<HTMLDivElement>['className']
>;

function getColours(type: AlertType): {
  icon: HeroIcon;
  bgColour: ClassColour;
  iconColour: ClassColour;
  titleColour: ClassColour;
  messageColour: ClassColour;
  buttonVariant: NonNullable<ButtonProps['variant']>;
} {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircleIcon as HeroIcon,
        iconColour: 'text-green-400',
        titleColour: 'text-green-800',
        messageColour: 'text-green-700',
        bgColour: 'bg-green-50',
        buttonVariant: 'success',
      };
    case 'warning':
      return {
        icon: ExclamationTriangleIcon as HeroIcon,
        iconColour: 'text-yellow-400',
        titleColour: 'text-yellow-800',
        messageColour: 'text-yellow-700',
        bgColour: 'bg-yellow-50',
        buttonVariant: 'warning',
      };
    case 'error':
      return {
        icon: XCircleIcon as HeroIcon,
        iconColour: 'text-red-400',
        titleColour: 'text-red-800',
        messageColour: 'text-red-700',
        bgColour: 'bg-red-50',
        buttonVariant: 'danger',
      };
    case 'info':
      return {
        icon: InformationCircleIcon as HeroIcon,
        iconColour: 'text-blue-400',
        titleColour: 'text-blue-800',
        messageColour: 'text-blue-700',
        bgColour: 'bg-blue-50',
        buttonVariant: 'info',
      };
    default:
      return {
        icon: InformationCircleIcon as HeroIcon,
        iconColour: 'text-primary-400',
        titleColour: 'text-primary-800',
        messageColour: 'text-primary-700',
        bgColour: 'bg-primary-50',
        buttonVariant: 'primary',
      };
  }
}

export const Alert: React.FC<{
  title: React.ReactNode;
  message: React.ReactNode;
  type: AlertType;
  action?: ButtonProps;
}> = ({ title, message, type, action }) => {
  const colours = useMemo(() => getColours(type), [type]);

  return (
    <div className={classNames('rounded-md p-4 text-left', colours.bgColour)}>
      <div className='flex'>
        <div className='flex-shrink-0'>
          <colours.icon
            className={classNames('h-5 w-5', colours.iconColour)}
            aria-hidden='true'
          />
        </div>
        <div className='ml-3'>
          <h3
            className={classNames('text-sm font-medium', colours.titleColour)}>
            {title}
          </h3>
          <div className={classNames('mt-2 text-sm', colours.messageColour)}>
            {message}
          </div>
          {action && (
            <div className='mt-4'>
              <div className='-mx-2 -my-1.5 flex'>
                <Button {...action} variant={colours.buttonVariant}></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @deprecated Use `<Alert type='warning' />` instead.
 */
export const AlertWarning: React.FC<{
  title: React.ReactNode;
  message: React.ReactNode;
}> = ({ title, message }) => {
  return <Alert title={title} message={message} type='warning' />;
};
