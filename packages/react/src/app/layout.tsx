import React, { useState } from 'react';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { ProfileMenu } from './profile-menu';
import { Sidebar } from './sidebar';
import type { ImageProps, NavigationList } from './types';

type AppLayoutProps = {
  navigation: NavigationList;
  profileNavigation: NavigationList;
  /** The image to use for the company logo */
  company: ImageProps;
  /** The image to use for the users avatar */
  user: ImageProps;
};

/**
 * An application layout component for a dashboard. This component is
 * responsible for rendering the sidebar and the main content area.
 *
 * It requires the following layout in the HTML:
 *   ```
 *   <html class="h-full">
 *   <body class="h-full">
 *   ```
 *
 * Also requires the following Tailwind config updates:
 * ```
 * // tailwind.config.js
 * module.exports = {
 *   // ...
 *   plugins: [
 *     // ...
 *     require('@tailwindcss/forms'),
 *   ],
 * }
 * ```
 *
 * @returns
 */
export const AppLayout: React.FC<React.PropsWithChildren<AppLayoutProps>> = ({
  children,
  navigation,
  profileNavigation,
  company,
  user,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        company={company}
      />
      <div className='lg:pl-64'>
        <div className='mx-auto flex flex-col h-screen'>
          <div className='mx-auto w-full lg:max-w-4xl flex h-16 flex-shrink-0 border-b border-gray-200 bg-transparent'>
            {/* Sidebar open button */}
            <button
              type='button'
              className='border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden'
              onClick={() => setSidebarOpen(true)}>
              <span className='sr-only'>Open sidebar</span>
              <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
            </button>
            <div className='flex flex-1 justify-between px-4 lg:px-0'>
              <div className='flex flex-1'>
                {/* Empty div to push the menu out, can eventually add a search bar */}
              </div>
              <div className='ml-4 flex items-center lg:ml-6'>
                {/* Profile dropdown */}
                <ProfileMenu navigation={profileNavigation} avatar={user} />
              </div>
            </div>
          </div>

          <main className='flex-1 overflow-y-auto'>
            <div className='py-6 mx-auto w-full lg:max-w-4xl'>
              <div className='px-4 sm:px-6 lg:px-0'>
                <h1 className='text-2xl font-semibold text-gray-900'>
                  Dashboard
                </h1>
              </div>
              <div className='px-4 sm:px-6 lg:px-0'>
                {/* Content */}
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
