const { Print } = require('@ianwalter/print')

let seleniumStandalone
let browserstackLocal

module.exports = {
  before (context) {
    const print = new Print({ level: context.logLevel })
    const hasBsl = cap => cap['browserstack.local']
    const shouldStartBsl = cap => Array.isArray(cap)
      ? cap.some(hasBsl)
      : hasBsl(cap)

    try {
      if (context.webdriver.standalone) {
        print.debug('Starting Selenium Standalone')
        return new Promise((resolve, reject) => {
          const standalone = require('selenium-standalone')
          const options = { spawnOptions: { stdio: 'inherit' } }

          // Start the Selenium Standalone server.
          standalone.start(options, (err, child) => {
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
      } else if (shouldStartBsl(context.webdriver.capabilities)) {
        print.debug('Starting BrowserStack Local')
        return new Promise((resolve, reject) => {
          const { Local } = require('browserstack-local')

          // Assign the BrowserStack Local instance to the browserstackLocal
          // variable so that it can be stopped later when the after hook runs.
          browserstackLocal = new Local()
          const verbose = context.logLevel === 'debug'
          const options = { force: true, forceLocal: true, verbose }

          // Start the BrowserStack Local tunnel.
          browserstackLocal.start(options, err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }
    } catch (err) {
      print.error(err)
    }
  },
  registration ({ registrationContext, webdriver, logLevel }) {
    const print = new Print({ level: logLevel })
    try {
      const browserstack = require('./lib/browserstack')

      // Extract the WebDriver capabilities from the test configuration.
      const capabilities = Array.isArray(webdriver.capabilities)
        ? webdriver.capabilities
        : [webdriver.capabilities]

      // Go through the browser tests and split them up by capability so that
      // they can be run individually/in parallel.
      registrationContext.tests = registrationContext.tests.reduce(
        (acc, test) => acc.concat(capabilities.map(capability => {
          // If BrowserStack is enabled, enhance the capability with data from
          // the test.
          browserstack.enhanceCapability(webdriver, capability, test)

          // Modify the test name to contain the name of the browser it's being
          // tested in.
          let name = `${test.name} in ${capability.browserName}`

          // Modify the test name to contain the version of the browser it's
          // being tested in, if configured.
          if (capability.browserVersion) {
            name += ` ${capability.browserVersion}`
          }

          // Modify the test name to contain the name of the OS the browser it's
          // being tested in is running in, if configured.
          if (browserstack.os) {
            name += ` on ${browserstack.os}`
          }

          // Modify the test name to contain the name of the OS version the
          // browser it's being test in is running in, if configured.
          if (browserstack.osVersion) {
            name += ` ${browserstack.osVersion}`
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
    const print = new Print({ level: context.logLevel })
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
    const print = new Print({ level: context.logLevel })
    try {
      print.debug('Terminating WebdriverIO browser instance')

      // Tell Selenium to delete the browser session once the test is over.
      await context.testContext.browser.deleteSession()
    } catch (err) {
      print.error(err)
    }
  },
  after (context) {
    const print = new Print({ level: context.logLevel })
    try {
      if (seleniumStandalone) {
        // Kill the Selenium Standalone child process.
        print.debug('Stopping Selenium Standalone')
        seleniumStandalone.kill()
      } else if (browserstackLocal) {
        // Stop the BrowserStack Local tunnel.
        print.debug('Stopping BrowserStack Local')
        browserstackLocal.stop()
      }
    } catch (err) {
      print.error(err)
    }
  }
}
