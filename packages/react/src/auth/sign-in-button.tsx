type SignInButtonProps = {
  provider: string;
  label: string;
  link: string;
  logo?: HTMLImageElement['src'];
};

export const SignInButton: React.FC<
  React.PropsWithChildren<SignInButtonProps>
> = ({ provider, label, link, logo }) => {
  return (
    <a
      href={link}
      className='flex w-full justify-center items-center rounded-md bg-white py-2 px-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'>
      {logo && (
        <img
          src={logo}
          alt={`${provider} Logo`}
          className='h-5 w-5 inline-block mr-4'
        />
      )}
      <span className='font-medium text-gray-800'>{label}</span>
    </a>
  );
};
