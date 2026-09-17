import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { mkdir } from 'fs/promises'

const BASE_URL = 'http://localhost:4173'
const PAGES = [
  { name: 'screenshot', path: '/en' },
  { name: 'create', path: '/en/create' },
  { name: 'terms', path: '/en/terms' },
  { name: 'privacy', path: '/en/privacy' }
]

function startPreview () {
  const proc = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'pipe' })
  return new Promise((resolve) => {
    const onData = (data) => {
      if (data.toString().includes('localhost')) resolve(proc)
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    setTimeout(() => resolve(proc), 6000)
  })
}

async function run () {
  await mkdir('screenshots', { recursive: true })

  console.log('Building...')
  const build = spawn('npm', ['run', 'build'], { shell: true, stdio: 'inherit' })
  await new Promise((resolve, reject) => {
    build.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`)))
  })

  console.log('Starting preview server...')
  const server = await startPreview()

  const browser = await chromium.launch()
  try {
    for (const { name, path } of PAGES) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: `screenshots/${name}.png` })
      console.log(`✓ screenshots/${name}.png`)
      await page.close()
    }
  } finally {
    await browser.close()
    server.kill()
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
