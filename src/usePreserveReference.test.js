import React, { useState, useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import objectHash from 'object-hash';
import usePreserveReference from './usePreserveReference';

jest.mock('object-hash', () => jest.fn().mockImplementation(jest.requireActual('object-hash')));

class DeferredPromise {
  constructor() {
    this.state = 'pending';
    this._promise = new Promise((resolve, reject) => {
      this.resolve = value => {
        this.state = 'fulfilled';
        resolve(value);
      };
      this.reject = reason => {
        this.state = 'rejected';
        reject(reason);
      };
    });

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);
  }

  [Symbol.toStringTag] = 'Promise';
}

function timer(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

beforeEach(() => {
  objectHash.mockReset();
  objectHash.mockImplementation(jest.requireActual('object-hash'));
});

test('returns the previous value if the if the value is deep equal to the previous', async () => {
  const effectHandler = jest.fn();
  const preservedHandler = jest.fn();
  const done = new DeferredPromise();

  function ExampleComponent() {
    const [value, setValue] = useState({ foo: 'test' });
    const preservedValue = usePreserveReference(value);

    // on mount effect
    useEffect(() => {
      (async () => {
        // timer 0 makes it so that react won't batch this update
        await timer(0);
        // set the same value that is deep equal but not reference equal
        setValue({ foo: 'test' });

        await timer(0);
        // do an actual change that isn't deep equal
        setValue({ foo: 'actual change' });

        await timer(100);
        done.resolve();
      })();
    }, []);

    useEffect(() => {
      effectHandler(value);
    }, [value]);

    useEffect(() => {
      preservedHandler(preservedValue);
    }, [preservedValue]);

    return null;
  }

  await act(async () => {
    create(<ExampleComponent />);

    await done;
  });

  expect(effectHandler).toHaveBeenCalledTimes(3);
  expect(preservedHandler).toHaveBeenCalledTimes(2);
  expect(objectHash).toHaveBeenCalledTimes(3);
});

test("doesn't call object-hash if the memory references are the same", async () => {
  const staticValue = { foo: 'test' };
  const preserveEffectHandler = jest.fn();
  const done = new DeferredPromise();

  function ExampleComponent() {
    const [value, setValue] = useState({ staticValue });
    const preservedValue = usePreserveReference(value.staticValue);

    useEffect(() => {
      (async () => {
        await timer(0);
        setValue({ staticValue });

        await timer(0);
        setValue({ staticValue });

        await timer(100);
        done.resolve();
      })();
    }, []);

    useEffect(() => {
      preserveEffectHandler(preservedValue);
    }, [preservedValue]);

    return null;
  }

  await act(async () => {
    create(<ExampleComponent />);
    await done;
  });

  expect(objectHash).toHaveBeenCalledTimes(1);
  expect(preserveEffectHandler).toHaveBeenCalledTimes(1);
});
