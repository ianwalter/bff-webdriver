const { Print } = require('@ianwalter/print')

module.exports = class ZaleniumIntegration {
  constructor (context) {
    // Set up a print instance on the integration instance so it can be reused.
    this.print = new Print({ level: context.logLevel })
    this.print.debug('Zalenium integration enabled')
  }

  static integrate (context) {
    if (context.webdriver.zalenium) {
      context.webdriver.integrations.push(new ZaleniumIntegration(context))
    }
  }

  enhanceCapability (testContext) {
    const options = {
      // Tell Zalenium the name of the test.
      name: testContext.key
    }
    testContext.capability = Object.assign(options, testContext.capability)
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
