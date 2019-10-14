# usePreserveReference · [![Build Status](https://travis-ci.org/ricokahler/use-preserve-reference.svg?branch=master)](https://travis-ci.org/ricokahler/use-preserve-reference) [![Coverage Status](https://coveralls.io/repos/github/ricokahler/use-preserve-reference/badge.svg?branch=master)](https://coveralls.io/github/ricokahler/use-preserve-reference?branch=master)

> usePreserveReference is a hook that will return the previous value if it deeps equals the current value

The deep equal is currently implemented using `object-hash`.

## Installation

```
npm install --save use-preserve-reference
```

## Usage

The usage is pretty straightforward, wrap your references (e.g. objects and arrays) with `usePreserveReference` and then this lib will only return a new reference if the information in your object/array changes.

```js
function useExampleHook() {
  const value = useValue();
  const info = useInfo();

  const referenceCreatedDuringRender = [value, info];
  const preservedReference = usePreserveReference(referenceCreatedDuringRender);

  return preservedReference;
}
```

> The current implementation of `usePreserveReference` uses `object-hash` to determine if the information within your reference changes.
>
> ⚠️ `object-hash` performs a full traversal of your object in order to compute a hash for it. If your object is _really_ large (like 500+ overall keys), think twice before wrapping with `usePreserveReference`. ⚠️
