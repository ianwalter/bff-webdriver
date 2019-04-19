const { test } = require('@ianwalter/bff')

test('mybinxhealth.com', async ({ browser, expect }) => {
  await browser.url('https://mybinxhealth.com/')
  expect(await browser.getTitle()).toContain('binx health')
})
