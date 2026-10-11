import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Tecrese|Agentverse/)
  })

  test('should have navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
  })
})

test.describe('Admin Login', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})

test.describe('Contact Form', () => {
  test('should submit contact form', async ({ page }) => {
    await page.goto('/contact')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('textarea[name="message"]', 'This is a test message')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Message sent successfully')).toBeVisible()
  })
})

test.describe('Newsletter Signup', () => {
  test('should subscribe with valid email and age', async ({ page }) => {
    await page.goto('/')
    // Assuming newsletter form is in footer
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="age"]', '25')
    await page.click('button:has-text("Subscribe")')
    await expect(page.locator('text=Subscribed successfully')).toBeVisible()
  })

  test('should reject invalid age', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="age"]', '10')
    await page.click('button:has-text("Subscribe")')
    await expect(page.locator('text=You must be at least 13 years old')).toBeVisible()
  })
})

test.describe('Search', () => {
  test('should return search results', async ({ page }) => {
    await page.goto('/search?q=agent')
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })
})