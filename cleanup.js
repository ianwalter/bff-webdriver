const execa = require('execa')

module.exports = async function cleanup () {
  const processes = [
    'selenium',
    'webdriver',
    'chromedriver',
    'geckodriver'
  ]
  try {
    await execa('pkill', '-f', ...processes)
  } catch (err) {
    // We don't care about errors like pkill is not installed, etc.
  }
}
