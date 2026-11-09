// Checks that a prototype folder works from file:// and as a zip on its own:
//  - every href, src, form action and CSS url() points to a file inside the folder that exists
//  - no absolute (/...) or external (http:, //...) references, and no <script> tags; the one exception is
//    an <a> linking out to another website, which still works from a zip
//  - every #fragment link has a matching id on its page
//  - every HTML page can be reached from index.html
// Usage: run.sh check-links prototypes/<name>
import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import { REPO_ROOT } from './lib'

const folderArg = process.argv[2]
if (!folderArg) {
  console.error('Usage: run.sh check-links <prototype folder>')
  process.exit(1)
}
const root = path.resolve(REPO_ROOT, folderArg)
const errors: string[] = []
const linksFrom = new Map<string, Set<string>>()

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
}

// returns the file a reference points at, or undefined if it's broken (recording why)
function checkRef(ref: string, fromFile: string): string | undefined {
  const where = path.relative(root, fromFile)
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) {
    errors.push(`${where}: external reference ${ref}`)
    return undefined
  }
  if (ref.startsWith('/')) {
    errors.push(`${where}: absolute path ${ref}`)
    return undefined
  }
  const target = path.resolve(path.dirname(fromFile), decodeURI(ref.split(/[?#]/)[0]))
  if (!target.startsWith(root + path.sep)) {
    errors.push(`${where}: ${ref} points outside the prototype folder`)
    return undefined
  }
  if (!fs.existsSync(target)) {
    errors.push(`${where}: ${ref} does not exist`)
    return undefined
  }
  return target
}

const files = walk(root)

for (const file of files.filter(f => f.endsWith('.html'))) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'))
  const where = path.relative(root, file)
  const targets = new Set<string>()
  linksFrom.set(file, targets)

  if ($('script').length) {
    errors.push(`${where}: has ${$('script').length} <script> tag(s); prototypes don't use JavaScript`)
  }

  $('*').each((_i, el) => {
    if (!('attribs' in el)) {
      return
    }
    for (const attr of ['href', 'src', 'action', 'xlink:href']) {
      const ref = el.attribs[attr]
      if (ref === undefined || ref === '') {
        continue
      }
      if (ref.startsWith('#')) {
        if (ref.length > 1 && $(`[id="${ref.slice(1)}"]`).length === 0) {
          errors.push(`${where}: ${ref} has no matching id on the page`)
        }
        continue
      }
      if (el.name === 'a' && /^https?:\/\//.test(ref)) {
        continue
      }
      const target = checkRef(ref, file)
      if (target?.endsWith('.html')) {
        targets.add(target)
      }
    }
  })
}

for (const file of files.filter(f => f.endsWith('.css'))) {
  for (const [, , url] of fs.readFileSync(file, 'utf8').matchAll(/url\((["']?)([^"')]+)\1\)/g)) {
    if (!url.startsWith('data:') && !url.startsWith('#')) {
      checkRef(url, file)
    }
  }
}

const index = path.join(root, 'index.html')
if (!fs.existsSync(index)) {
  errors.push('index.html is missing')
} else {
  const reached = new Set([index])
  const queue = [index]
  while (queue.length) {
    for (const next of linksFrom.get(queue.shift()) ?? []) {
      if (!reached.has(next)) {
        reached.add(next)
        queue.push(next)
      }
    }
  }
  for (const page of linksFrom.keys()) {
    if (!reached.has(page)) {
      errors.push(`${path.relative(root, page)}: can't be reached from index.html`)
    }
  }
}

const pageCount = linksFrom.size
if (errors.length) {
  console.error(`✗ ${folderArg}: ${errors.length} problem(s) across ${pageCount} pages`)
  errors.forEach(error => console.error(`  - ${error}`))
  process.exit(1)
}
console.log(`✓ ${folderArg}: ${pageCount} pages, ${files.length} files, all references resolve inside the folder`)
