require('dotenv').config()

const { Print } = require('@ianwalter/print')

module.exports = class BrowserStackIntegration {
  constructor (context) {
    // Set up a print instance on the integration instance so it can be reused.
    this.print = new Print({ level: context.logLevel })

    // TODO:
    this.options = {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY
    }
  }

  static integrate (context) {
    if (context.webdriver.browserstack) {
      context.webdriver.integrations.push(new BrowserStackIntegration(context))
    }
  }

  enhanceCapability (capability, test) {
    const options = {
      // Tell BrowserStack the name of the test.
      name: test.name
    }
    capability['bstack:options'] = Object.assign(
      options,
      this.options,
      capability['bstack:options']
    )
  }

  async report ({ webdriver, testContext }) {
    try {
      const got = require('got')

      // Report the test result to BrowserStack via a HTTP call to the
      // BrowserStack API.
      const baseUrl = 'https://api.browserstack.com/automate/sessions'
      const body = {
        name: testContext.key,
        status: testContext.result.failed ? 'error' : 'completed'
      }
      const auth = `${webdriver.user}:${webdriver.key}`
      const path = `${testContext.browser.sessionId}.json`
      await got(path, { baseUrl, method: 'PUT', auth, json: true, body })

      // If the test failed, print the BrowserStack Dashboard URL for this
      // session to make it easier for the user to debug.
      if (testContext.result.failed) {
        const response = await got(path, { baseUrl, auth, json: true })
        const url = response.body.automation_session.browser_url
        this.print.info('BrowserStack session:', url)
      }
    } catch (err) {
      this.print.error(err)
    }
  }
}
