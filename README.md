# TGM Masters Timer
A ChatGPT fuelled "tool" to help run a masters-style TGM tournament. If you don't know what that means you probably don't need this.

## Usage
Go to [https://d4nin3u.github.io/masters-timer/](https://d4nin3u.github.io/masters-timer/).

For development, make sure you have [pnpm](https://pnpm.io/) and run `pnpm start` to build and watch for
changes, then `pnpm serve` to serve `docs/` locally at `http://localhost:3000` (ES modules can't load
over `file://`, so opening `docs/index.html` directly won't work).

`/docs` is the build output directory since that's what GitHub supports as a GitHub pages source dir.