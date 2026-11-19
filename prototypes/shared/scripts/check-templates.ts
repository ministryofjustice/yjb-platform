// Checks a prototype's Nunjucks templates against its static pages, so the two can't drift apart.
//
// A prototype's templates/ folder mirrors apps/frontend/server/views: pages/ and partials/ hold new or changed
// templates, and contexts/<page>.json says which view renders each static page and with what data:
//   { "view": "pages/caseload", "context": { ... } }
// Each view is rendered the way the app renders it (the prototype's templates first, then the app's own views,
// GOV.UK Frontend and MOJ Frontend), with the app's locals and filters. The result's <body> is compared with the
// static page's <body> element by element: tags, attributes and text. Attributes that the static flow rewrites
// on purpose (href, action, method, src) are ignored, as are scripts, [hidden] elements and the prototype banner.
// Static pages with no context file are listed, not failed: they're unchanged app pages, or pages to template.
// Usage: run.sh check-templates prototypes/<name>
import fs from 'fs'
import path from 'path'
import express from 'express'
import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'
import nunjucksSetup from '../../../apps/frontend/server/utils/nunjucksSetup'
import { initialiseName } from '../../../apps/frontend/server/utils/utils'
import { REPO_ROOT } from './lib'

const IGNORED_ATTRIBUTES = new Set(['href', 'action', 'method', 'src', 'xlink:href'])

const folderArg = process.argv[2]
if (!folderArg) {
  console.error('Usage: run.sh check-templates <prototype folder>')
  process.exit(1)
}
const root = path.resolve(REPO_ROOT, folderArg)
const templatesDir = path.join(root, 'templates')
const contextsDir = path.join(templatesDir, 'contexts')

// The prototype's templates sit on top of the app's views, as if they'd been copied in. Nunjucks resolves a
// relative include like "./header.njk" to a full path next to the including file; this turns it back into a name
// inside its search root, so it's looked up in every root in order and falls back to the app's own file.
class OverlayLoader extends nunjucks.FileSystemLoader {
  constructor(private readonly roots: string[]) {
    super(roots)
  }

  resolve(from: string, to: string): string {
    const full = path.resolve(path.dirname(from), to)
    const root = this.roots.find(dir => full.startsWith(dir + path.sep))
    return root ? path.relative(root, full) : full
  }
}

// one line per element or text run, so a mismatch can be reported where it happens
function canonical(html: string, isStatic: boolean): string[] {
  const $ = cheerio.load(html)
  // the static render drops hidden debug blocks, and neither side shows them
  $('script, [hidden]').remove()
  if (isStatic) {
    $('.govuk-phase-banner__content__tag')
      .filter((_i, el) => $(el).text().trim() === 'Prototype')
      .closest('.govuk-width-container')
      .remove()
  }
  const lines: string[] = []
  const walk = (node: AnyNode, depth: number) => {
    if (node.type === 'text') {
      const text = node.data.replace(/\s+/g, ' ').trim()
      if (text) {
        lines.push(`${'  '.repeat(depth)}${text}`)
      }
      return
    }
    if (node.type !== 'tag') {
      return
    }
    const attributes = Object.entries(node.attribs)
      .filter(([name]) => !IGNORED_ATTRIBUTES.has(name))
      .map(([name, value]) => {
        const normalised =
          name === 'class' ? [...new Set(value.split(/\s+/).filter(Boolean))].sort().join(' ') : value.trim()
        return `${name}="${normalised}"`
      })
      .sort()
    lines.push(`${'  '.repeat(depth)}<${[node.name, ...attributes].join(' ')}>`)
    node.children.forEach(child => walk(child, depth + 1))
  }
  $('body')
    .contents()
    .each((_i, node) => walk(node, 0))
  return lines
}

function main() {
  if (!fs.existsSync(contextsDir)) {
    console.error(`✗ ${folderArg}: no templates/contexts folder`)
    process.exit(1)
  }

  // the app's own locals (applicationName and so on), as every route render gets them
  const app = express()
  nunjucksSetup(app)
  const { settings: _settings, ...appLocals } = app.locals

  const env = new nunjucks.Environment(
    new OverlayLoader([
      templatesDir,
      path.join(REPO_ROOT, 'apps/frontend/server/views'),
      path.join(REPO_ROOT, 'node_modules/govuk-frontend/dist'),
      path.join(REPO_ROOT, 'node_modules/@ministryofjustice/frontend'),
    ]),
    { autoescape: true },
  )
  env.addFilter('initialiseName', initialiseName)
  env.addFilter('assetMap', (url: string) => url)

  const contextFiles = fs
    .readdirSync(contextsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
  let failures = 0

  for (const contextFile of contextFiles) {
    const page = contextFile.replace(/\.json$/, '.html')
    const staticFile = path.join(root, page)
    if (!fs.existsSync(staticFile)) {
      failures += 1
      console.error(`✗ contexts/${contextFile}: there's no ${page} for it to match`)
      continue
    }
    const { view, context } = JSON.parse(fs.readFileSync(path.join(contextsDir, contextFile), 'utf8'))

    let rendered: string
    try {
      rendered = env.render(`${view}.njk`, { ...appLocals, ...context })
    } catch (error) {
      failures += 1
      console.error(`✗ ${page}: ${view}.njk failed to render: ${(error as Error).message}`)
      continue
    }

    const fromTemplate = canonical(rendered, false)
    const fromStatic = canonical(fs.readFileSync(staticFile, 'utf8'), true)
    const at = fromTemplate.findIndex((line, i) => line !== fromStatic[i])
    if (at === -1 && fromTemplate.length === fromStatic.length) {
      console.log(`✓ ${page} matches ${view}.njk`)
      continue
    }

    failures += 1
    const where = at === -1 ? Math.min(fromTemplate.length, fromStatic.length) : at
    console.error(`✗ ${page} differs from ${view}.njk at line ${where + 1} of the canonical body:`)
    for (let i = Math.max(0, where - 3); i < where; i += 1) {
      console.error(`      ${fromStatic[i]}`)
    }
    console.error(`    template: ${fromTemplate[where] ?? '(ends)'}`)
    console.error(`    static:   ${fromStatic[where] ?? '(ends)'}`)
  }

  const templated = new Set(contextFiles.map(f => f.replace(/\.json$/, '.html')))
  const untemplated = fs.readdirSync(root).filter(f => f.endsWith('.html') && f !== 'index.html' && !templated.has(f))
  if (untemplated.length) {
    console.log(`No template (unchanged app pages, or still to template): ${untemplated.join(', ')}`)
  }

  if (failures) {
    console.error(`✗ ${folderArg}: ${failures} page(s) don't match their templates`)
    process.exit(1)
  }
  console.log(`✓ ${folderArg}: ${contextFiles.length} page(s) match their templates`)
}

main()
