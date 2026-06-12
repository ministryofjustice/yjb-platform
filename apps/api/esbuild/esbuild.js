const esbuild = require('esbuild')

const watch = process.argv.includes('--watch')

const ctx = esbuild.context({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: 'dist/server.js',
  sourcemap: true,
  external: ['express'],
})

ctx
  .then(async context => {
    if (watch) {
      await context.watch()
      // eslint-disable-next-line no-console
      console.log('Watching for changes...')
    } else {
      await context.rebuild()
      await context.dispose()
    }
  })
  .catch(() => process.exit(1))
