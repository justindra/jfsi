import { useState } from 'react';
import { AppLayoutProvider } from './context';
import { AppSidebar, AppSidebarProps } from './sidebar';
import { AppHeader } from './header';

type AppRootProps = React.PropsWithChildren<
  AppSidebarProps & {
    profileUrl?: string;
    title?: string;
  }
>;

/**
 * An application layout component for a dashboard. This component is
 * responsible for rendering the sidebar and the main content area.
 *
 * It requires the following layout in the HTML:
 *   ```
 *   <html class="h-full bg-gray-50">
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
export const AppRoot: React.FC<AppRootProps> = ({
  children,
  user,
  brand,
  navigation,
  subnavigation,
  profileUrl = '#',
  title = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppLayoutProvider value={{ sidebarOpen, setSidebarOpen }}>
      <div>
        <AppSidebar
          user={user}
          brand={brand}
          navigation={navigation}
          subnavigation={subnavigation}
          profileUrl={profileUrl}
        />
        <AppHeader title={title} user={user} profileUrl={profileUrl} />

        <main className='py-10 lg:pl-72'>
          <div className='px-4 sm:px-6 lg:px-8'>{children}</div>
        </main>
      </div>
    </AppLayoutProvider>
  );
};
