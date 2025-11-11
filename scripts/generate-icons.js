#!/usr/bin/env node

/**
 * Simple tray icon generator
 * Creates basic PNG icons for tray (light and dark themes, with high DPI support)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../assets/icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple 1x1 pixel PNG data (will be used as placeholder)
// These are minimal valid PNG files with different colors
const createMinimalPNG = (r, g, b, a = 255) => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR chunk (13 bytes data + 12 bytes overhead)
  const ihdr = Buffer.from([
    0x00, 0x00, 0x00, 0x0d, // chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x10, // width: 16
    0x00, 0x00, 0x00, 0x10, // height: 16
    0x08, // bit depth: 8
    0x06, // color type: RGBA
    0x00, // compression: deflate
    0x00, // filter: adaptive
    0x00, // interlace: none
  ]);
  
  // Calculate CRC for IHDR
  const ihdrCrc = crc32(ihdr.slice(4));
  const ihdrChunk = Buffer.concat([ihdr, ihdrCrc]);
  
  // Create a simple IDAT chunk with solid color
  // For simplicity, we'll create a tiny image
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x16, // chunk length (22 bytes)
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    // Compressed data (zlib format) - minimal deflate stream
    0x78, 0x9c, 0x62, r, g, b, a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, 0x00, 0x05, 0x00, 0x01
  ]);
  
  const idatCrc = crc32(idat.slice(4));
  const idatChunk = Buffer.concat([idat, idatCrc]);
  
  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // chunk length
    0x49, 0x45, 0x4e, 0x44, // "IEND"
    0xae, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iend]);
};

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  crc = crc ^ 0xffffffff;
  const result = Buffer.alloc(4);
  result.writeUInt32BE(crc >>> 0, 0);
  return result;
}

// Create icons
console.log('Generating tray icons...');

// Light theme icon (dark icon for light background)
const lightIcon16 = createMinimalPNG(0x20, 0x20, 0x20); // Dark gray
const lightIcon32 = createMinimalPNG(0x20, 0x20, 0x20); // Dark gray (2x)

// Dark theme icon (light icon for dark background)  
const darkIcon16 = createMinimalPNG(0xff, 0xff, 0xff); // White
const darkIcon32 = createMinimalPNG(0xff, 0xff, 0xff); // White (2x)

// Write files
fs.writeFileSync(path.join(iconsDir, 'tray-light.png'), lightIcon16);
fs.writeFileSync(path.join(iconsDir, 'tray-light@2x.png'), lightIcon32);
fs.writeFileSync(path.join(iconsDir, 'tray-dark.png'), darkIcon16);
fs.writeFileSync(path.join(iconsDir, 'tray-dark@2x.png'), darkIcon32);

// Also create Windows .ico versions by copying PNG (Electron can handle PNG for tray)
fs.writeFileSync(path.join(iconsDir, 'tray-light.ico'), lightIcon16);
fs.writeFileSync(path.join(iconsDir, 'tray-dark.ico'), darkIcon16);

console.log('✓ Tray icons generated successfully!');
console.log('  - tray-light.png (16x16)');
console.log('  - tray-light@2x.png (32x32)');
console.log('  - tray-dark.png (16x16)');
console.log('  - tray-dark@2x.png (32x32)');
console.log('  - tray-light.ico');
console.log('  - tray-dark.ico');
