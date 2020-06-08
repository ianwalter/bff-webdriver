const { test } = require('@ianwalter/bff')
const { createApp } = require('@ianwalter/nrg')

test('test server', async t => {
  const app = createApp({ log: false })
  app.use(ctx => {
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
  const { server } = await app.start()

  const url = new URL(server.url)
  if (process.env.TEST_HOST) {
    url.host = process.env.TEST_HOST
  }
  t.print.info('Server URL', url)

  try {
    await t.browser.url(url.href)
    t.expect(await t.browser.getTitle()).toBe('Hello World!')
  } finally {
    server.close()
  }
})
