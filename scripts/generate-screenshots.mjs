import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const DEV_URL = 'http://localhost:5173'
const POLL_ID = '068fa998-16bf-427e-8b7c-96f1ad695843'
const OUT = 'public/screenshots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'en-US' })
const page = await ctx.newPage()

// Saltar el spinner de carga inicial
await page.addInitScript(() => sessionStorage.setItem('app_loaded', '1'))

await page.goto(`${DEV_URL}/en/create`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/screenshot-create.png` })
console.log('screenshot-create.png ✓')

await page.goto(`${DEV_URL}/en/poll/${POLL_ID}?preview=1&resultsOnly=bars`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.screenshot({ path: `${OUT}/screenshot-results.png` })
console.log('screenshot-results.png ✓')

await browser.close()
