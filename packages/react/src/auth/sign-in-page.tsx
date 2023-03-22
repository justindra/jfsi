import GoogleLogo from './google-logo.png';
import { SignInButton } from './sign-in-button';
import { generateSignInUrl } from './utils';

export interface SignInPageProps {
  /** The logo of the app */
  logo: HTMLImageElement['src'];
  /** The alt of the logo */
  logoAlt: string;
  /** List of providers that you'd like to use */
  providers: ('google' | 'facebook' | 'jobber')[];
  /** The client id of your application */
  clientId?: string;
  /** The url to your auth service, e.g. https://auth.yourapp.com/authorize */
  authUrl: string;
  /** The frontend url to redirect to after login, e.g. https://yourapp.com/auth/callback */
  redirectUrl: string;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  logo,
  logoAlt,
  providers,
  clientId = 'local',
  authUrl,
  redirectUrl,
}) => {
  const providerLinks = providers.map((provider) => {
    // TODO: add fb and other social logins
    return {
      provider,
      logo: provider === 'google' ? GoogleLogo : '',
      label: provider === 'google' ? 'Sign in with Google' : '',
      link: generateSignInUrl(provider, authUrl, redirectUrl, clientId),
    };
  });
  return (
    <div className='flex min-h-full'>
      <div className='flex flex-1 flex-col justify-center text-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24'>
        <div className='mx-auto w-full max-w-sm lg:w-96'>
          <div>
            <img className='h-12 w-auto mx-auto' src={logo} alt={logoAlt} />
            <h2 className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
              Sign in to your account
            </h2>
          </div>

          <div className='mt-8'>
            <div>
              <div>
                {providerLinks.length > 1 && (
                  <p className='text-sm font-medium leading-6 text-gray-900'>
                    Using one of the following providers
                  </p>
                )}
                <div className='mt-4 gap-4 flex flex-col'>
                  {providerLinks.map((linkProps) => (
                    <SignInButton {...linkProps} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
