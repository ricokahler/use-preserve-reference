import { useMemo } from 'react';
import objectHash from 'object-hash';

// I would've used Symbols but IE is still around
const undefinedPlaceholder = '__undefined__';
const neverCalculated = '__never calculated__';

// this is used to memoize the hash function
function memoize(fn) {
  let previousArg = neverCalculated;
  let previousValue = null;

  function memoizedFn(arg) {
    if (arg === previousArg) {
      return previousValue;
    }

    const nextValue = fn(arg);
    previousValue = nextValue;
    previousArg = arg;

    return nextValue;
  }

  return memoizedFn;
}

/**
 * Uses `object-hash` to return the previous value if unchanged.
 *
 * Also memoizes `object-hash` to prevent it from being called a bunch
 */
function usePreserveReference(value) {
  if (typeof value === 'function') {
    throw new Error("You can't call `usePreserveReference` with functions");
  }

  if (process.env.NODE_ENV !== 'production') {
    if (typeof value === 'string') {
      console.warn(
        "You passed in a string to `usePreserveReference`. You don't need `usePreserveReference` for strings",
      );
    }

    if (typeof value === 'number') {
      console.warn(
        "You passed in a number to `usePreserveReference`. You don't need `usePreserveReference` for numbers",
      );
    }
  }

  // note that this `hash` function is memoized so that it doesn't have to re-compute the hash if
  // the input reference is the same
  const hash = useMemo(() => {
    return memoize(objectHash);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [hash(value === undefined ? undefinedPlaceholder : value)]);
}

export default usePreserveReference;
