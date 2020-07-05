import { useMemo } from 'react';
import usePull from 'use-pull';
import hashFn from './hash-fn';

// I would've used Symbols but IE is still around
const undefinedPlaceholder = '__undefined__';
const neverCalculated = '__never calculated__';

/**
 * This is used to memoize the hash function so that if the references are
 * actually the same, the hash function will not be ran.
 */
function memoize<T>(fn: (t: T) => any): (t: T) => any {
  let previousArg: T | typeof neverCalculated = neverCalculated;
  let previousValue: string | null = null;

  function memoizedFn(arg: T) {
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

type HashFn = (obj: any) => string;

/**
 * Uses `object-hash` to return the previous value if unchanged.
 *
 * Also memoizes `object-hash` to prevent it from being called a bunch
 */
function usePreserveReference<T>(value: T, hash: HashFn = hashFn): T {
  if (typeof value === 'function') {
    throw new Error("You can't call `usePreserveReference` with functions.");
  }

  const getHash = usePull(hash);

  // @ts-ignore
  if (process.env.NODE_ENV !== 'production') {
    if (typeof value === 'string' || typeof value === 'number') {
      console.warn(
        `You passed in a ${typeof value} to \`usePreserveReference\`. You don't need \`usePreserveReference\` for ${typeof value}s.`,
      );
    }
  }

  // note that this `hash` function is memoized so that it doesn't have to re-compute the hash if
  // the input reference is the same
  const memoizedHash = useMemo(() => {
    const hash = getHash();
    return memoize(hash);
  }, [getHash]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [memoizedHash(value === undefined ? undefinedPlaceholder : value)]);
}

export default usePreserveReference;
