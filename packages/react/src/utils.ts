/**
 * This function is used to join class names together.
 * @param classes List of classes to join together.
 * @returns
 */
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
