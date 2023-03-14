export const AUDIT_FIELDS = {
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
} as const;
