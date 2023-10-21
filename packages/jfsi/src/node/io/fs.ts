import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Get the current directory name from the import meta url as `__dirname` is
 * not available in ES modules.
 * @param importMetaUrl use `import.meta.url`
 * @returns
 */
export const getDirname = (importMetaUrl: string) => {
  return dirname(fileURLToPath(importMetaUrl));
};
