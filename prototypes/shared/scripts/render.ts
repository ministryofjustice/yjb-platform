// Renders prototypes/shared/current-pages from example-data.json, in two steps:
//   1. Run each page's request through the app's real routes, with the API client stubbed to return the
//      scenario's captured apiOutput. The context each route passes to res.render is saved as JSON in
//      page-contexts/, then the real Nunjucks template is rendered with it.
//   2. Rewrite the HTML into a static flow: relative asset paths (copied into current-pages/assets),
//      links and GET forms mapped by example-data.json, no scripts, plus a prototype banner and index.html.
// run.sh builds shared-types and the frontend first, so dist/server/views and the compiled CSS exist.
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { AddressInfo } from 'net'
import express from 'express'
import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import nunjucksSetup from '../../../apps/frontend/server/utils/nunjucksSetup'
import setUpWebRequestParsing from '../../../apps/frontend/server/middleware/setupRequestParsing'
import routes from '../../../apps/frontend/server/routes'
import type { Services } from '../../../apps/frontend/server/services'
import DtoService from '../../../apps/frontend/server/services/dtoService'
import ExampleService from '../../../apps/frontend/server/services/exampleService'
import {
  CONTEXT_DIR,
  ExampleData,
  MANIFEST_FILE,
  OUT_DIR,
  PageSpec,
  REPO_ROOT,
  SOURCE_PATHS,
  findLinkHref,
  loadData,
} from './lib'

const FRONTEND_DIR = path.join(REPO_ROOT, 'apps/frontend')
const NODE_MODULES = path.join(REPO_ROOT, 'node_modules')

// the same directories, in the same order, that setUpStaticResources mounts at /assets
const ASSET_MOUNTS = [
  path.join(FRONTEND_DIR, 'dist/assets'),
  path.join(NODE_MODULES, 'govuk-frontend/dist/govuk/assets'),
  path.join(NODE_MODULES, 'govuk-frontend/dist'),
  path.join(NODE_MODULES, '@ministryofjustice/frontend/moj/assets'),
  path.join(NODE_MODULES, '@ministryofjustice/frontend'),
]

type Rendered = { view: string; context: Record<string, unknown> }

// ---------- step 1: render ----------

async function captureContexts(data: ExampleData): Promise<Map<string, Rendered>> {
  let currentScenario: string | undefined
  const stubApiClient = {
    calculateDtoSentence: async () => {
      const output = data.scenarios[currentScenario]?.apiOutput
      if (!output) {
        throw new Error(`Scenario "${currentScenario}" has no apiOutput - run prototype:capture first`)
      }
      return output
    },
  }

  const app = express()
  nunjucksSetup(app)
  app.use(setUpWebRequestParsing())
  // answer with what the route would have rendered, instead of rendering it
  app.use((_req, res, next) => {
    res.render = ((view: string, locals: Record<string, unknown>) => res.json({ view, locals })) as unknown as typeof res.render
    next()
  })
  app.use(
    routes({
      exampleService: new ExampleService(),
      dtoService: new DtoService(stubApiClient as never),
      yjbApiClient: stubApiClient,
    } as unknown as Services),
  )

  const { settings: _settings, ...appLocals } = app.locals
  const server = app.listen(0)
  const baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`
  const results = new Map<string, Rendered>()

  try {
    for (const page of data.pages) {
      const { request } = page
      let response: Response

      if ('followLink' in request) {
        const linked = results.get(request.followLink.page)
        if (!linked) {
          throw new Error(`${page.file}: followLink page ${request.followLink.page} must come earlier in pages`)
        }
        response = await fetch(baseUrl + findLinkHref(renderTemplate(linked), request.followLink.selector))
      } else if (request.method === 'POST') {
        currentScenario = request.scenario
        response = await fetch(baseUrl + request.path, {
          method: 'POST',
          body: new URLSearchParams(data.scenarios[request.scenario].formBody),
        })
      } else {
        response = await fetch(baseUrl + request.path)
      }

      if (!response.ok) {
        throw new Error(`${page.file}: route returned ${response.status} ${await response.text()}`)
      }
      const { view, locals } = await response.json()
      // a self-contained context: the app-wide locals plus what the route passed
      results.set(page.file, { view, context: { ...appLocals, ...locals } })
    }
  } finally {
    server.close()
  }

  return results
}

function renderTemplate({ view, context }: Rendered): string {
  return nunjucks.render(`${view}.njk`, context)
}

// ---------- step 2: rewrite into a static flow ----------

class AssetCopier {
  private readonly manifest: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(FRONTEND_DIR, 'dist/assets/manifest.json'), 'utf8'),
  )

  private readonly copied = new Set<string>()

  constructor(private readonly outDir: string) {}

  // copies the file an app URL like /assets/css/index.css serves, returning its path inside outDir
  copy(appUrl: string): string {
    const urlPath = appUrl.split(/[?#]/)[0]
    const relative = urlPath.replace(/^\/assets\//, '')
    // nunjucksSetup can't find the hashed-name manifest from here, so map /assets/css/index.css ourselves
    const servedPath = (this.manifest[urlPath] ?? urlPath).replace(/^\/assets\//, '')
    const source = ASSET_MOUNTS.map(dir => path.join(dir, servedPath)).find(file => fs.existsSync(file))
    if (!source) {
      throw new Error(`No asset found for ${appUrl}`)
    }

    const target = path.join(this.outDir, 'assets', relative)
    if (!this.copied.has(target)) {
      this.copied.add(target)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      if (target.endsWith('.css')) {
        fs.writeFileSync(target, this.rewriteCss(fs.readFileSync(source, 'utf8'), path.dirname(target)))
      } else {
        fs.copyFileSync(source, target)
      }
    }
    return path.join('assets', relative)
  }

  private rewriteCss(css: string, cssDir: string): string {
    return css
      .replace(/\/\*# sourceMappingURL=.*?\*\//g, '')
      .replace(/url\((["']?)(\/assets\/[^"')]+)\1\)/g, (_match, quote, url) => {
        const copiedTo = path.join(this.outDir, this.copy(url))
        // CSS masks (e.g. the footer crest) are CORS requests, which browsers block from file://,
        // so SVGs are inlined instead of linked
        if (copiedTo.endsWith('.svg')) {
          return `url("data:image/svg+xml;base64,${fs.readFileSync(copiedTo).toString('base64')}")`
        }
        return `url(${quote}${path.relative(cssDir, copiedTo)}${quote})`
      })
  }
}

function mapLink(href: string, links: Record<string, string>): string | undefined {
  if (links[href]) {
    return links[href]
  }
  const prefix = Object.keys(links).find(key => key.endsWith('*') && href.startsWith(key.slice(0, -1)))
  return prefix && links[prefix]
}

function toStaticPage(html: string, page: PageSpec, data: ExampleData, assets: AssetCopier): string {
  const $ = cheerio.load(html)
  const links = { ...data.globalLinks, ...page.links }
  const unmapped: string[] = []

  // prototypes have no JavaScript; removing the inline js-enabled script too keeps components in their no-JS state
  $('script').remove()
  // a web app manifest is pointless offline, and browsers refuse to load it from file://
  $('link[rel=manifest]').remove()
  $('.govuk-details__summary-text')
    .filter((_i, el) => $(el).text().trim() === 'Debug info')
    .closest('.govuk-grid-row')
    .remove()

  $('*').each((_i, el) => {
    if (!('attribs' in el)) {
      return
    }
    for (const attr of ['href', 'src', 'xlink:href']) {
      const value = el.attribs[attr]
      if (value?.startsWith('/assets/')) {
        el.attribs[attr] = assets.copy(value)
      } else if (el.name === 'a' && /^https?:\/\//.test(value ?? '')) {
        // links out to other sites (e.g. the GOV.UK footer's licence pages) stay as they are
      } else if (value && (value.startsWith('/') || /^[a-z]+:/i.test(value))) {
        const target = mapLink(value, links)
        if (target) {
          el.attribs[attr] = target
        } else {
          unmapped.push(value)
        }
      }
    }
  })

  $('form').each((_i, form) => {
    if (!page.formAction) {
      throw new Error(`${page.file} has a form but no formAction in example-data.json`)
    }
    $(form).attr('action', page.formAction).attr('method', 'get')
  })

  if (unmapped.length) {
    throw new Error(`${page.file}: no static target for ${unmapped.join(', ')} - add them to its links`)
  }

  $('header')
    .first()
    .after(
      `<div class="govuk-width-container"><div class="govuk-phase-banner"><p class="govuk-phase-banner__content">` +
        `<strong class="govuk-tag govuk-phase-banner__content__tag">Prototype</strong>` +
        `<span class="govuk-phase-banner__text">Current pages of the live service. ` +
        `<a class="govuk-link" href="index.html">See all screens</a></span></p></div></div>`,
    )

  return $.html()
}

function indexTemplate(data: ExampleData): string {
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const pageRows = data.pages
    .map(
      page =>
        `<li><a class="govuk-link" href="${page.file}">${escape(page.title)}</a>` +
        `<p class="govuk-hint govuk-!-margin-top-1">${escape(page.description)}</p></li>`,
    )
    .join('\n')
  const scenarioRows = Object.entries(data.scenarios)
    .map(([name, scenario]) => `<li><strong>${escape(name)}</strong>: ${escape(scenario.description)}</li>`)
    .join('\n')

  return `{% extends "partials/layout.njk" %}
{% set pageTitle = applicationName + " - Prototype: current pages" %}
{% set mainClasses = "govuk-body" %}
{% block content %}
  <h1 class="govuk-heading-l">Current pages</h1>
  <p>Static copies of the live service's pages, rendered from its real templates with example data, then linked into a clickable flow. Forms take you to the next page whatever you enter.</p>
  <h2 class="govuk-heading-m">Screens in flow order</h2>
  <ol class="govuk-list govuk-list--number">
${pageRows}
  </ol>
  <h2 class="govuk-heading-m">Example data</h2>
  <ul class="govuk-list govuk-list--bullet">
${scenarioRows}
  </ul>
{% endblock %}`
}

function sourceCommits(): Record<string, { commit: string; uncommittedChanges: boolean }> {
  const git = (args: string) => execSync(`git ${args}`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  return Object.fromEntries(
    SOURCE_PATHS.map(source => [
      source,
      {
        commit: git(`log -1 --format=%H -- ${source}`),
        uncommittedChanges: git(`status --porcelain -- ${source}`) !== '',
      },
    ]),
  )
}

async function main() {
  const data = loadData()
  const rendered = await captureContexts(data)

  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.rmSync(CONTEXT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(CONTEXT_DIR, { recursive: true })
  const assets = new AssetCopier(OUT_DIR)

  for (const page of data.pages) {
    const { view, context } = rendered.get(page.file)
    const contextFile = path.join(CONTEXT_DIR, page.file.replace(/\.html$/, '.json'))
    fs.writeFileSync(contextFile, `${JSON.stringify({ view, context }, null, 2)}\n`)

    // render from the saved JSON, so the context file is exactly what produced the page
    const html = renderTemplate(JSON.parse(fs.readFileSync(contextFile, 'utf8')))
    fs.writeFileSync(path.join(OUT_DIR, page.file), toStaticPage(html, page, data, assets))
    console.log(`rendered ${page.file} (${view})`)
  }

  const { context: anyContext } = rendered.get(data.pages[0].file)
  const indexHtml = nunjucks.renderString(indexTemplate(data), anyContext)
  const indexPage: PageSpec = { file: 'index.html', title: 'Index', description: '', request: null }
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), toStaticPage(indexHtml, indexPage, data, assets))
  console.log('rendered index.html')

  fs.writeFileSync(
    MANIFEST_FILE,
    `${JSON.stringify({ renderedAt: new Date().toISOString(), sources: sourceCommits() }, null, 2)}\n`,
  )
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
