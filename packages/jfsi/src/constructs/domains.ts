import { isProduction } from './stage.js';

type AppConfiguration = { stage: string; isDev: boolean };

/**
 * Generate the domain utils for the SST App
 * @param rootDomainName The root domain name for the SST App
 * @param defaultLocalhost The default localhost URL to use
 * @returns
 */
export const generateDomainUtils = (
  rootDomainName: string,
  defaultLocalhost: string = 'http://localhost:3000'
) => {
  /**
   * Get the app's domain name for the SST App
   * @param app The current SST App to get the URL for
   * @param subdomain The optional subdomain to use
   */
  const getWebDomain = (app: AppConfiguration, subdomain?: string) => {
    const root = isProduction(app.stage)
      ? rootDomainName
      : `${app.stage}.${rootDomainName}`;

    return subdomain ? `${subdomain}.${root}` : root;
  };

  /**
   * Get the app's URL for the SST App
   * @param app The current SST App, used to check the stage
   * @param subdomain The optional subdomain to use
   * @param localhost The optional localhost to use
   */
  const getWebUrl = (
    app: AppConfiguration,
    subdomain?: string,
    localhost?: string
  ) =>
    app.isDev
      ? localhost || defaultLocalhost
      : `https://${getWebDomain(app, subdomain)}`;

  /**
   * Get the API Domain for the SST App
   * @param app The current SST App to get the domain for
   */
  const getApiDomain = (app: AppConfiguration) => getWebDomain(app, 'api');

  /**
   * Get the API URL for the SST App
   * @param app The current SST App to get the URL for
   */
  const getApiUrl = (app: AppConfiguration) => `https://${getApiDomain(app)}`;
  return {
    getWebDomain,
    getWebUrl,
    getApiDomain,
    getApiUrl,
  };
};
