import {
  Reducer,
  useCallback,
  useReducer,
  useRef,
  ReducerState,
  Dispatch,
  ReducerAction,
} from 'react';

/**
 * A hook that adds a getState method to the useReducer hook from react.
 */
export const useEnhancedReducer = <R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I
): [ReducerState<R>, Dispatch<ReducerAction<R>>, () => I] => {
  const lastState = useRef(initializerArg);
  const getState = useCallback(() => lastState.current, []);
  return [
    ...useReducer(
      (
        state: Parameters<typeof reducer>[0],
        action: Parameters<typeof reducer>[1]
      ) => (lastState.current = reducer(state, action)),
      initializerArg
    ),
    getState,
  ];
};
