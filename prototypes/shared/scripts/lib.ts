import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'

// run.sh sets REPO_ROOT, and runs scripts from apps/frontend so the frontend's workspace.config resolves
export const REPO_ROOT = process.env.REPO_ROOT ?? path.resolve(process.cwd(), '../..')
export const SHARED_DIR = path.join(REPO_ROOT, 'prototypes/shared')
export const DATA_FILE = path.join(SHARED_DIR, 'example-data.json')
export const OUT_DIR = path.join(SHARED_DIR, 'current-pages')
export const CONTEXT_DIR = path.join(SHARED_DIR, 'page-contexts')
export const MANIFEST_FILE = path.join(SHARED_DIR, 'render-manifest.json')

// everything a render depends on: the app, plus the render scripts and the example data they render
export const SOURCE_PATHS = [
  'apps/frontend',
  'apps/api',
  'packages/shared-types',
  'prototypes/shared/scripts',
  'prototypes/shared/example-data.json',
]

export type SourceState = {
  // the latest commit touching the source at render time, for showing what changed since
  commit: string
  // what decides staleness: commits change when outputs are committed, content doesn't
  contentHash: string
}

export type RenderManifest = {
  renderedAt: string
  sources: Record<string, Partial<SourceState>>
}

export function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
}

// a hash of the files under a path as they are on disk: committed, uncommitted and untracked files, but not
// git-ignored ones (so build output and node_modules don't count)
export function sourceHash(source: string): string {
  const files = git('ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', source)
    .split('\0')
    .filter(file => file && fs.existsSync(path.join(REPO_ROOT, file)))
    .sort()
  const blobs = files.length
    ? execFileSync('git', ['hash-object', '--stdin-paths'], { cwd: REPO_ROOT, input: files.join('\n'), encoding: 'utf8' })
        .trim()
        .split('\n')
    : []
  return createHash('sha1')
    .update(files.map((file, i) => `${blobs[i]} ${file}\n`).join(''))
    .digest('hex')
}

export function sourceState(): Record<string, SourceState> {
  return Object.fromEntries(
    SOURCE_PATHS.map(source => [
      source,
      { commit: git('log', '-1', '--format=%H', '--', source), contentHash: sourceHash(source) },
    ]),
  )
}

export type Scenario = {
  description: string
  // the fields exactly as a browser would POST them from the calculation form
  formBody: Record<string, string>
  // captured from the real API by capture-api-outputs.ts; absent for scenarios that fail validation
  apiOutput?: unknown
}

export type PageRequest =
  | { method: 'GET'; path: string }
  | { method: 'POST'; path: string; scenario: string }
  | { method: 'GET'; followLink: { page: string; selector: string } }

export type PageSpec = {
  file: string
  title: string
  description: string
  request: PageRequest
  // app href -> static file; a key ending in * matches by prefix
  links?: Record<string, string>
  // where every form on the page submits to (as a GET)
  formAction?: string
  // selectors whose content legitimately differs from the live app, e.g. the current time
  compareIgnore?: string[]
}

export type ExampleData = {
  scenarios: Record<string, Scenario>
  pages: PageSpec[]
  globalLinks: Record<string, string>
}

export function loadData(): ExampleData {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

export function saveData(data: ExampleData): void {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`)
}

export function findLinkHref(html: string, selector: string): string {
  const href = cheerio.load(html)(selector).first().attr('href')
  if (!href) {
    throw new Error(`No link matching "${selector}"`)
  }
  return href
}

// what a user sees in <main>: visible text plus the state of each form field, ignoring hrefs
export function mainContent(html: string, ignore: string[] = []): string {
  const $ = cheerio.load(html)
  const main = $('main')
  main.find(['script', '[hidden]', ...ignore].join(',')).remove()

  const fields = main
    .find('input, select, textarea')
    .toArray()
    .map(el => {
      const field = $(el)
      const checked = field.is(':checked') ? ' [checked]' : ''
      return `[field ${field.attr('name')}=${field.val() ?? ''}${checked}]`
    })

  return [main.text().replace(/\s+/g, ' ').trim(), ...fields].join('\n')
}
