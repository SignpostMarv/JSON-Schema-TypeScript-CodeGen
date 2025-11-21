[![Coverage Status](https://coveralls.io/repos/github/SignpostMarv/JSON-Schema-TypeScript-CodeGen/badge.svg?branch=main)](https://coveralls.io/github/SignpostMarv/JSON-Schema-TypeScript-CodeGen?branch=main)
[![Workflow Status](https://github.com/SignpostMarv/JSON-Schema-TypeScript-CodeGen/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/SignpostMarv/JSON-Schema-TypeScript-CodeGen/actions/workflows/node.js.yml?query=branch%3Amain)

# JSON Schema TypeScript CodeGen

From-scratch rewrite of the JSON Schema-based TypeScript Code Generation code originally implemented for [Docs.json.ts](https://github.com/satisfactory-dev/Docs.json.ts)

## FAQ

### Why a rewrite?

I felt I could do better.

- type discovery, data generation, and import/export management were spread over separate areas of the codebase in the original Docs.json.ts implementation (as a consequence of it being developed iteratively as needed).
- candidate classes now manage both type conversion _and_ data conversion.
- import/export management is now largely driven by the `$ref` type support.
    - Yes, `$ref` technically lies about it's internals, but attempting to retain the overall interface of the candidate classes while having `$ref` be fully honest about it's internals gave me a headache.

### What's it for?

Taking a JSON Schema with corresponding JSON & generating TypeScript bindings for said data.

### Why not use the raw JSON once it's passed validation with ajv?

Docs.json.ts is intended to work with JSON files that contain data that wasn't serialised with JSON.
Templated Strings in TypeScript also allow one to be less verbose in how one represents known values, e.g. typing something as that passes the regex `^foo.*(?:bar|baz)$` as more specific than just `string` but less verbose (i.e. `foo${string}${'bar'|'baz'}`) than 10s/100s/1000s of exact values.

## Install

`npm install --save-dev @signpostmarv/json-schema-typescript-codegen`

### Requirements

- Node >= 24, for `RegExp.escape()`
    - this allows the pattern support in the rewrite to be considerably more flexible than the original pattern support in Docs.json.ts.
- Node >= 23, for running TS files without needing to run a compile step.

### Notes

- ~~Currently distributed as a pure typescript package~~ it _would_ be distributed as a pure typescript package, were it not for [nodejs/node#57215](https://github.com/nodejs/node/issues/57215)
- Inherently tied to [Ajv](https://github.com/ajv-validator/ajv) due to the requirement for their custom keywords implementation.
- Does not currently have a complete implementation of standard JSON keywords
