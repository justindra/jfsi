import type { Attribute } from 'electrodb';

export const AUDIT_FIELDS: Record<string, Attribute> = {
  createdAt: {
    type: 'string',
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  updatedAt: {
    type: 'string',
    watch: '*',
    set: () => new Date().toISOString(),
    readOnly: true,
  },
  createdBy: {
    type: 'string',
    readOnly: true,
  },
  updatedBy: {
    type: 'string',
    readOnly: true,
  },
};
