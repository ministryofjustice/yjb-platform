const path = require('node:path')

const WORKSPACE_ROOT = __dirname // always apps/frontend
const REPOSITORY_ROOT = path.resolve(WORKSPACE_ROOT, '../..')
const NODE_MODULES = path.resolve(REPOSITORY_ROOT, './node_modules')

module.exports = { WORKSPACE_ROOT, REPOSITORY_ROOT, NODE_MODULES }
