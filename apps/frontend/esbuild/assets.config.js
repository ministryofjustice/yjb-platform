const { copy } = require('esbuild-plugin-copy')
const { sassPlugin } = require('esbuild-sass-plugin')
const manifestPlugin = require('esbuild-plugin-manifest')
const { globSync } = require('node:fs')
const { buildNotificationPlugin, cleanPlugin } = require('./utils')
const { WORKSPACE_ROOT, REPOSITORY_ROOT, NODE_MODULES } = require('../workspace.config')

/**
 * Copy additional assets into distribution
 */
const getAdditionalAssetsConfig = buildConfig => ({
  outdir: buildConfig.assets.outDir,
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: buildConfig.assets.copy,
    }),
    buildNotificationPlugin('Assets (Additional)', buildConfig.isWatchMode),
  ],
})

/**
 * Build scss and javascript assets
 */
const getAssetsConfig = buildConfig => ({
  entryPoints: buildConfig.assets.entryPoints,
  outdir: buildConfig.assets.outDir,
  entryNames: '[ext]/[name].[hash]',
  minify: buildConfig.isProduction,
  sourcemap: !buildConfig.isProduction,
  platform: 'browser',
  target: 'es2018',
  external: ['/assets/*'],
  bundle: true,
  plugins: [
    cleanPlugin(globSync(buildConfig.assets.clear)),
    manifestPlugin({
      generate: entries =>
        Object.fromEntries(Object.entries(entries).map(paths => paths.map(p => p.replace(/^dist\//, '/')))),
    }),
    sassPlugin({
      quietDeps: true,
      loadPaths: [WORKSPACE_ROOT, REPOSITORY_ROOT, NODE_MODULES],
    }),
    buildNotificationPlugin('Assets', buildConfig.isWatchMode),
  ],
})

module.exports = { getAssetsConfig, getAdditionalAssetsConfig }
