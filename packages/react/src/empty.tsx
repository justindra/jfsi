import type { HeroIcon } from './icons';

type EmptyProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  icon: HeroIcon;
};

export const Empty: React.FC<EmptyProps> = ({
  title,
  description,
  actions,
  icon: IconComponent,
}) => {
  return (
    <div className='text-center h-full flex items-center justify-center'>
      <div className='px-4 sm:px-0'>
        <IconComponent
          className='mx-auto h-12 w-12 text-gray-400'
          fill='none'
          stroke='currentColor'
        />
        <h3 className='mt-2 text-sm font-semibold text-gray-900'>{title}</h3>
        <p className='mt-1 text-sm text-gray-500 max-w-prose'>{description}</p>
        <div className='mt-6'>{actions}</div>
      </div>
    </div>
  );
};
