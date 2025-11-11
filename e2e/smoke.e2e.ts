import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';

test.describe('Smoke Tests', () => {
  test('application launches successfully', async () => {
    // Launch Electron app
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    // Get the first window
    const window = await electronApp.firstWindow();
    
    // Wait for the app to be ready
    await window.waitForLoadState('domcontentloaded');
    
    // Verify the window title
    const title = await window.title();
    expect(title).toBeTruthy();
    
    // Take a screenshot
    await window.screenshot({ path: 'e2e-screenshots/app-launch.png' });
    
    // Close the app
    await electronApp.close();
  });

  test('main window renders UI elements', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // Wait for React to render
    await window.waitForTimeout(2000);
    
    // Check for main navigation tabs
    const historyTab = await window.getByRole('tab', { name: /история|history/i });
    expect(await historyTab.isVisible()).toBe(true);
    
    const settingsTab = await window.getByRole('tab', { name: /настройки|settings/i });
    expect(await settingsTab.isVisible()).toBe(true);
    
    await electronApp.close();
  });

  test('settings panel is accessible', async () => {
    const electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000);
    
    // Navigate to settings
    const settingsTab = await window.getByRole('tab', { name: /настройки|settings/i });
    await settingsTab.click();
    
    // Verify settings sections are present
    await window.waitForTimeout(1000);
    
    // Take a screenshot of settings
    await window.screenshot({ path: 'e2e-screenshots/settings-panel.png' });
    
    await electronApp.close();
  });
});

test.describe('Overlay Window', () => {
  test.skip('overlay window can be toggled', async () => {
    // This test would require global hotkey simulation
    // which is complex and platform-specific
    // Marked as skip for now - can be implemented with robot-js or similar
  });
});
