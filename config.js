require('dotenv').config()

module.exports = {
  before (context) {
    const standalone = process.env.SELENIUM_STANDALONE
    const hostname = process.env.SELENIUM_HUB_HOST
    if (standalone) {
      context.webdriver.standalone = standalone
    } else if (hostname) {
      context.webdriver.hostname = 'localhost'
    } else {
      context.webdriver.browserstack = true
      context.webdriver.capabilities['bstack:options'] = {
        local: true,
        projectName: 'bff-webdriver',
        timezone: 'New_York'
      }
    }
  }
}
