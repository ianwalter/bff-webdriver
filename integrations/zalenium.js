require('dotenv').config()

const { Print } = require('@ianwalter/print')

module.exports = class ZaleniumIntegration {
  constructor (context) {
    // Set up a print instance on the integration instance so it can be reused.
    this.print = new Print({ level: context.logLevel })
  }

  static integrate (context) {
    if (context.webdriver.zalenium) {
      context.webdriver.integrations.push(new ZaleniumIntegration(context))
    }
  }

  enhanceCapability (capability, test) {
    const options = {
      // Tell Zalenium the name of the test.
      name: test.name
    }
    capability = Object.assign(options, capability)
  }

  async report ({ webdriver, testContext }) {
    try {
      const cookie = { name: 'zaleniumTestPassed' }
      if (testContext.result.failed) {
        if (webdriver.zalenium.dashboardUrl) {
          // If the test failed, print the Zalenium Dashboard URL for this
          // session to make it easier for the user to debug.
          const { oneLineTrim } = require('common-tags')
          const url = oneLineTrim`
            ${webdriver.zalenium.dashboardUrl}
            ?q=${testContext.browser.sessionId}
          `
          this.print.info('Zalenium session:', url)
        }

        // Tell Zalenium the test failed by setting a cookie.
        await testContext.browser.addCookie({ ...cookie, value: 'false' })
      } else {
        // Tell Zalenium the test passed by setting a cookie.
        await testContext.browser.addCookie({ ...cookie, value: 'true' })
      }
    } catch (err) {
      this.print.error(err)
    }
  }
}
