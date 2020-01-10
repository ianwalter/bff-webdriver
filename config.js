require('dotenv').config()

module.exports = {
  before (context) {
    const standalone = process.env.SELENIUM_STANDALONE
    const hostname = process.env.SELENIUM_HUB_HOST
    if (standalone) {
      context.webdriver.standalone = standalone
    } else if (hostname) {
      context.webdriver.hostname = hostname
    } else {
      context.webdriver.browserstack = true
    }
  }
}
