import React from 'react';
import { useAppLayout } from './context';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { User } from 'auth/utils';

type AppHeaderProps = {
  title: string;
  user: User;
  profileUrl: string;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  user,
  profileUrl,
}) => {
  const { setSidebarOpen } = useAppLayout();
  return (
    <div className='sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden'>
      <button
        type='button'
        className='-m-2.5 p-2.5 text-gray-700 lg:hidden'
        onClick={() => setSidebarOpen(true)}>
        <span className='sr-only'>Open sidebar</span>
        <Bars3Icon className='h-6 w-6' aria-hidden='true' />
      </button>
      <div className='flex-1 text-sm font-semibold leading-6 text-gray-900'>
        {title}
      </div>
      <a href={profileUrl}>
        <span className='sr-only'>Your profile</span>
        <img
          className='h-8 w-8 rounded-full bg-gray-50'
          src={user.avatarUrl}
          alt={`Avatar for ${user.name}`}
        />
      </a>
    </div>
  );
};
