const { test } = require('@ianwalter/bff')
const { createKoaServer } = require('@ianwalter/test-server')

test('test server', async t => {
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
  t.print.info('Server URL', server.url)
  const url = new URL(server.url)
  if (process.env.TEST_HOST) {
    url.host = process.env.TEST_HOST
  }
  await t.browser.url(url.href)
  t.expect(await t.browser.getTitle()).toBe('Hello World!')
})
