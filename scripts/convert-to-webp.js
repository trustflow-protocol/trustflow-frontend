#!/usr/bin/env node
/**
 * Converts PNG/JPG assets in the assets/ directory to WebP.
 * Run with: node scripts/convert-to-webp.js
 */

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const ASSETS_DIR = path.join(__dirname, '..', 'assets')
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg']

async function convertToWebP(filePath) {
  const parsed = path.parse(filePath)
  const outPath = path.join(parsed.dir, parsed.name + '.webp')

  await sharp(filePath).webp({ quality: 85 }).toFile(outPath)

  const srcSize = fs.statSync(filePath).size
  const dstSize = fs.statSync(outPath).size
  const savings = (((srcSize - dstSize) / srcSize) * 100).toFixed(1)

  console.log(
    `  ${parsed.base} → ${parsed.name}.webp  (${(srcSize / 1024).toFixed(1)} KB → ${(dstSize / 1024).toFixed(1)} KB, ${savings}% smaller)`
  )
}

async function main() {
  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter(f => SUPPORTED_EXTS.includes(path.extname(f).toLowerCase()))
    .map(f => path.join(ASSETS_DIR, f))

  if (files.length === 0) {
    console.log('No PNG/JPG files found in assets/')
    return
  }

  console.log(`Converting ${files.length} file(s) to WebP…`)
  await Promise.all(files.map(convertToWebP))
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
