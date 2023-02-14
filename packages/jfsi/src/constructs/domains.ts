import type { App } from 'sst/constructs';
import { isProduction } from './stage.js';

export const generateDomainUtils = (rootDomainName: string) => {
  /**
   * Get the app's domain name for the SST App
   * @param app The current SST App to get the URL for
   */
  const getWebDomain = (app: App) =>
    isProduction(app.stage)
      ? `${rootDomainName}`
      : `${app.stage}.${rootDomainName}`;

  /**
   * Get the app's URL for the SST App
   * @param app The current SST App, used to check the stage
   * @param subdomain The optional subdomain to use
   */
  const getWebUrl = (app: App, subdomain?: string) =>
    app.local
      ? 'http://localhost:3000'
      : subdomain
      ? `https://${subdomain}.${getWebDomain(app)}`
      : `https://${getWebDomain(app)}`;

  /**
   * Get the API Domain for the SST App
   * @param app The current SST App to get the domain for
   */
  const getApiDomain = (app: App) =>
    isProduction(app.stage)
      ? `api.${rootDomainName}`
      : `api.${app.stage}.${rootDomainName}`;

  /**
   * Get the API URL for the SST App
   * @param app The current SST App to get the URL for
   */
  const getApiUrl = (app: App) => `https://${getApiDomain(app)}`;
  return {
    getWebDomain,
    getWebUrl,
    getApiDomain,
    getApiUrl,
  };
};
