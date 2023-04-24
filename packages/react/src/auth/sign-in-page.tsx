import { AlertWarning } from '../alerts';
import FacebookLogo from './facebook-logo.png';
import GoogleLogo from './google-logo.png';
import { SignInButton } from './sign-in-button';
import { IS_IN_APP, generateSignInUrl, inApp } from './sign-in-utils';

type Provider = 'google' | 'facebook' | 'jobber';

const LOGO_AND_LABELS: Record<Provider, { logo: any; label: string }> = {
  google: {
    logo: GoogleLogo,
    label: 'Sign in with Google',
  },
  facebook: {
    logo: FacebookLogo,
    label: 'Sign in with Facebook',
  },
  jobber: {
    logo: '',
    label: 'Sign in with Jobber',
  },
};

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
    const { logo, label } = LOGO_AND_LABELS[provider] || {
      logo: '',
      label: `Sign in with ${provider}`,
    };
    return {
      provider,
      logo,
      label,
      link: generateSignInUrl(provider, authUrl, redirectUrl, clientId),
    };
  });
  const isInWebview = IS_IN_APP;

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
                    <SignInButton key={linkProps.provider} {...linkProps} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {isInWebview && (
            <div className='mt-8'>
              <AlertWarning
                title='In-app browser detected'
                message={
                  <>
                    Looks like you are wanting to sign-in using an in-app
                    browser: {inApp.browser}. Please note that{' '}
                    <strong>Sign in with Google</strong> may not work properly.
                    If you'd like to use Google, please open{' '}
                    <a
                      href={window.location.href}
                      target='_blank'
                      className='whitespace-nowrap underline underline-offset-1'>
                      {window.location.href}
                    </a>{' '}
                    in your device's browser.
                  </>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
