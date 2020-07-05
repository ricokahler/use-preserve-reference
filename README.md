# usePreserveReference · [![codecov](https://codecov.io/gh/ricokahler/use-preserve-reference/branch/master/graph/badge.svg)](https://codecov.io/gh/ricokahler/use-preserve-reference)

> `usePreserveReference` is a hook that will return the previous value if it deeps equals the current value

The deep equal is currently implemented using `object-hash`.

## Installation

```
npm install --save use-preserve-reference
```

## Usage

The usage is pretty straightforward, wrap your references (e.g. objects and arrays) with `usePreserveReference` and then this lib will only return a new reference if the information in your object/array changes.

```js
import React, { useState } from 'react';
import usePreserveReference from 'use-preserve-reference';

function Component() {
  const [count, setCount] = useState(0);
  const referenceCreatedDuringRender = ['foo', 'bar'];
  const preservedReference = usePreserveReference(referenceCreatedDuringRender);

  useEffect(() => {
    // changes every render
    console.log('reference 1 changed');
  }, [referenceCreatedDuringRender]);

  useEffect(() => {
    // only the first render
    console.log('reference 2 changed');
  }, [preservedReference]);

  return (
    <div>
      <button>Click to re-render {count}</button>
    </div>
  );
}
```

[CodeSandbox link](https://codesandbox.io/s/use-preserve-reference-demo-l4tfq?file=/src/App.js)

Notice how the preserved reference does not change.

## Things to note

### `JSON.stringify` for comparisons

The current implementation of `usePreserveReference` uses `JSON.stringify` to determine if the information within your reference changes.

⚠️ `JSON.stringify` performs a full traversal of your object in order to compute a hash for it. If your object is large, think twice before wrapping with `usePreserveReference`

You can override this hash function implement by providing a second parameter to `usePreserveReference`

```js
function Component({ foo }) {
  // You can optionally provide a second parameter to compute the hash used for
  // comparisons. The hash function takes in the input object and returns a
  // string. If the string matches then the previous reference will be returned.
  usePreserveReference(foo, (foo) => JSON.stringify(foo));
}
```

### `usePreserveReference` is only for reference types

⚠️ `usePreserveReference` is only necessary for objects and arrays. If the value you're trying to preserve is a value type (e.g. a string, number) then you don't need this hook.
