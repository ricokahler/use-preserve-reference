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

  // see here...
  // https://github.com/facebook/react/issues/11098#issuecomment-370614347
  // ...for why these exist. not an ideal solution imo but it works
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  jest.spyOn(console, 'warn');
  console.warn.mockImplementation(() => {});
});

it('returns the previous value if the if the value is deep equal to the previous', async () => {
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

it("doesn't call object-hash if the memory references are the same", async () => {
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

it('throws if you give it a function', async () => {
  const gotError = new DeferredPromise();

  class ErrorBoundary extends React.Component {
    state = {};

    static getDerivedStateFromError() {
      return { hadError: true };
    }

    componentDidCatch(error) {
      gotError.resolve(error);
    }

    render() {
      if (this.state.hadError) return null;
      return this.props.children;
    }
  }

  function ExampleComponent() {
    usePreserveReference(() => {});

    return null;
  }

  await act(async () => {
    create(
      <ErrorBoundary>
        <ExampleComponent />
      </ErrorBoundary>,
    );

    await gotError;
  });

  const error = await gotError;
  expect(error).toMatchInlineSnapshot(
    `[Error: You can't call \`usePreserveReference\` with functions]`,
  );
});

it('warns if you give it a string or number in not production', async () => {
  const nodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'not prod';

  const done = new DeferredPromise();

  function ExampleComponent() {
    usePreserveReference('string');
    usePreserveReference(5);

    useEffect(() => {
      timer(0).then(() => done.resolve());
    }, []);

    return null;
  }

  await act(async () => {
    create(<ExampleComponent />);

    await done;
  });

  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn.mock.calls.map(args => args[0])).toMatchInlineSnapshot(`
    Array [
      "You passed in a string to \`usePreserveReference\`. You don't need \`usePreserveReference\` for strings",
      "You passed in a number to \`usePreserveReference\`. You don't need \`usePreserveReference\` for numbers",
    ]
  `);

  process.env.NODE_ENV = nodeEnv;
});

it("doesn't warn for strings and numbers in production mode", async () => {
  const nodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const done = new DeferredPromise();

  function ExampleComponent() {
    usePreserveReference('string');
    usePreserveReference(5);

    useEffect(() => {
      timer(0).then(() => done.resolve());
    }, []);

    return null;
  }

  await act(async () => {
    create(<ExampleComponent />);

    await done;
  });

  expect(console.warn).not.toHaveBeenCalled();

  process.env.NODE_ENV = nodeEnv;
});

it('works for undefined values', async () => {
  const done = new DeferredPromise();

  function ExampleComponent() {
    const result = usePreserveReference(undefined);

    useEffect(() => {
      timer(0).then(() => done.resolve(result));
    }, [result]);

    return null;
  }

  await act(async () => {
    create(<ExampleComponent />);

    await done;
  });

  const shouldBeUndefined = await done;
  expect(shouldBeUndefined).toBe(undefined);
});
