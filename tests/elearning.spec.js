// tests/elearning.spec.js
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('E-Learning Platform - Core flows', () => {
  test('Register -> Login -> Enroll -> Take Quiz -> Logout', async ({ page }) => {
    await page.goto(BASE + '/register.html');
    await page.fill('input[name="username"]', 'playwrightUser');
    const email = `pwuser_${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(500);
    // should be redirected to courses
    await page.goto(BASE + '/courses.html');

    // ensure we are logged in
    await expect(page.locator('text=Hello')).toBeVisible();

    // Open first course
    await page.click('.course-card >> text=Open');
    // Enroll
    await page.click('button:has-text("Enroll")');
    await expect(page.locator('text=Enrolled successfully')).toBeVisible({ timeout: 2000 });

    // Start quiz
    await page.click('button:has-text("Start Quiz")');
    // Select first answer for each question
    const questions = await page.$$('.quiz-question');
    for (let q of questions) {
      const first = await q.$('input[type="radio"]');
      await first.check();
    }
    await page.click('button:has-text("Submit Quiz")');
    await expect(page.locator('text=Score:')).toBeVisible();

    // Logout
    await page.goto(BASE + '/courses.html');
    await page.click('text=Logout');
    await expect(page.locator('text=Login')).toBeVisible();
  });
});
