// Reports whether shared/current-pages is out of date: for each source a render depends on, compares the content
// hash in render-manifest.json with the files as they are now. Informational only; always exits 0.
// The /prototype skill runs this first and asks before re-rendering.
import fs from 'fs'
import { MANIFEST_FILE, OUT_DIR, RenderManifest, SOURCE_PATHS, git, sourceHash } from './lib'

function main() {
  if (!fs.existsSync(MANIFEST_FILE) || !fs.existsSync(OUT_DIR)) {
    console.log('current-pages has never been rendered. Re-render suggested.')
    return
  }

  const manifest: RenderManifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
  console.log(`Last rendered ${manifest.renderedAt}`)
  let stale = 0

  for (const source of SOURCE_PATHS) {
    const recorded = manifest.sources[source]
    let status: string

    if (!recorded) {
      status = 'new source since the last render'
    } else if (!recorded.contentHash) {
      status = 'no content hash recorded'
    } else if (recorded.contentHash === sourceHash(source)) {
      console.log(`- ${source}: unchanged`)
      continue
    } else {
      status = 'changed'
    }

    stale += 1
    console.log(`- ${source}: ${status}`)
    if (recorded?.commit) {
      const log = git('log', '--oneline', `${recorded.commit}..HEAD`, '--', source)
      if (log) {
        console.log(log.replace(/^/gm, '    '))
      }
    }
    if (git('status', '--porcelain', '--', source)) {
      console.log('    (has uncommitted changes)')
    }
  }

  console.log(
    stale
      ? `${stale} source(s) differ from the last render. Re-render suggested.`
      : 'current-pages is up to date.',
  )
}

main()
