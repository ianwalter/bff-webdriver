require('dotenv').config()

module.exports = function setup (hook, context) {
  const user = process.env.BROWSERSTACK_USERNAME
  const key = process.env.BROWSERSTACK_ACCESS_KEY
  if (user && key) {
    context.webdriver.host = 'hub-cloud.browserstack.com'
    context.webdriver.user = user
    context.webdriver.key = key
  }
}
