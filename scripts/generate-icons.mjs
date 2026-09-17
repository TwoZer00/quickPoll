import sharp from 'sharp'

const svgLight = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="8" y="6" width="7" height="20" rx="2" fill="#3949ab"/>
  <rect x="17" y="13" width="7" height="13" rx="2" fill="#3949ab"/>
</svg>`)

const svgDark = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#3949ab"/>
  <rect x="8" y="6" width="7" height="20" rx="2" fill="#ffffff"/>
  <rect x="17" y="13" width="7" height="13" rx="2" fill="#ffffff"/>
</svg>`)

const iconSize = Math.round(512 * 0.8)
const offset = Math.round(512 * 0.1)

async function generate (svg, suffix, bg) {
  await sharp(svg).resize(192, 192).png().toFile(`public/icons/icon-192-${suffix}.png`)
  console.log(`icon-192-${suffix}.png ✓`)

  await sharp(svg).resize(512, 512).png().toFile(`public/icons/icon-512-${suffix}.png`)
  console.log(`icon-512-${suffix}.png ✓`)

  const iconBuf = await sharp(svg).resize(iconSize, iconSize).png().toBuffer()
  await sharp({ create: { width: 512, height: 512, channels: 4, background: bg } })
    .composite([{ input: iconBuf, top: offset, left: offset }])
    .png()
    .toFile(`public/icons/icon-512-maskable-${suffix}.png`)
  console.log(`icon-512-maskable-${suffix}.png ✓`)
}

await generate(svgLight, 'light', { r: 0, g: 0, b: 0, alpha: 0 })
await generate(svgDark, 'dark', { r: 57, g: 73, b: 171, alpha: 255 })
