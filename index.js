const { Print } = require('@ianwalter/print')

const hasBslKey = cap => cap.hasOwnProperty('browserstack.local')

function shouldStartBsl (capabilities) {
  if (Array.isArray(capabilities)) {
    return capabilities.some(hasBslKey)
  } else {
    return hasBslKey(capabilities)
  }
}
function toBrowserTest (test) {
  return capability => {
    //
    capability.name = test.name

    //
    let name = `${test.name} in ${capability.browserName}`
    if (capability.browserVersion) {
      name += ` ${capability.browserVersion}`
    }
    if (capability.platformName) {
      name += ` on ${capability.platformName}`
    }
    return { ...test, name, capability }
  }
}
function toBrowserTests (capabilties) {
  return (acc, test) => acc.concat(capabilties.map(toBrowserTest(test)))
}

module.exports = async function bffWebdriver (hook, context) {
  const print = new Print({ level: context.logLevel })
  print.debug(`Hook ${hook}:`, context)

  const multipleCapabilities = Array.isArray(context.webdriver.capabilities)
  if (hook === 'registration' && multipleCapabilities) {
    const registrationContext = context.registrationContext
    registrationContext.tests = registrationContext.tests.reduce(
      toBrowserTests(context.webdriver.capabilities),
      []
    )
  } else if (hook === 'before') {
    if (process.env.SELENIUM_STANDALONE) {
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
    } else if (shouldStartBsl(context.webdriver.capabilities)) {
      print.debug('Starting BrowserStadk Local')
      const bsl = require('@ianwalter/bsl')
      context.browserstackLocal = await bsl.start()
    }
  } else if (hook === 'beforeEach') {
    print.debug('Creating WebdriverIO browser instance')

    // Set up the browser instance and add it to the test context.
    const { remote } = require('webdriverio')
    context.testContext.browser = await remote({
      ...context.webdriver,
      capabilities: context.testContext.test.capability
    })
  } else if (hook === 'adterEach') {
    print.debug('Terminating WebdriverIO browser instance')

    // Tell Selenium to delete the browser session once the test is over.
    await context.testContext.browser.deleteSession()
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
