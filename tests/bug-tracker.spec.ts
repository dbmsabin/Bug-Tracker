import { test, expect } from '@playwright/test';

test.describe('Bug Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to have a clean slate with just the seeded bugs
    await page.addInitScript(() => {
      window.localStorage.removeItem('bug-tracker-data');
    });
    await page.goto('/');
  });

  test('creating a bug appears in the table', async ({ page }) => {
    await page.getByRole('button', { name: /Report Bug/i }).first().click();
    
    await page.getByLabel('Title').fill('Test Bug Creation');
    await page.getByLabel('Description').fill('This is a test description.');
    
    // Select severity
    const dialog = page.getByRole('dialog');
    await dialog.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'High' }).click();
    
    // Select status
    await dialog.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option', { name: 'Open' }).click();

    await page.getByLabel('Steps to Reproduce').fill('1. Do this\n2. Do that');
    
    await page.getByRole('button', { name: 'Submit Bug' }).click();

    // Verify it appears in the table
    await expect(page.getByRole('cell', { name: 'Test Bug Creation' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'High' }).last()).toBeVisible();
  });

  test('form validation shows an error when the title is empty', async ({ page }) => {
    await page.getByRole('button', { name: /Report Bug/i }).first().click();
    
    // Fill other fields but leave title empty
    await page.getByLabel('Description').fill('This is a test description.');
    await page.getByLabel('Steps to Reproduce').fill('1. Do this');
    
    await page.getByRole('button', { name: 'Submit Bug' }).click();

    // Verify validation error is visible
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('filtering by severity shows only matching bugs', async ({ page }) => {
    // The seeded data has 1 Critical bug.
    // Open the severity filter select
    const filtersContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-3');
    await filtersContainer.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Critical' }).click();

    // Now the table should only show Critical bugs
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    // seeded bugs have exactly 1 critical bug
    expect(rowCount).toBe(1);
    await expect(tableRows.first()).toContainText('Critical');
  });
});
