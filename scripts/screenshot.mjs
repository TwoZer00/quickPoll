import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') })

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

const BASE_URL = 'http://localhost:4173'
const POLL_ID = '068fa998-16bf-427e-8b7c-96f1ad695843'
const OPTION_ID = '13a89bcf-6c03-47fb-88f2-1536ef7bd4ee'
const PAGES = [
  { name: 'screenshot', path: '/en' },
  { name: 'create', path: '/en/create' },
  { name: 'poll', path: `/en/poll/${POLL_ID}`, wait: 2000 },
  { name: 'poll-results', path: `/en/poll/${POLL_ID}?resultsOnly=bars`, wait: 4000 },
  { name: 'terms', path: '/en/terms' },
  { name: 'privacy', path: '/en/privacy' }
]

async function castScreenshotVote () {
  const { data: { session } } = await supabase.auth.signInAnonymously()
  await supabase.from('votes').upsert(
    { poll_id: POLL_ID, option_id: OPTION_ID, user_id: session.user.id },
    { onConflict: 'poll_id,user_id' }
  )
  return session.user.id
}


function startPreview () {
  const proc = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'pipe', cwd: ROOT })
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
  await mkdir(join(ROOT, 'public/screenshots'), { recursive: true })

  console.log('Building...')
  const build = spawn('npm', ['run', 'build'], { shell: true, stdio: 'inherit', cwd: ROOT })
  await new Promise((resolve, reject) => {
    build.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`)))
  })

  console.log('Starting preview server...')
  const server = await startPreview()

  console.log('Casting screenshot vote...')
  await castScreenshotVote()
  const { data: { session } } = await supabase.auth.getSession()

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  await ctx.addInitScript(({ accessToken, refreshToken, supabaseUrl }) => {
    sessionStorage.setItem('app_loaded', '1')
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
    const key = `sb-${projectRef}-auth-token`
    const value = JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    })
    localStorage.setItem(key, value)
  }, { accessToken: session.access_token, refreshToken: session.refresh_token, supabaseUrl: process.env.VITE_SUPABASE_URL })
  try {
    for (const { name, path, wait, waitFor } of PAGES) {
      const page = await ctx.newPage()
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
      // if (waitFor) await page.waitForSelector(waitFor, { state: 'visible', timeout: 30000 })
      if (wait) await page.waitForTimeout(wait)
      await page.screenshot({ path: join(ROOT, `public/screenshots/${name}.png`) })
      console.log(`✓ public/screenshots/${name}.png`)
      await page.close()
    }
  } finally {
    await browser.close()
    spawn('taskkill', ['/F', '/T', '/PID', server.pid])
    console.log('Done!')
  }
}

run().catch((err) => { console.error(err); process.exit(1) })
