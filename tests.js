const { test } = require('@ianwalter/bff')
const { createKoaServer } = require('@ianwalter/test-server')

test('test server', async ({ browser, expect }) => {
  const server = await createKoaServer()
  server.use(ctx => {
    ctx.body = `
      <html>
        <head>
          <title>Hello World!</title>
        </head>
        <body>
          <h1>Hello World!</h1>
        </body>
      </html>
    `
  })
  const url = new URL(server.url)
  if (process.env.TEST_HOST) {
    url.host = process.env.TEST_HOST
  }
  await browser.url(url.href)
  expect(await browser.getTitle()).toBe('Hello World!')
})
