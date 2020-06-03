const { test } = require('@ianwalter/bff')

test('Login button has correct text', async t => {
  await t.browser.navigateTo('http://localhost:1234/')
  const loginButton = await t.browser.getElement('#loginLink')
  t.expect(await loginButton.getText()).toBe('Login')
})
