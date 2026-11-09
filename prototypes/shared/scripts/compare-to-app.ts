// Compares each page in current-pages with what the running app shows for the same request:
// the visible text of <main> and the state of every form field. Links are ignored, since render
// rewrites them on purpose. Needs the frontend and API running (npm run start:dev); set APP_URL if
// the frontend isn't on localhost:3000.
import fs from 'fs'
import path from 'path'
import { OUT_DIR, findLinkHref, loadData, mainContent } from './lib'

const appUrl = process.env.APP_URL ?? 'http://localhost:3000'

async function main() {
  const data = loadData()
  const liveHtml = new Map<string, string>()
  let failures = 0

  for (const page of data.pages) {
    const { request } = page
    let response: Response

    if ('followLink' in request) {
      const href = findLinkHref(liveHtml.get(request.followLink.page), request.followLink.selector)
      response = await fetch(appUrl + href)
    } else if (request.method === 'POST') {
      response = await fetch(appUrl + request.path, {
        method: 'POST',
        body: new URLSearchParams(data.scenarios[request.scenario].formBody),
      })
    } else {
      response = await fetch(appUrl + request.path)
    }
    const html = await response.text()
    liveHtml.set(page.file, html)

    const live = mainContent(html, page.compareIgnore)
    const rendered = mainContent(fs.readFileSync(path.join(OUT_DIR, page.file), 'utf8'), page.compareIgnore)

    if (live === rendered) {
      console.log(`✓ ${page.file} matches the live app`)
    } else {
      failures += 1
      const liveLines = live.split('\n')
      const renderedLines = rendered.split('\n')
      const at = liveLines.findIndex((line, i) => line !== renderedLines[i])
      console.error(`✗ ${page.file} differs from the live app`)
      console.error(`    live:     ${liveLines[at]?.slice(0, 300)}`)
      console.error(`    rendered: ${renderedLines[at]?.slice(0, 300)}`)
    }
  }

  if (failures) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
