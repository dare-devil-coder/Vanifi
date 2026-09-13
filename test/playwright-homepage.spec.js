const { test, expect } = require('@playwright/test');

test('homepage loads and has key CTA', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Vani-Fi/i);
  await expect(page.getByRole('link', { name: /Explore Vani-Fi/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /A bank that understands/i })).toBeVisible();
});

test('assistant page loads and chat input is visible', async ({ page }) => {
  await page.goto('http://localhost:3000/app/assistant');
  await expect(page.getByRole('heading', { name: /Ask Vani/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Tell Vani what is on your mind/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Send message/i })).toBeVisible();
});
