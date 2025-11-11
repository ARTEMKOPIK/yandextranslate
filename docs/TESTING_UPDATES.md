# Testing Auto-Updates Locally

This guide explains how to test the auto-update functionality locally before publishing to production.

## Overview

Testing auto-updates requires:
1. Building two versions of the app (old and new)
2. Setting up a local update server or using dev-app-update.yml
3. Configuring the app to check the local server
4. Testing the update flow

## Method 1: Using dev-app-update.yml (Simplest)

This method uses a configuration file that electron-updater can read during development.

### Step 1: Build Current Version

```bash
# Ensure you're on version 0.1.0 (or whatever your current version is)
npm run build
```

Install the built application from `dist/` directory.

### Step 2: Create New Version

```bash
# Update version in package.json
npm version patch  # This bumps to 0.1.1

# Build new version
npm run build
```

### Step 3: Create dev-app-update.yml

In your project root, create `dev-app-update.yml`:

**For Windows:**
```yaml
version: 0.1.1
files:
  - url: file:///C:/path/to/your/project/dist/Yandex-Translate-Setup-0.1.1.exe
    sha512: <base64-encoded-sha512>
    size: <file-size-in-bytes>
path: Yandex-Translate-Setup-0.1.1.exe
sha512: <base64-encoded-sha512>
releaseDate: '2024-01-15T10:00:00.000Z'
releaseNotes: |
  Test release notes
  - New feature 1
  - Bug fix 2
```

**For macOS:**
```yaml
version: 0.1.1
files:
  - url: file:///Users/you/path/to/project/dist/Yandex-Translate-0.1.1.dmg
    sha512: <base64-encoded-sha512>
    size: <file-size-in-bytes>
path: Yandex-Translate-0.1.1.dmg
sha512: <base64-encoded-sha512>
releaseDate: '2024-01-15T10:00:00.000Z'
releaseNotes: |
  Test release notes
  - New feature 1
  - Bug fix 2
```

### Step 4: Generate SHA512 Hashes

**On Windows (PowerShell):**
```powershell
$hash = Get-FileHash -Algorithm SHA512 "dist\Yandex-Translate-Setup-0.1.1.exe"
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($hash.Hash))
```

**On macOS/Linux:**
```bash
openssl dgst -sha512 -binary dist/Yandex-Translate-0.1.1.dmg | openssl base64
```

### Step 5: Get File Size

**Windows (PowerShell):**
```powershell
(Get-Item "dist\Yandex-Translate-Setup-0.1.1.exe").Length
```

**macOS/Linux:**
```bash
stat -f%z dist/Yandex-Translate-0.1.1.dmg  # macOS
stat -c%s dist/Yandex-Translate-0.1.1.dmg  # Linux
```

### Step 6: Modify Updater Code (Temporarily)

In `src/main/services/updater.ts`, add to the constructor:

```typescript
private constructor() {
  // ... existing code ...

  // DEV ONLY: Use local dev-app-update.yml
  if (isDev) {
    const path = require('path');
    autoUpdater.updateConfigPath = path.join(__dirname, '../../../dev-app-update.yml');
  }
}
```

### Step 7: Test Update Flow

1. Launch the installed **old version** (0.1.0)
2. Go to Settings → Updates
3. Click "Check for Updates"
4. You should see update available notification
5. Click "Download Update"
6. Monitor download progress
7. When complete, click "Install Now"
8. App should restart with new version

## Method 2: Using Local HTTP Server

For a more realistic test that mimics production:

### Step 1: Install http-server

```bash
npm install -g http-server
```

### Step 2: Create Update Directory

```bash
mkdir test-updates
cp dist/Yandex-Translate-Setup-0.1.1.exe test-updates/
# Also copy .blockmap file
cp dist/Yandex-Translate-Setup-0.1.1.exe.blockmap test-updates/
```

### Step 3: Create latest.yml

In `test-updates/latest.yml`:

```yaml
version: 0.1.1
files:
  - url: Yandex-Translate-Setup-0.1.1.exe
    sha512: <base64-sha512>
    size: <size>
path: Yandex-Translate-Setup-0.1.1.exe
sha512: <base64-sha512>
releaseDate: '2024-01-15T10:00:00.000Z'
```

### Step 4: Start HTTP Server

```bash
cd test-updates
http-server -p 8080 --cors
```

### Step 5: Modify Updater Code

In `src/main/services/updater.ts`:

```typescript
private constructor() {
  // ... existing code ...

  // DEV ONLY: Use local server
  if (isDev) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'http://localhost:8080',
      channel: 'latest'
    });
  }
}
```

### Step 6: Rebuild and Test

```bash
npm run build:main  # Rebuild main process with modified updater
```

Then follow the testing steps from Method 1.

## Method 3: Using GitHub Releases (Pre-release)

For the most realistic test:

### Step 1: Create Pre-release on GitHub

1. Push your code to GitHub
2. Create a new release with tag `v0.1.1-beta.1`
3. Mark it as "Pre-release"
4. Upload your built packages manually

### Step 2: Enable Pre-release in App

1. Install old version
2. Go to Settings → Updates
3. Enable "Allow prerelease"
4. Check for updates

### Step 3: Test Update

Follow normal update flow.

## Verification Checklist

After installing the update, verify:

- [ ] Version number updated correctly
- [ ] App launches without errors
- [ ] Settings preserved
- [ ] History/favorites intact
- [ ] All features work as expected

## Common Issues

### Update Not Detected

**Problem**: App says "up to date" but you know there's a new version

**Solutions**:
1. Check version in dev-app-update.yml is higher than installed version
2. Verify file paths are correct (use file:/// protocol)
3. Check SHA512 hash matches the actual file
4. Ensure old version is actually installed (not running from source)

### Download Fails

**Problem**: Download starts but fails immediately

**Solutions**:
1. Check file exists at specified URL
2. Verify file permissions
3. Check disk space
4. Look at logs in Settings → Logs

### Installation Fails

**Problem**: Download completes but install doesn't work

**Solutions**:
1. Run old version as administrator
2. Check antivirus isn't blocking
3. Ensure no other instances are running
4. Check file isn't corrupted (verify SHA512)

## Cleanup

After testing, remember to:

1. Remove temporary modifications to `updater.ts`
2. Rebuild: `npm run build:main`
3. Delete `dev-app-update.yml` if created
4. Uninstall test versions
5. Remove `test-updates/` directory

## Production Testing

Before releasing to production:

1. Test on a clean machine (VM recommended)
2. Test with real GitHub releases (use pre-release)
3. Test with code-signed builds
4. Test differential updates (Windows)
5. Test on all target platforms
6. Test "Skip version" functionality
7. Test with slow network connection
8. Test with network interruption

## Debugging

Enable verbose logging in updater service by setting:

```typescript
autoUpdater.logger = {
  info: (msg) => {
    console.log('[AutoUpdater]', msg);
    logger.info(msg, 'AutoUpdater');
  },
  warn: (msg) => {
    console.warn('[AutoUpdater]', msg);
    logger.warn(msg, 'AutoUpdater');
  },
  error: (msg) => {
    console.error('[AutoUpdater]', msg);
    logger.error(msg, 'AutoUpdater');
  },
  debug: (msg) => {
    console.log('[AutoUpdater DEBUG]', msg);
    logger.debug(msg, 'AutoUpdater');
  }
};
```

Then check:
- Application logs (Settings → Logs)
- DevTools console
- Network tab in DevTools

## Additional Resources

- [electron-updater Testing Guide](https://www.electron.build/auto-update#debugging)
- [Generating Test Updates](https://www.electron.build/tutorials/test-update-on-s3)
- [Update Server Setup](https://www.electron.build/tutorials/release-using-channels)
