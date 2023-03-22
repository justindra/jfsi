import { ulid } from 'ulid';

/**
 * Generate an id for an entity. The id is a combination of the prefix and a
 * unique id. The unique id is generated using the ulid package.
 *
 * The prefix should be at most 4-characters long and should be unique for the
 * entity type. For example, the prefix for a user entity could be 'user' or
 * for an organization, it could be 'org'.
 *
 * @param prefix The prefix for the id
 * @returns
 */
export function generateId(prefix: string) {
  return `${prefix}|${ulid()}`;
}
