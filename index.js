const { Print } = require('@ianwalter/print')

let print
let seleniumStandalone

const hasBsl = cap => cap['bstack:options'] && cap['bstack:options'].local
const shouldUseBsl = ({ browserstackLocal, capabilities: cap }) =>
  browserstackLocal !== false &&
  (Array.isArray(cap) ? cap.some(hasBsl) : hasBsl(cap))

module.exports = {
  async before (context) {
    print = new Print({ level: context.logLevel })
    try {
      if (context.webdriver.standalone) {
        print.debug('Starting Selenium Standalone')
        return new Promise((resolve, reject) => {
          const standalone = require('selenium-standalone')
          const spawnOptions = { stdio: 'inherit' }
          const { version, drivers } = context.webdriver || {}

          // Start the Selenium Standalone server.
          standalone.start({ spawnOptions, version, drivers }, (err, child) => {
            if (err) {
              if (child) {
                // If there was an error but a child process was still created,
                // kill the child process.
                child.kill()
              }
              reject(err)
            } else {
              // Assign the child process to the seleniumStandalone variable so
              // that it can be killed later when the after hook runs.
              seleniumStandalone = child
              resolve()
            }
          })
        })
      } else if (shouldUseBsl(context.webdriver)) {
        print.debug('Starting BrowserStack Local')
        const { start } = require('@ianwalter/bsl')

        // Start the BrowserStack Local tunnel.
        await start(context.webdriver.browserstackLocal)
      }
    } catch (err) {
      print.error(err)
    }
  },
  registration ({ registrationContext, webdriver }) {
    try {
      const BrowserStackIntegration = require('./integrations/browserstack')
      const ZaleniumIntegration = require('./integrations/zalenium')

      // TODO: comment
      webdriver.integrations = webdriver.integrations || []
      BrowserStackIntegration.integrate(webdriver)
      ZaleniumIntegration.integrate(webdriver)

      // Extract the WebDriver capabilities from the test configuration.
      const capabilities = Array.isArray(webdriver.capabilities)
        ? webdriver.capabilities
        : [webdriver.capabilities]

      // Go through the browser tests and split them up by capability so that
      // they can be run individually/in parallel.
      registrationContext.tests = registrationContext.tests.reduce(
        (acc, test) => acc.concat(capabilities.map(capability => {
          // Go through each enabled integration and allow it to enahance the
          // webdriver capability.
          const enhanceCapability = i => i.enhanceCapability(capability, test)
          webdriver.integrations.forEach(enhanceCapability)

          // Modify the test name to contain the name of the browser it's being
          // tested in.
          let name = `${test.name} in ${capability.browserName}`

          // Modify the test name to contain the version of the browser it's
          // being tested in, if configured.
          if (capability.browserVersion) {
            name += ` ${capability.browserVersion}`
          }

          // Return the test with it's modified name and capability
          // configuration.
          return { ...test, name, capability }
        })),
        []
      )
    } catch (err) {
      print.error()
    }
  },
  async beforeEach (context) {
    try {
      print.debug('Creating WebdriverIO browser instance')

      // Set up the browser instance and add it to the test context.
      const { remote } = require('webdriverio')
      context.testContext.browser = await remote({
        ...context.webdriver,
        logLevel: context.webdriver.logLevel || context.logLevel,
        capabilities: context.testContext.capability
      })

      // Add the expect instance to the browser instance so that the user can
      // more easily create commands that involve making assertions.
      context.testContext.browser.expect = context.testContext.expect
    } catch (err) {
      print.error(err)
    }
  },
  async afterEach (context) {
    try {
      print.debug('Terminating WebdriverIO browser instance')

      // Go through each enabled integration and report results to it, etc.
      const toReport = async integration => integration.report(context)
      await Promise.all(context.webdriver.integrations.map(toReport))

      // Tell Selenium to delete the browser session once the test is over.
      await context.testContext.browser.deleteSession()
    } catch (err) {
      print.error(err)
    }
  },
  async after (context) {
    if (seleniumStandalone) {
      // Kill the Selenium Standalone child process.
      print.debug('Stopping Selenium Standalone')
      try {
        seleniumStandalone.kill()
      } catch (err) {
        print.error(err)
      }
    } else if (shouldUseBsl(context.webdriver)) {
      // Stop the BrowserStack Local tunnel.
      print.debug('Stopping BrowserStack Local')
      try {
        const { stop } = require('@ianwalter/bsl')
        await stop()
      } catch (err) {
        print.error(err)
      }
    }

    // Run cleanup in case there are any zombie processes hanging around.
    const cleanup = require('./cleanup')
    await cleanup()
  }
}
