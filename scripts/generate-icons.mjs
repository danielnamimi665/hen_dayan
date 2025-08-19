// Generate iOS/Android icons from public/henlogo.png (or fallback to public/next.svg)
// - Keeps 15% padding on each side (safe area) and centers the logo on a transparent canvas
// - Outputs PNGs into /public

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = path.resolve(process.cwd())
const publicDir = path.join(root, 'public')
const sourcePng = path.join(publicDir, 'henlogo.png')
const fallbackSvg = path.join(publicDir, 'next.svg')

async function ensureSourceBuffer() {
  if (fs.existsSync(sourcePng)) {
    return fs.promises.readFile(sourcePng)
  }
  return fs.promises.readFile(fallbackSvg)
}

async function generateIcon(size, srcBuffer) {
  const paddingFraction = 0.10 // 10% padding each side (significantly bigger, still safe)
  const inner = Math.round(size * (1 - paddingFraction * 2))

  // Resize source to fit inside inner box preserving aspect ratio
  const resized = sharp(srcBuffer).resize({
    width: inner,
    height: inner,
    fit: 'inside',
    withoutEnlargement: true,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  const { data: logoBuf, info } = await resized.toBuffer({ resolveWithObject: true })

  const left = Math.max(0, Math.floor((size - info.width) / 2))
  const top = Math.max(0, Math.floor((size - info.height) / 2))

  // Create transparent canvas and composite the resized logo at center
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })

  return await canvas
    .composite([{ input: logoBuf, left, top }])
    .png()
    .toBuffer()
}

async function main() {
  const srcBuffer = await ensureSourceBuffer()
  const outputs = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-167.png', size: 167 },
    { name: 'apple-touch-icon-152.png', size: 152 },
    { name: 'apple-touch-icon-120.png', size: 120 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ]

  for (const out of outputs) {
    const buf = await generateIcon(out.size, srcBuffer)
    await fs.promises.writeFile(path.join(publicDir, out.name), buf)
    console.log(`Generated ${out.name}`)
  }

  // Generate favicon.ico (16 and 32)
  const fav16 = await generateIcon(16, srcBuffer)
  const fav32 = await generateIcon(32, srcBuffer)
  const ico = await pngToIco([fav16, fav32])
  await fs.promises.writeFile(path.join(publicDir, 'favicon.ico'), ico)
  console.log('Generated favicon.ico')
}

main().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exit(0) // Do not fail install/build if generation fails
})


