async function install () {
  const selenium = require('selenium-standalone')
  try {
    await new Promise((resolve, reject) => {
      selenium.install({ logger: console.log }, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  } catch (err) {
    console.error(err)
  }
}

//
if (process.env.SELENIUM_STANDALONE) {
  install()
}
