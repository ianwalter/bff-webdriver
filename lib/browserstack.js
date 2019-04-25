module.exports = {
  options (capability) {
    capability['bstack:options'] = capability['bstack:options'] || {}
    return capability['bstack:options']
  },
  enhanceCapability (config, capability, test) {
    // Check to see if BrowserStack is enabled.
    if (config.browserstack) {
      // Get the BrowserStack options.
      const options = this.options(capability)

      // Tell BrowserStack the name of the test.
      options.name = test.name
    }
  },
  async report (config, context) {
    // Check to see if BrowserStack is enabled.
    if (config.browserstack) {
      const { Print } = require('@ianwalter/print')
      const print = new Print({ level: config.logLevel })
      try {
        const got = require('got')

        // Report the test result to BrowserStack via a HTTP call to the
        // BrowserStack API.
        const baseUrl = 'https://api.browserstack.com/automate/sessions'
        const body = {
          name: context.key,
          status: context.result.failed ? 'error' : 'completed'
        }
        const auth = `${config.user}:${config.key}`
        const path = `${context.browser.sessionId}.json`
        await got(path, { baseUrl, method: 'PUT', auth, json: true, body })

        // If the test failed, print the BrowserStack Dashboard URL for this
        // session to make it easier for the user to debug.
        if (context.result.failed) {
          const response = await got(path, { baseUrl, auth, json: true })
          const url = response.body.automation_session.browser_url
          print.info(`BrowserStack session:`, url)
        }
      } catch (err) {
        print.error(err)
      }
    }
  }
}
