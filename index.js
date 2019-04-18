const { Print } = require('@ianwalter/print')

module.exports = async function bffWebdriver (hook, context) {
  const print = new Print({ level: context.config.logLevel })
  print.debug(`Hook ${hook}:`, context)

  if (hook === 'before') {
    if (context.config.webdriverBackend === 'browserstack') {
      print.debug('Starting BrowserStadk Local')
      const bsl = require('@ianwalter/bsl')
      context.browserstackLocal = await bsl.start()
    } else if (context.config.webdriverBackend === 'standalone') {
      print.debug('Starting Selenium Standalone')
      return new Promise((resolve, reject) => {
        const seleniumStandalone = require('selenium-standalone')
        const options = { spawnOptions: { stdio: 'inherit' } }
        seleniumStandalone.start(options, (err, child) => {
          if (err) {
            if (child) {
              child.kill()
            }
            reject(err)
          } else {
            context.seleniumStandalone = child
            resolve()
          }
        })
      })
    }
  } else if (hook === 'beforeEach') {
    print.debug('Creating WebdriverIO browser instance')
    // Set up the browser instance and add it to the context.
    // const { remote } = require('webdriverio')
    // const config = {}
    // context.browser = await remote(config)
  } else if (hook === 'adterEach') {
    print.debug('Terminating WebdriverIO browser instance')
    // Tell Selenium to delete the browser session once the test is over.
    // await context.browser.deleteSession()
  } else if (hook === 'after') {
    if (context.seleniumStandalone) {
      print.debug('Stopping Selenium Standalone')
      context.seleniumStandalone.stop()
    } else if (context.browserstackLocal) {
      print.debug('Stopping BrowserStack Local')
      context.browserstackLocal.stop()
    }
  }
}
