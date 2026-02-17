
import { test, expect } from '@playwright/test';

test.describe('Authenticated Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page and perform a demo login
    await page.goto('/');
    // Wait for the login form to be visible
    await expect(page.locator('input[placeholder="OPERATOR EMAIL"]')).toBeVisible();
    // Click the "1-Time Access Demo" button
    await page.click('button:has-text("1-Time Access Demo")');
    // Wait for navigation to the main app (e.g., by waiting for the main header)
    await expect(page.locator('h1:has-text("Vizual X //")')).toBeVisible();
  });

  test('should navigate to the Monaco editor page', async ({ page }) => {
    // From the main page, find and click the navigation button for Monaco
    await page.click('nav button:has-text("Monaco")');
  
    // Verify that the EditorSuite component is now visible
    // Check for the updated "Workspace Nodes" text
    const editorHeader = page.locator('h3:has-text("Workspace Nodes")');
    await expect(editorHeader).toBeVisible();

    // Also check that the active page in the header has updated
    await expect(page.locator('h1:has-text("Vizual X // EDITOR")')).toBeVisible();
  });
});