import React from 'react';

export const AppPageTitle: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <h1 className='text-2xl font-semibold text-gray-900 mb-4'>{children}</h1>
  );
};
