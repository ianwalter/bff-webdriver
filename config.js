require('dotenv').config()

module.exports = {
  before (context) {
    const standalone = process.env.SELENIUM_STANDALONE
    if (standalone) {
      context.webdriver.standalone = standalone
    } else {
      context.webdriver.browserstack = true
    }
  }
}
