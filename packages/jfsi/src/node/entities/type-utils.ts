export type NonNullablePromise<T extends (...args: any) => Promise<any>> =
  Promise<NonNullable<Awaited<ReturnType<T>>>>;
