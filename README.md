# tommy-web [![CircleCI](https://circleci.com/gh/tommy-the-runner/tommy-web/tree/master.svg?style=svg)](https://circleci.com/gh/tommy-the-runner/tommy-web/tree/master)

## Development

- `npm install`

In separate terminal windows:

- `npm run watch`
- `npm run start:dev`

## Building assets

Use `npm run build` to build assets.

The command is automatically executed on application start (`prestart` script in `package.json`).

The JS code is bundled using browserify and scss with node-sass.
