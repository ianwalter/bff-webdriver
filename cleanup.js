const fkill = require('fkill')

module.exports = async function cleanup () {
  const processes = [
    'selenium',
    'webdriver',
    'chromedriver',
    'geckodriver'
  ]
  await fkill(processes, { force: true, silent: true })
}
