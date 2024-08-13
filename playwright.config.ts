import { defineConfig } from '@playwright/test'

const port = '1234'
const url = `http://localhost:${port}`

export default defineConfig({
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: url,
  },
})
