/**
 * macOS Notarization Script
 * 
 * This script handles notarization of the macOS app bundle.
 * Notarization is required for macOS 10.15+ (Catalina and later).
 * 
 * Prerequisites:
 * 1. Apple Developer Account
 * 2. App-specific password for notarization
 * 3. Environment variables set:
 *    - APPLE_ID: Your Apple ID email
 *    - APPLE_ID_PASSWORD: App-specific password
 *    - APPLE_TEAM_ID: Your team ID from Apple Developer account
 * 
 * Installation:
 * npm install --save-dev @electron/notarize
 * 
 * Configuration in package.json:
 * "build": {
 *   "afterSign": "scripts/notarize.js"
 * }
 */

const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization (not macOS)');
    return;
  }

  // Skip if required environment variables are not set
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.warn('⚠️  Skipping notarization: APPLE_ID, APPLE_ID_PASSWORD, or APPLE_TEAM_ID not set');
    console.warn('   Set these environment variables to enable notarization');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`📝 Notarizing ${appName}...`);
  console.log(`   App path: ${appPath}`);
  console.log(`   Apple ID: ${process.env.APPLE_ID}`);
  console.log(`   Team ID: ${process.env.APPLE_TEAM_ID}`);

  try {
    await notarize({
      appBundleId: 'com.yandextranslate.app',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    
    console.log('✅ Notarization complete');
  } catch (error) {
    console.error('❌ Notarization failed:', error);
    throw error;
  }
};
