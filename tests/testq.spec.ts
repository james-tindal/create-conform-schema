import { test, expect } from '@playwright/test'

test('refine', async ({ page }) => {
  await page.goto('/signup')
})


// What am I testing?

// Test each of the refine context methods works

// skip, validateOnServer, addIssue, path
