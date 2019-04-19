require('dotenv').config()

module.exports = function setup (hook, context) {
  const user = process.env.BROWSERSTACK_USERNAME
  const key = process.env.BROWSERSTACK_ACCESS_KEY
  const standalone = process.env.SELENIUM_STANDALONE
  if (standalone) {
    context.webdriver.standalone = standalone
  } else if (user && key) {
    context.webdriver.user = user
    context.webdriver.key = key
    context.webdriver.capabilities['browserstack.local'] = true
  }
}
