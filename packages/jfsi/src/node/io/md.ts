import { readFileSync } from 'fs';
import frontmatter from 'frontmatter';

/**
 * Load the data from a markdown file including it's frontmatter.
 * @param filename The path to the markdown file
 * @returns
 */
export function loadDataFromMarkdown<TData extends any>(
  filename: string
): {
  content: string;
  data: TData;
} {
  const file = readFileSync(filename, 'utf-8');
  return frontmatter(file);
}
