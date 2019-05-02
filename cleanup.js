const fkill = require('fkill')

module.exports = async function cleanup () {
  await fkill([
    'selenium',
    'webdriver',
    'chromedriver',
    'geckodriver',
    'marionette'
  ])
}
