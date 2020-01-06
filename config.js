require('dotenv').config()

module.exports = {
  before (context) {
    const standalone = process.env.SELENIUM_STANDALONE
    const appium = process.env.APPIUM
    if (standalone) {
      context.webdriver.standalone = standalone
    } else if (appium && !standalone) {
      context.webdriver.appium = true
    } else {
      context.webdriver.browserstack = true
    }
  }
}
