# Auto-Updates Documentation

## Overview

This application uses `electron-updater` and `electron-builder` to provide seamless automatic updates for Windows, macOS, and Linux. Updates can be checked automatically on startup, manually triggered from the settings or tray menu, and are delivered through GitHub Releases.

## Table of Contents

1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [Publishing Updates](#publishing-updates)
4. [Code Signing](#code-signing)
5. [Testing Updates](#testing-updates)
6. [User Experience](#user-experience)
7. [Troubleshooting](#troubleshooting)

## Architecture

### Components

**Main Process (`src/main/services/updater.ts`)**
- Singleton service managing all update operations
- Handles update checking, downloading, and installation
- Tracks skipped versions to respect user preferences
- Emits events to renderer processes for UI updates

**Renderer Process**
- `UpdatesSettings.tsx` - Settings UI for manual checks and configuration
- Real-time progress updates during download
- User-friendly notifications for all update states

**IPC Communication**
- `updater:check` - Check for updates
- `updater:download` - Start download
- `updater:quit-and-install` - Install and restart
- `updater:skip-version` - Skip a specific version
- Events for all update states (checking, available, progress, downloaded, error)

### Update Flow

```
1. App starts → Check for updates (after 5s delay, production only)
2. Update available → Notify user
3. User chooses: Download, Skip, or Ignore
4. Download starts → Show progress
5. Download complete → Prompt to install
6. Install → Quit and restart with new version
```

## Configuration

### electron-builder Configuration

The app is configured in `package.json`:

```json
{
  "build": {
    "appId": "com.yandextranslate.app",
    "productName": "Yandex Translate",
    "publish": {
      "provider": "github",
      "owner": "your-github-username",
      "repo": "yandextranslate",
      "releaseType": "release"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ],
      "publisherName": "Yandex Translate",
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    },
    "nsis": {
      "differentialPackage": true,
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    },
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

### Update Configuration

Users can configure update behavior in Settings → Updates:

- **Auto-download**: Automatically download updates in background
- **Allow prerelease**: Receive beta/prerelease versions
- **Skip versions**: Don't be notified about specific versions

## Publishing Updates

### Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **GitHub Token**: Create a Personal Access Token with `repo` scope
3. **Version Update**: Increment version in `package.json`

### Step-by-Step Release Process

#### 1. Update Version

```bash
# Update version in package.json
npm version patch  # or minor, or major
```

#### 2. Build Packages

```bash
npm run build
```

This creates distributable packages in the `dist/` directory.

#### 3. Configure GitHub Token

Set your GitHub token as an environment variable:

**Windows (PowerShell)**:
```powershell
$env:GH_TOKEN="your_github_token_here"
```

**macOS/Linux**:
```bash
export GH_TOKEN=your_github_token_here
```

Or create a `.env` file in the project root:
```
GH_TOKEN=your_github_token_here
```

#### 4. Publish to GitHub Releases

```bash
npm run build:packages
```

electron-builder will:
1. Build the application for all configured platforms
2. Create installers and update packages
3. Upload everything to GitHub Releases
4. Generate `latest.yml` (Windows) / `latest-mac.yml` (macOS) for update checking

### Manual Publishing

If automatic publishing fails, you can manually upload files:

1. Create a new release on GitHub
2. Tag it with the version (e.g., `v0.2.0`)
3. Upload these files from `dist/`:
   - **Windows**: `*.exe`, `*.exe.blockmap`, `latest.yml`
   - **macOS**: `*.dmg`, `*.dmg.blockmap`, `*.zip`, `latest-mac.yml`
   - **Linux**: `*.AppImage`, `*.deb`, `latest-linux.yml`

## Code Signing

Code signing is **critical** for production releases. Unsigned applications trigger security warnings and may not update properly.

### Windows Code Signing

#### Prerequisites

- **Code Signing Certificate**: Purchase from a Certificate Authority (Sectigo, DigiCert, etc.)
- **Certificate File**: Usually a `.pfx` or `.p12` file
- **Password**: For the certificate

#### Configuration

1. **Set Environment Variables**:

```powershell
$env:CSC_LINK="C:\path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD="certificate_password"
```

2. **Alternative: Use Azure Key Vault** (Recommended for CI/CD):

```powershell
$env:AZURE_KEY_VAULT_URI="https://your-vault.vault.azure.net/"
$env:AZURE_CLIENT_ID="your-client-id"
$env:AZURE_CLIENT_SECRET="your-client-secret"
$env:AZURE_TENANT_ID="your-tenant-id"
```

3. **Build Configuration** (already in `package.json`):

```json
{
  "win": {
    "signingHashAlgorithms": ["sha256"],
    "signDlls": true
  }
}
```

#### SmartScreen Reputation

Even with a valid certificate, Windows SmartScreen may show warnings until your app builds reputation:

- **Solution**: Submit your app to Microsoft for reputation building
- **Timeline**: Can take weeks to months
- **Alternative**: Use Extended Validation (EV) certificate for instant reputation

### macOS Code Signing & Notarization

#### Prerequisites

- **Apple Developer Account** ($99/year)
- **Developer ID Application Certificate**
- **App-Specific Password** for notarization

#### Configuration

1. **Install Certificate**:
   - Download from Apple Developer Portal
   - Install in Keychain Access

2. **Set Environment Variables**:

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="your-team-id"
```

3. **Create Entitlements File** (`build/entitlements.mac.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
</dict>
</plist>
```

4. **Create Notarization Script** (`scripts/notarize.js`):

```javascript
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log('Notarizing app...');
  
  await notarize({
    appBundleId: 'com.yandextranslate.app',
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
  
  console.log('Notarization complete');
};
```

5. **Install Notarization Package**:

```bash
npm install --save-dev @electron/notarize
```

### Linux Code Signing

Linux does not require code signing, but you should:

1. Build from a trusted CI/CD system
2. Provide checksums for verification
3. Consider signing AppImages with GPG

## Testing Updates

### Local Testing with Mock Server

1. **Install dev-app-update-server**:

```bash
npm install --save-dev electron-simple-updater
```

2. **Create Test Releases**:

```bash
# Build current version
npm run build

# Update version
npm version patch

# Build new version
npm run build
```

3. **Set up Mock Server**:

Create `test-updates/latest.yml`:

```yaml
version: 0.2.0
files:
  - url: Yandex-Translate-Setup-0.2.0.exe
    sha512: <hash>
    size: <size>
path: Yandex-Translate-Setup-0.2.0.exe
sha512: <hash>
releaseDate: '2024-01-15T10:00:00.000Z'
```

4. **Modify Update URL** (for testing only):

In `src/main/services/updater.ts`:

```typescript
// Add this in constructor for testing
if (process.env.UPDATE_SERVER) {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: process.env.UPDATE_SERVER
  });
}
```

5. **Run with Mock Server**:

```bash
UPDATE_SERVER=http://localhost:8080/updates npm run dev
```

### Production Testing

1. **Create a Pre-release**:
   - Tag version as `v0.2.0-beta.1`
   - Mark as pre-release on GitHub
   - Enable "Allow prerelease" in app settings

2. **Test Update Flow**:
   - Install older version
   - Launch app
   - Check for updates
   - Verify download progress
   - Test installation

3. **Verify Files**:
   - Windows: Check `latest.yml` is accessible
   - macOS: Check `latest-mac.yml` is accessible
   - Verify blockmap files are present

## User Experience

### Automatic Checks

- **Startup Check**: 5 seconds after app launch (production only)
- **Silent**: No notification if up-to-date
- **Frequency**: Once per launch

### Manual Checks

Users can manually check for updates from:

1. **Settings → Updates**: Check for Updates button
2. **Tray Menu**: Check for Updates option

### Update States

**Checking**
- Shows spinner
- "Checking for updates..." message

**Update Available**
- Displays new version number
- Shows release notes (if provided)
- Options: Download, Skip Version, Cancel

**Downloading**
- Progress bar with percentage
- Download speed and size
- Can take several minutes for large updates

**Downloaded**
- "Update ready to install" message
- Options: Install Now (restarts app), Install Later

**No Update Available**
- "You're using the latest version" message

**Error**
- Descriptive error message
- Suggestions for resolution

### Skip Version Feature

Users can skip specific versions:
- Notification won't appear again for that version
- Useful for optional updates
- Can clear skipped versions in settings

### Differential Updates (Windows)

Windows NSIS installer supports differential updates:
- Downloads only changed files
- Significantly smaller download size
- Faster installation
- Requires `differentialPackage: true` in config

## Troubleshooting

### Update Check Fails

**Problem**: "Failed to check for updates"

**Solutions**:
1. Check internet connection
2. Verify GitHub repository is public
3. Check `publish` configuration in `package.json`
4. Ensure `latest.yml` exists in GitHub Release

### Updates Not Detected

**Problem**: App says "up-to-date" but new version exists

**Solutions**:
1. Verify release is not marked as "Pre-release" (unless enabled)
2. Check version comparison (new version must be higher)
3. Verify `latest.yml` contains correct version
4. Check if version was skipped by user

### Download Fails

**Problem**: Download starts but fails

**Solutions**:
1. Check disk space
2. Verify release files are accessible
3. Check firewall/antivirus settings
4. Look for errors in logs (Settings → Logs)

### Installation Fails

**Problem**: Download completes but install fails

**Solutions**:
1. **Windows**: Run as administrator
2. **macOS**: Check Gatekeeper settings
3. **All**: Ensure app is not running multiple instances
4. Check file permissions

### Code Signing Issues

**Problem**: "App is damaged" or "Unknown developer"

**Solutions**:
1. **Windows**: Ensure certificate is valid and not expired
2. **macOS**: Complete notarization process
3. Verify signing with: `codesign -dv --verbose=4 /path/to/app`

### SmartScreen Warnings

**Problem**: Windows shows "Windows protected your PC"

**Solutions**:
1. Use Extended Validation (EV) certificate
2. Build app reputation over time
3. Submit to Microsoft for review
4. Users can click "More info" → "Run anyway"

## Best Practices

1. **Version Numbers**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Release Notes**: Always include clear, user-friendly release notes
3. **Testing**: Test updates thoroughly before releasing
4. **Rollback Plan**: Keep previous versions available
5. **Communication**: Notify users of major changes
6. **Beta Testing**: Use pre-releases for testing with willing users
7. **Code Signing**: Always sign production releases
8. **Automated CI/CD**: Use GitHub Actions for consistent builds

## GitHub Actions Example

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Release
        run: npm run build:packages
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

## Security Considerations

1. **HTTPS Only**: Updates are always downloaded over HTTPS
2. **Signature Verification**: electron-updater verifies signatures
3. **Checksum Validation**: All files verified with SHA512
4. **No Auto-Install**: User must approve installation
5. **Rollback**: Users can reinstall older versions if needed

## Additional Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [electron-builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Windows SmartScreen](https://docs.microsoft.com/en-us/windows/security/threat-protection/microsoft-defender-smartscreen/)
- [macOS Notarization](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
