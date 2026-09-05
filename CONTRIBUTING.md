# Contributing to ORBCAFE UI

Thanks for helping improve ORBCAFE UI — bug reports, pull requests,
documentation fixes, and examples are all welcome.

## How to contribute

- **Issues**: open an issue at
  <https://github.com/SHENRUIYANG/orbcafe-ui/issues> with a minimal
  reproduction, the `orbcafe-ui` version, and your framework versions.
- **Pull requests**: keep changes focused, follow the existing code style,
  and run the checks before submitting:

  ```bash
  npm run release:check
  ```

- **Public API rule**: application-facing exports live at the package entry
  (`orbcafe-ui`). Do not add deep-import paths to the public contract
  without discussion.

## Contributor licensing declaration

ORBCAFE UI is distributed under a dual licensing model: the
[ORBCAFE UI Community License](LICENSE) plus separate
[commercial licenses](COMMERCIAL_LICENSE.md). For that model to work, the
project needs the right to distribute your contribution under both.

By submitting a contribution (code, documentation, examples, or other
materials) to this repository, you agree that:

1. You wrote the contribution yourself, or you otherwise have the right to
   submit it under these terms.
2. Your contribution is licensed to the project under the ORBCAFE UI
   Community License, Version 1.0 (inbound = outbound for community use).
3. You grant ORBCAFE a perpetual, worldwide, non-exclusive, royalty-free
   license — including the right to sublicense — to use, reproduce, modify,
   and distribute your contribution as part of ORBCAFE UI under the
   Community License **and** under ORBCAFE's commercial licenses.

You retain the copyright to your contribution. If you cannot agree to these
terms, please open an issue instead of a pull request so we can discuss.

## License questions

Not sure whether your intended use of ORBCAFE UI needs a commercial license?
Open an issue and mention "commercial license" — the short rule of thumb is:
build for yourself or your own organization, free; build software for
customers, commercial.
