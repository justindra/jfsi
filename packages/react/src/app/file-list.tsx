import { PaperClipIcon } from '@heroicons/react/20/solid';

type FileListProps = {
  files: {
    id?: string;
    name: string;
    size?: string;
    action?: {
      label: string;
      href: string;
    };
  }[];
};

export const FileList: React.FC<FileListProps> = ({ files }) => {
  return (
    <ul
      role='list'
      className='divide-y divide-gray-100 dark:divide-white/10 rounded-md border border-gray-200 dark:border-white/20'>
      {files.map((file) => (
        <li
          key={file.id || file.name}
          className='flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6'>
          <div className='flex w-0 flex-1 items-center'>
            <PaperClipIcon
              className='h-5 w-5 flex-shrink-0 text-gray-400'
              aria-hidden='true'
            />
            <div className='ml-4 flex min-w-0 flex-1 gap-2'>
              <span className='truncate font-medium'>{file.name}</span>
              <span className='flex-shrink-0 text-gray-400'>{file.size}</span>
            </div>
          </div>
          {file.action && (
            <div className='ml-4 flex-shrink-0'>
              <a
                href={file.action.href}
                className='font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300'>
                {file.action.label}
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
