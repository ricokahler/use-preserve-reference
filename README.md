# usePreserveReference · [![Build Status](https://travis-ci.org/ricokahler/use-preserve-reference.svg?branch=master)](https://travis-ci.org/ricokahler/use-preserve-reference) [![Coverage Status](https://coveralls.io/repos/github/ricokahler/use-preserve-reference/badge.svg?branch=master)](https://coveralls.io/github/ricokahler/use-preserve-reference?branch=master)

> `usePreserveReference` is a hook that will return the previous value if it deeps equals the current value

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

## Things to note

### `object-hash` for comparisons

The current implementation of `usePreserveReference` uses `object-hash` to determine if the information within your reference changes.

⚠️ `object-hash` performs a full traversal of your object in order to compute a hash for it. If your object is _really_ large (like 500+ overall keys), think twice before wrapping with `usePreserveReference`

### `usePreserveReference` is only for reference types

⚠️ `usePreserveReference` is only necessary for objects and arrays. If the value you're trying to preserve is a value type (e.g. a string, number) then you don't need this hook.

## Errors

### Error code 1

You can't call `usePreserveReference` with functions

### Error code 2

You passed in a string to `usePreserveReference`. You don't need `usePreserveReference` for strings.

### Error code 3

You passed in a number to `usePreserveReference`. You don't need `usePreserveReference` for numbers.
