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
      'zal:name': testContext.key
    }
    testContext.capability = Object.assign(options, testContext.capability)
  }

  async report ({ webdriver, testContext }) {
    try {
      const cookie = { name: 'zaleniumTestPassed' }
      let value = 'true'

      if (testContext.result.failed) {
        if (webdriver.zalenium.dashboardUrl) {
          // If the test failed, print the Zalenium Dashboard URL for this
          // session to make it easier for the user to debug.
          const { oneLine } = require('common-tags')
          const query = oneLine`
            ${testContext.capability['zal:name']}
            ${testContext.capability['zal:build']}
          `
          const url = `${webdriver.zalenium.dashboardUrl}?q=${encodeURI(query)}`
          this.print.info('Zalenium session:', url)
        }

        // Set the "passed" value to false.
        value = 'false'
      }

      try {
        // Tell Zalenium the test passed by setting a cookie.
        await testContext.browser.addCookie({ ...cookie, value })
      } catch (err) {
        // Ignore errors from setting the cookie since they are irrelevant to
        // the test.
      }
    } catch (err) {
      this.print.error(err)
    }
  }
}
